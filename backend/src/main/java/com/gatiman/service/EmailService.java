package com.gatiman.service;

import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.EmailLog;
import com.gatiman.entity.Order;
import com.gatiman.enums.EmailEventType;

public interface EmailService {

    void sendEmail(
            EmailEventType eventType,
            Order order,
            String recipientEmail,
            String recipientName,
            Double distanceRemaining,
            Integer etaMinutes,
            String customMessage,
            Long notificationId
    );

    void sendOrderCreatedEmail(Order order);

    void sendOrderConfirmedEmail(Order order);

    void sendAgentAssignedEmail(Order order, DeliveryAgent agent);

    void sendOrderPreparingEmail(Order order);

    void sendOrderReadyEmail(Order order);

    void sendPickedUpEmail(Order order);

    void sendOnTheWayEmail(Order order, Double distanceKm, Integer etaMinutes);

    void sendNearDestinationEmail(Order order, Double distanceKm, Integer etaMinutes);

    void sendDeliveredEmail(Order order);

    void sendCancelledEmail(Order order, String reason);

    void sendDeliveryDelayedEmail(Order order, Integer delayMinutes, String reason, Double distanceKm, Integer etaMinutes);

    void sendDeliveryFailedEmail(Order order, String reason);

    void sendRescheduledEmail(Order order, String requestedDate, String slot);

    void sendWelcomeEmail(com.gatiman.entity.User user);

    EmailLog retryEmail(Long emailLogId);

    void sendTestEmail(String toEmail, EmailEventType eventType, Long orderId);

    com.gatiman.dto.email.SmtpDiagnosticResponse runSmtpDiagnostic();
}
