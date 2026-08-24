package com.gatiman.service.impl;

import com.gatiman.entity.*;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.EmailStatus;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.EmailLogRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.EmailService;
import com.gatiman.service.EmailTemplateService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final EmailLogRepository emailLogRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EmailTemplateService emailTemplateService;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.email.from-address:no-reply@gatiman.in}")
    private String fromEmail;

    @Value("${app.email.from-name:GATIMAN Logistics}")
    private String fromName;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.email.delay-cooldown-minutes:30}")
    private int delayCooldownMinutes;

    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendEmail(
            EmailEventType eventType,
            Order order,
            String recipientEmail,
            String recipientName,
            Double distanceRemaining,
            Integer etaMinutes,
            String customMessage,
            Long notificationId
    ) {
        if (!emailEnabled) {
            log.info("[EMAIL DISABLED] Skipping email dispatch for event {} on order {}",
                    eventType, order != null ? order.getTrackingNumber() : "N/A");
            return;
        }

        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Cannot send email for event {}: Recipient email is null/empty", eventType);
            return;
        }

        // 1. Resolve customer & check preferences if applicable
        if (order != null && order.getCustomer() != null && order.getCustomer().getUser() != null) {
            User user = order.getCustomer().getUser();
            if (!isEmailAllowedByPreferences(user, eventType)) {
                log.info("Email event {} suppressed by user preferences for user: {}", eventType, user.getEmail());
                return;
            }
        }

        // 2. Deduplication & Idempotency Key
        String idempotencyKey = buildIdempotencyKey(eventType, order);

        // Check if this event has already been successfully sent or is currently pending
        if (eventType != EmailEventType.DELIVERY_DELAYED) {
            if (emailLogRepository.existsByIdempotencyKeyAndStatusIn(idempotencyKey, List.of(EmailStatus.SENT, EmailStatus.PENDING))) {
                log.info("Deduplication: Email for key '{}' already sent or pending. Skipping duplicate.", idempotencyKey);
                return;
            }
        } else {
            // For delays: enforce cooldown to prevent sending every few seconds
            Instant cooldownWindow = Instant.now().minus(delayCooldownMinutes, ChronoUnit.MINUTES);
            List<EmailLog> recentDelayLogs = emailLogRepository.findRecentByOrderAndType(order.getId(), EmailEventType.DELIVERY_DELAYED, cooldownWindow);
            if (!recentDelayLogs.isEmpty()) {
                log.info("Delay email cooldown active for order {}. Last sent within {} minutes.", order.getTrackingNumber(), delayCooldownMinutes);
                return;
            }
        }

        // 3. Render HTML template and Subject
        String subject = emailTemplateService.generateEmailSubject(eventType, order);
        String htmlContent = emailTemplateService.buildHtmlEmail(
                eventType,
                order,
                recipientName,
                distanceRemaining,
                etaMinutes,
                customMessage,
                baseUrl
        );

        // 4. Persist EmailLog with status PENDING
        EmailLog emailLog = EmailLog.builder()
                .notificationId(notificationId)
                .orderId(order != null ? order.getId() : 0L)
                .trackingNumber(order != null ? order.getTrackingNumber() : "GTM-UNKNOWN")
                .customerId(order != null && order.getCustomer() != null ? order.getCustomer().getId() : null)
                .recipientEmail(recipientEmail)
                .recipientName(recipientName)
                .eventType(eventType)
                .subject(subject)
                .htmlContent(htmlContent)
                .status(EmailStatus.PENDING)
                .retryCount(0)
                .idempotencyKey(idempotencyKey)
                .distanceRemaining(distanceRemaining)
                .etaMinutes(etaMinutes)
                .build();

        emailLog = emailLogRepository.save(emailLog);

        // 5. Dispatch Email via JavaMailSender
        dispatchMimeMessage(emailLog);
    }

    private void dispatchMimeMessage(EmailLog emailLog) {
        try {
            boolean isTestRecipient = emailLog.getRecipientEmail() != null &&
                    (emailLog.getRecipientEmail().endsWith(".test") || emailLog.getRecipientEmail().endsWith("@example.com") || emailLog.getRecipientEmail().startsWith("loadtest_"));

            if (mailSender != null && !isTestRecipient) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                helper.setFrom(fromEmail, fromName);
                helper.setTo(emailLog.getRecipientEmail());
                helper.setSubject(emailLog.getSubject());
                helper.setText(emailLog.getHtmlContent(), true);

                mailSender.send(mimeMessage);

                emailLog.setStatus(EmailStatus.SENT);
                emailLog.setSentAt(Instant.now());
                emailLog.setFailureReason(null);
                log.info("[EMAIL SENT - {}] Successfully dispatched to <{}> for order #{}",
                        emailLog.getEventType(), emailLog.getRecipientEmail(), emailLog.getTrackingNumber());
            } else {
                // Emulated mode for local testing without configured external SMTP provider or load tests
                emailLog.setStatus(EmailStatus.SENT);
                emailLog.setSentAt(Instant.now());
                log.info("[EMAIL EMULATED DISPATCH - {}] Sent to <{}> | Subject: [{}] | Order: #{}",
                        emailLog.getEventType(), emailLog.getRecipientEmail(), emailLog.getSubject(), emailLog.getTrackingNumber());
            }
        } catch (Exception e) {
            log.error("Failed to dispatch email for log ID {}: {}", emailLog.getId(), e.getMessage(), e);
            emailLog.setStatus(EmailStatus.FAILED);
            emailLog.setFailureReason(e.getMessage());
        } finally {
            emailLogRepository.save(emailLog);
        }
    }

    @Override
    @Transactional
    public EmailLog retryEmail(Long emailLogId) {
        EmailLog logEntry = emailLogRepository.findById(emailLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Email log not found with ID: " + emailLogId));

        logEntry.setStatus(EmailStatus.RETRYING);
        logEntry.setRetryCount(logEntry.getRetryCount() + 1);
        emailLogRepository.save(logEntry);

        dispatchMimeMessage(logEntry);
        return logEntry;
    }

    @Override
    @Transactional
    public void sendTestEmail(String toEmail, EmailEventType eventType, Long orderId) {
        if (!emailEnabled) {
            log.info("[EMAIL DISABLED] Skipping test email dispatch to {}", toEmail);
            return;
        }

        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send test email: Recipient email is null/empty");
            return;
        }

        Order order = null;
        if (orderId != null) {
            order = orderRepository.findById(orderId).orElse(null);
        }
        if (order == null) {
            order = orderRepository.findAll().stream().findFirst().orElse(null);
        }

        String recipientName = (order != null && order.getCustomer() != null && order.getCustomer().getUser() != null)
                ? order.getCustomer().getUser().getFullName() : "Operations Admin";

        EmailEventType targetType = eventType != null ? eventType : EmailEventType.ON_THE_WAY;
        String subject = "[TEST] " + emailTemplateService.generateEmailSubject(targetType, order);
        String htmlContent = emailTemplateService.buildHtmlEmail(
                targetType,
                order,
                recipientName,
                2.4,
                12,
                "This is a test notification generated from the GATIMAN Email Management Hub.",
                baseUrl
        );

        String testIdempotencyKey = "TEST_" + toEmail + "_" + targetType.name() + "_" + Instant.now().toEpochMilli();

        EmailLog emailLog = EmailLog.builder()
                .notificationId(null)
                .orderId(order != null ? order.getId() : 0L)
                .trackingNumber(order != null ? order.getTrackingNumber() : "GTM-TEST")
                .customerId(order != null && order.getCustomer() != null ? order.getCustomer().getId() : null)
                .recipientEmail(toEmail)
                .recipientName(recipientName)
                .eventType(targetType)
                .subject(subject)
                .htmlContent(htmlContent)
                .status(EmailStatus.PENDING)
                .retryCount(0)
                .idempotencyKey(testIdempotencyKey)
                .distanceRemaining(2.4)
                .etaMinutes(12)
                .build();

        emailLog = emailLogRepository.save(emailLog);
        dispatchMimeMessage(emailLog);
    }

    // Specific Milestones
    @Override
    public void sendOrderCreatedEmail(Order order) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.ORDER_CREATED, order, email, name, null, null, null, null);
    }

    @Override
    public void sendOrderConfirmedEmail(Order order) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.ORDER_CONFIRMED, order, email, name, null, null, null, null);
    }

    @Override
    public void sendAgentAssignedEmail(Order order, DeliveryAgent agent) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        String msg = agent != null ?
                String.format("Delivery partner %s has been assigned and is en route to pickup.", agent.getName()) : null;
        sendEmail(EmailEventType.AGENT_ASSIGNED, order, email, name, null, null, msg, null);
    }

    @Override
    public void sendOrderPreparingEmail(Order order) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.ORDER_PREPARING, order, email, name, null, null, null, null);
    }

    @Override
    public void sendOrderReadyEmail(Order order) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.ORDER_READY, order, email, name, null, null, null, null);
    }

    @Override
    public void sendPickedUpEmail(Order order) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.PICKED_UP, order, email, name, null, null, null, null);
    }

    @Override
    public void sendOnTheWayEmail(Order order, Double distanceKm, Integer etaMinutes) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.ON_THE_WAY, order, email, name, distanceKm, etaMinutes, null, null);
    }

    @Override
    public void sendNearDestinationEmail(Order order, Double distanceKm, Integer etaMinutes) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.NEAR_DESTINATION, order, email, name, distanceKm, etaMinutes, null, null);
    }

    @Override
    public void sendDeliveredEmail(Order order) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        sendEmail(EmailEventType.DELIVERED, order, email, name, 0.0, 0, null, null);
    }

    @Override
    public void sendCancelledEmail(Order order, String reason) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        String msg = reason != null ? "Your order was cancelled. Reason: " + reason : null;
        sendEmail(EmailEventType.DELIVERY_CANCELLED, order, email, name, null, null, msg, null);
    }

    @Override
    public void sendDeliveryDelayedEmail(Order order, Integer delayMinutes, String reason, Double distanceKm, Integer etaMinutes) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        String msg = reason != null ? "Estimated delay of ~" + delayMinutes + " mins. Reason: " + reason : null;
        sendEmail(EmailEventType.DELIVERY_DELAYED, order, email, name, distanceKm, etaMinutes, msg, null);
    }

    @Override
    public void sendDeliveryFailedEmail(Order order, String reason) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        String msg = reason != null ? "Delivery attempt failed. Reason: " + reason + ". Please reschedule your delivery slot." : null;
        sendEmail(EmailEventType.DELIVERY_FAILED, order, email, name, null, null, msg, null);
    }

    @Override
    public void sendRescheduledEmail(Order order, String requestedDate, String slot) {
        if (order == null) return;
        String email = getCustomerEmail(order);
        String name = getCustomerName(order);
        String msg = String.format("Your delivery has been rescheduled for %s (%s).", requestedDate, slot != null ? slot : "Standard Slot");
        sendEmail(EmailEventType.RESCHEDULE_APPROVED, order, email, name, null, null, msg, null);
    }

    private String getCustomerEmail(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            return order.getCustomer().getUser().getEmail();
        }
        return null;
    }

    private String getCustomerName(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            return order.getCustomer().getUser().getFullName();
        }
        return order.getDropName() != null ? order.getDropName() : "Valued Customer";
    }

    private String buildIdempotencyKey(EmailEventType eventType, Order order) {
        if (order == null) {
            return "GLOBAL_" + eventType.name() + "_" + Instant.now().toEpochMilli();
        }
        if (eventType == EmailEventType.DELIVERY_DELAYED) {
            return order.getId() + "_" + eventType.name() + "_" + Instant.now().getEpochSecond() / (delayCooldownMinutes * 60);
        }
        return order.getId() + "_" + eventType.name();
    }

    private boolean isEmailAllowedByPreferences(User user, EmailEventType eventType) {
        // Critical transactional emails are always mandatory
        if (eventType == EmailEventType.ORDER_CONFIRMED ||
            eventType == EmailEventType.DELIVERED ||
            eventType == EmailEventType.DELIVERY_CANCELLED ||
            eventType == EmailEventType.DELIVERY_FAILED) {
            return true;
        }

        UserPreference pref = user.getUserPreference();
        if (pref == null) {
            return true; // Default enabled
        }

        return switch (eventType) {
            case ORDER_CREATED, ORDER_PREPARING, ORDER_READY -> pref.getOrderUpdates() == null || pref.getOrderUpdates();
            case AGENT_ASSIGNED, PICKED_UP, ON_THE_WAY, OUT_FOR_DELIVERY, NEAR_DESTINATION, DELIVERY_DELAYED ->
                    pref.getDeliveryUpdates() == null || pref.getDeliveryUpdates();
            case RESCHEDULE_APPROVED, RESCHEDULE_REJECTED ->
                    pref.getRescheduleUpdates() == null || pref.getRescheduleUpdates();
            default -> true;
        };
    }
}
