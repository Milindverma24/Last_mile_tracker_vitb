package com.gatiman.service.channel;

import com.gatiman.entity.Order;
import com.gatiman.entity.User;
import com.gatiman.enums.NotificationType;

public interface NotificationChannel {
    String getChannelName();
    void send(User recipient, Order order, NotificationType type, String title, String message);
}
