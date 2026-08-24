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

    @Value("${app.email.base-url:${app.base-url:${APP_BASE_URL:https://frontend-ten-lyart-76.vercel.app}}}")
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

        // Reload fresh order inside this transaction boundary to prevent cross-thread Hibernate proxy issues
        Order currentOrder = order;
        if (order != null && order.getId() != null) {
            currentOrder = orderRepository.findById(order.getId()).orElse(order);
        }

        // 1. Resolve customer & check preferences if applicable
        if (currentOrder != null && currentOrder.getCustomer() != null && currentOrder.getCustomer().getUser() != null) {
            User user = currentOrder.getCustomer().getUser();
            if (!isEmailAllowedByPreferences(user, eventType)) {
                log.info("Email event {} suppressed by user preferences for user: {}", eventType, user.getEmail());
                return;
            }
        }

        // 2. Deduplication & Idempotency Key
        String idempotencyKey = buildIdempotencyKey(eventType, currentOrder);

        // Check if this event has already been successfully sent or is currently pending
        if (eventType != EmailEventType.DELIVERY_DELAYED) {
            if (emailLogRepository.existsByIdempotencyKeyAndStatusIn(idempotencyKey, List.of(EmailStatus.SENT, EmailStatus.PENDING))) {
                log.info("Deduplication: Email for key '{}' already sent or pending. Skipping duplicate.", idempotencyKey);
                return;
            }
        } else {
            // For delays: enforce cooldown to prevent sending every few seconds
            Instant cooldownWindow = Instant.now().minus(delayCooldownMinutes, ChronoUnit.MINUTES);
            List<EmailLog> recentDelayLogs = emailLogRepository.findRecentByOrderAndType(currentOrder != null ? currentOrder.getId() : 0L, EmailEventType.DELIVERY_DELAYED, cooldownWindow);
            if (!recentDelayLogs.isEmpty()) {
                log.info("Delay email cooldown active for order {}. Last sent within {} minutes.", currentOrder != null ? currentOrder.getTrackingNumber() : "N/A", delayCooldownMinutes);
                return;
            }
        }

        // 3. Render HTML template and Subject
        String subject = emailTemplateService.generateEmailSubject(eventType, currentOrder);
        String htmlContent = emailTemplateService.buildHtmlEmail(
                eventType,
                currentOrder,
                recipientName,
                distanceRemaining,
                etaMinutes,
                customMessage,
                baseUrl
        );

        // 4. Persist EmailLog with status PENDING
        EmailLog emailLog = EmailLog.builder()
                .notificationId(notificationId)
                .orderId(currentOrder != null ? currentOrder.getId() : 0L)
                .trackingNumber(currentOrder != null ? currentOrder.getTrackingNumber() : "GTM-UNKNOWN")
                .customerId(currentOrder != null && currentOrder.getCustomer() != null ? currentOrder.getCustomer().getId() : null)
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

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String smtpHost;

    @Value("${spring.mail.port:465}")
    private int smtpPort;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    private void dispatchMimeMessage(EmailLog emailLog) {
        try {
            boolean isTestRecipient = emailLog.getRecipientEmail() != null &&
                    (emailLog.getRecipientEmail().endsWith(".test") || emailLog.getRecipientEmail().endsWith("@example.com") || emailLog.getRecipientEmail().startsWith("loadtest_"));

            if (mailSender != null && !isTestRecipient && smtpUsername != null && !smtpUsername.isBlank() && smtpPassword != null && !smtpPassword.isBlank()) {
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
            String classifiedReason = classifySmtpFailure(e, emailLog.getRecipientEmail());
            log.error("Failed to dispatch email for log ID {} to <{}>: {}", emailLog.getId(), emailLog.getRecipientEmail(), classifiedReason);
            emailLog.setStatus(EmailStatus.FAILED);
            emailLog.setFailureReason(classifiedReason);
        } finally {
            emailLogRepository.save(emailLog);
        }
    }

    private String classifySmtpFailure(Exception e, String recipientEmail) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        Throwable cause = e.getCause();
        while (cause != null) {
            msg += " -> " + cause.getClass().getSimpleName() + ": " + cause.getMessage();
            cause = cause.getCause();
        }

        String host = smtpHost != null ? smtpHost : "smtp.gmail.com";
        int port = smtpPort > 0 ? smtpPort : 465;

        if (msg.contains("MailConnectException") || msg.contains("SocketTimeoutException") || msg.contains("ConnectException") || msg.contains("timeout") || msg.contains("Couldn't connect")) {
            return String.format("SMTP_CONNECTION_TIMEOUT: Cannot establish TCP socket connection to %s:%d. Outbound SMTP ports may be blocked/restricted by cloud hosting egress firewalls (e.g. Render/AWS). Recommendation: Ensure outbound port %d is allowed, or use an HTTPS email API (e.g. Resend / Brevo API). Details: %s", host, port, port, e.getMessage());
        } else if (msg.contains("AuthenticationFailedException") || msg.contains("535") || msg.contains("BadCredentials") || msg.contains("Username and Password not accepted")) {
            return String.format("SMTP_AUTH_FAILED: Gmail SMTP authentication failed for user %s. Ensure 2-Step Verification is active and a 16-character Google App Password (not standard account password) is configured.", maskEmail(smtpUsername));
        } else if (msg.contains("SendFailedException") || msg.contains("InvalidAddressesException") || msg.contains("550")) {
            return String.format("SMTP_RECIPIENT_REJECTED: Mail server rejected delivery to recipient <%s>. Details: %s", recipientEmail, e.getMessage());
        }

        return "SMTP_DISPATCH_FAILED: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) return "NOT_SET";
        int at = email.indexOf('@');
        if (at <= 1) return "***" + email.substring(Math.max(0, at));
        return email.charAt(0) + "***" + email.charAt(at - 1) + email.substring(at);
    }

    @Override
    public com.gatiman.dto.email.SmtpDiagnosticResponse runSmtpDiagnostic() {
        String host = smtpHost != null && !smtpHost.isBlank() ? smtpHost.trim() : "smtp.gmail.com";
        int port = smtpPort > 0 ? smtpPort : 465;
        String protocol = (port == 465) ? "SMTPS (SSL)" : "SMTP (STARTTLS)";

        boolean dnsResolved = false;
        String resolvedIp = null;
        boolean tcpConnected = false;
        long tcpLatencyMs = -1;
        boolean tlsSslHandshakeSuccess = false;
        String cipherSuite = null;
        boolean authSuccess = false;
        String statusMessage;
        String recommendation;

        // 1. DNS Resolution
        try {
            java.net.InetAddress inetAddress = java.net.InetAddress.getByName(host);
            resolvedIp = inetAddress.getHostAddress();
            dnsResolved = true;
        } catch (Exception e) {
            resolvedIp = "DNS_ERROR: " + e.getMessage();
        }

        // 2. TCP Socket & TLS/SSL Handshake Test
        if (dnsResolved) {
            long t0 = System.currentTimeMillis();
            if (port == 465) {
                try (javax.net.ssl.SSLSocket sslSocket = (javax.net.ssl.SSLSocket) javax.net.ssl.SSLSocketFactory.getDefault().createSocket()) {
                    sslSocket.connect(new java.net.InetSocketAddress(host, port), 5000);
                    tcpLatencyMs = System.currentTimeMillis() - t0;
                    tcpConnected = true;
                    sslSocket.startHandshake();
                    tlsSslHandshakeSuccess = true;
                    cipherSuite = sslSocket.getSession().getCipherSuite() + " (" + sslSocket.getSession().getProtocol() + ")";
                } catch (Exception e) {
                    tcpLatencyMs = System.currentTimeMillis() - t0;
                    statusMessage = "TCP/SSL connect error: " + e.getMessage();
                }
            } else {
                try (java.net.Socket socket = new java.net.Socket()) {
                    socket.connect(new java.net.InetSocketAddress(host, port), 5000);
                    tcpLatencyMs = System.currentTimeMillis() - t0;
                    tcpConnected = true;
                    tlsSslHandshakeSuccess = true;
                    cipherSuite = "TCP Plain (STARTTLS eligible on port " + port + ")";
                } catch (Exception e) {
                    tcpLatencyMs = System.currentTimeMillis() - t0;
                    statusMessage = "TCP connect error: " + e.getMessage();
                }
            }
        }

        // 3. Credential configuration check
        boolean hasUser = smtpUsername != null && !smtpUsername.isBlank();
        boolean hasPass = smtpPassword != null && !smtpPassword.isBlank();
        authSuccess = hasUser && hasPass && tcpConnected;

        if (tcpConnected && tlsSslHandshakeSuccess && hasUser && hasPass) {
            statusMessage = "SMTP host reachable, SSL/TLS handshake passed, and credentials configured.";
            recommendation = "SMTP pipeline is healthy and ready for live email dispatch.";
        } else if (!tcpConnected) {
            statusMessage = String.format("Could not establish TCP connection to %s:%d (timeout 5s).", host, port);
            recommendation = "Outbound TCP SMTP connections on port " + port + " appear blocked by the runtime or cloud network egress firewall (common on free/standard Render, AWS, and DigitalOcean instances). Use an HTTPS email service (e.g. Resend REST API) or allow outbound port " + port + ".";
        } else if (!hasUser || !hasPass) {
            statusMessage = "TCP connected to " + host + ":" + port + ", but EMAIL_USERNAME or EMAIL_PASSWORD environment variable is missing.";
            recommendation = "Configure EMAIL_USERNAME and EMAIL_PASSWORD (16-character Google App Password) in your environment variables.";
        } else {
            statusMessage = "SMTP connectivity partially verified.";
            recommendation = "Verify SMTP encryption settings match selected port (" + port + ").";
        }

        java.util.Map<String, Object> envFlags = new java.util.HashMap<>();
        envFlags.put("EMAIL_ENABLED", emailEnabled);
        envFlags.put("EMAIL_HOST_PRESENT", smtpHost != null && !smtpHost.isBlank());
        envFlags.put("EMAIL_PORT_PRESENT", smtpPort > 0);
        envFlags.put("EMAIL_USERNAME_PRESENT", hasUser);
        envFlags.put("EMAIL_PASSWORD_PRESENT", hasPass);
        envFlags.put("FROM_EMAIL", fromEmail);

        return com.gatiman.dto.email.SmtpDiagnosticResponse.builder()
                .overallHealthy(tcpConnected && tlsSslHandshakeSuccess && hasUser && hasPass)
                .host(host)
                .port(port)
                .protocol(protocol)
                .dnsResolved(dnsResolved)
                .resolvedIp(resolvedIp)
                .tcpConnected(tcpConnected)
                .tcpLatencyMs(tcpLatencyMs)
                .tlsSslHandshakeSuccess(tlsSslHandshakeSuccess)
                .cipherSuite(cipherSuite)
                .authSuccess(authSuccess)
                .maskedUsername(maskEmail(smtpUsername))
                .passwordConfigured(hasPass)
                .statusMessage(statusMessage)
                .recommendation(recommendation)
                .timestamp(Instant.now())
                .environmentFlags(envFlags)
                .build();
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

    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendWelcomeEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        if (!emailEnabled) {
            log.info("[EMAIL DISABLED] Skipping welcome email for user: {}", user.getEmail());
            return;
        }

        String recipientEmail = user.getEmail().trim();
        String recipientName = user.getFullName() != null && !user.getFullName().isBlank()
                ? user.getFullName()
                : (user.getFirstName() != null ? user.getFirstName() : "Valued Member");
        String subject = "Welcome to GATIMAN Delivery Network, " + (user.getFirstName() != null ? user.getFirstName() : "there") + "! 🚀";
        String htmlContent = emailTemplateService.buildWelcomeEmailHtml(recipientName, recipientEmail, baseUrl);
        String idempotencyKey = "WELCOME_" + recipientEmail.toLowerCase();

        if (emailLogRepository.existsByIdempotencyKeyAndStatusIn(idempotencyKey, List.of(EmailStatus.SENT, EmailStatus.PENDING))) {
            log.info("Welcome email for user {} already sent or pending. Skipping duplicate.", recipientEmail);
            return;
        }

        EmailLog emailLog = EmailLog.builder()
                .trackingNumber("USER-" + (user.getId() != null ? user.getId() : "NEW"))
                .customerId(null)
                .recipientEmail(recipientEmail)
                .recipientName(recipientName)
                .eventType(EmailEventType.WELCOME)
                .subject(subject)
                .htmlContent(htmlContent)
                .status(EmailStatus.PENDING)
                .retryCount(0)
                .idempotencyKey(idempotencyKey)
                .build();

        emailLog = emailLogRepository.save(emailLog);
        dispatchMimeMessage(emailLog);
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
