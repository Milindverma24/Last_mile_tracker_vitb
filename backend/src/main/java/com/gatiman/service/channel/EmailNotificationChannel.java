package com.gatiman.service.channel;

import com.gatiman.entity.Order;
import com.gatiman.entity.User;
import com.gatiman.enums.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class EmailNotificationChannel implements NotificationChannel {

    @Override
    public String getChannelName() {
        return "EMAIL";
    }

    @Override
    @Async
    public void send(User recipient, Order order, NotificationType type, String title, String message) {
        if (recipient == null || recipient.getEmail() == null) return;
        try {
            // Emulated high-speed SMTP / SES gateway dispatch
            log.info("[EMAIL DISPATCH - {}] To: <{}> | Subject: [{}] | Content: {}",
                    type, recipient.getEmail(), title, message);
        } catch (Exception e) {
            // Async graceful exception handling to guarantee isolation from database transaction
            log.warn("Non-fatal email dispatch failure to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }
}
