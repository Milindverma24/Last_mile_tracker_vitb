package com.gatiman.service.channel;

import com.gatiman.entity.Order;
import com.gatiman.entity.User;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.NotificationType;
import com.gatiman.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationChannel implements NotificationChannel {

    private final EmailService emailService;

    @Override
    public String getChannelName() {
        return "EMAIL";
    }

    @Override
    @Async
    public void send(User recipient, Order order, NotificationType type, String title, String message) {
        if (recipient == null || recipient.getEmail() == null) return;
        try {
            EmailEventType eventType = mapToEmailEventType(type);
            String recipientName = recipient.getFullName();

            emailService.sendEmail(
                    eventType,
                    order,
                    recipient.getEmail(),
                    recipientName,
                    null,
                    null,
                    message,
                    null
            );
            log.debug("Email notification channel successfully dispatched for {} [Type: {}]", recipient.getEmail(), eventType);
        } catch (Exception e) {
            log.warn("Non-fatal email dispatch failure to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    private EmailEventType mapToEmailEventType(NotificationType type) {
        if (type == null) return EmailEventType.ORDER_CREATED;
        return switch (type) {
            case ORDER_CREATED -> EmailEventType.ORDER_CREATED;
            case ORDER_CONFIRMED -> EmailEventType.ORDER_CONFIRMED;
            case AGENT_ASSIGNED, AGENT_REASSIGNED -> EmailEventType.AGENT_ASSIGNED;
            case ORDER_PREPARING -> EmailEventType.ORDER_PREPARING;
            case ORDER_READY -> EmailEventType.ORDER_READY;
            case PICKED_UP -> EmailEventType.PICKED_UP;
            case IN_TRANSIT -> EmailEventType.ON_THE_WAY;
            case OUT_FOR_DELIVERY -> EmailEventType.OUT_FOR_DELIVERY;
            case NEAR_DESTINATION -> EmailEventType.NEAR_DESTINATION;
            case DELIVERED -> EmailEventType.DELIVERED;
            case DELIVERY_FAILED -> EmailEventType.DELIVERY_FAILED;
            case DELIVERY_DELAYED -> EmailEventType.DELIVERY_DELAYED;
            case DELIVERY_CANCELLED -> EmailEventType.DELIVERY_CANCELLED;
            case RESCHEDULE_APPROVED -> EmailEventType.RESCHEDULE_APPROVED;
            case RESCHEDULE_REJECTED -> EmailEventType.RESCHEDULE_REJECTED;
            default -> EmailEventType.ORDER_CREATED;
        };
    }
}
