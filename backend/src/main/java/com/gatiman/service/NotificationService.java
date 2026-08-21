package com.gatiman.service;

import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Notification;
import com.gatiman.entity.Order;
import com.gatiman.entity.RescheduleRequest;
import com.gatiman.entity.User;
import com.gatiman.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(User recipient, Order order, NotificationType type, String title, String message);
    Notification createNotification(User recipient, Order order, String type, String title, String message);

    void notifyOrderCreated(Order order);
    void notifyAgentAssigned(Order order, DeliveryAgent agent);
    void notifyPickedUp(Order order);
    void notifyInTransit(Order order);
    void notifyOutForDelivery(Order order);
    void notifyDelivered(Order order);
    void notifyDeliveryFailed(Order order, String reason);
    void notifyRescheduleRequested(Order order, RescheduleRequest request);
    void notifyRescheduleApproved(Order order, RescheduleRequest request, DeliveryAgent nextAgent);
    void notifyRescheduleRejected(Order order, String rejectionReason);
    void notifyAgentReassigned(Order order, DeliveryAgent previousAgent, DeliveryAgent newAgent);

    List<Notification> getUserNotifications(Long userId);
    Page<Notification> getUserNotifications(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
