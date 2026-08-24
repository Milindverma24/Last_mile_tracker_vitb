package com.gatiman.service.channel;

import com.gatiman.entity.Notification;
import com.gatiman.entity.Order;
import com.gatiman.entity.User;
import com.gatiman.enums.NotificationType;
import com.gatiman.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class InAppNotificationChannel implements NotificationChannel {

    private final NotificationRepository notificationRepository;

    @Override
    public String getChannelName() {
        return "IN_APP";
    }

    @Override
    public void send(User recipient, Order order, NotificationType type, String title, String message) {
        if (recipient == null) return;
        try {
            Notification notification = Notification.builder()
                    .user(recipient)
                    .order(order)
                    .type(type)
                    .title(title)
                    .message(message)
                    .isRead(false)
                    .read(false)
                    .createdAt(Instant.now())
                    .build();
            notificationRepository.save(notification);
            log.debug("In-app notification persisted for user: {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to persist in-app notification: {}", e.getMessage(), e);
        }
    }
}
