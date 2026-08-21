package com.gatiman.service.impl;

import com.gatiman.entity.*;
import com.gatiman.enums.NotificationType;
import com.gatiman.enums.Role;
import com.gatiman.repository.NotificationRepository;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.NotificationService;
import com.gatiman.service.channel.NotificationChannel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final List<NotificationChannel> notificationChannels;

    @Override
    @Transactional
    public Notification sendNotification(User recipient, Order order, NotificationType type, String title, String message) {
        if (recipient == null) return null;

        // Broadcast to all active notification channels (In-App, Email, etc.)
        for (NotificationChannel channel : notificationChannels) {
            try {
                channel.send(recipient, order, type, title, message);
            } catch (Exception e) {
                log.warn("Channel {} failed for user {}: {}", channel.getChannelName(), recipient.getEmail(), e.getMessage());
            }
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(recipient.getId())
                .stream().findFirst().orElse(null);
    }

    @Override
    @Transactional
    public Notification createNotification(User recipient, Order order, String typeStr, String title, String message) {
        NotificationType type;
        try {
            type = NotificationType.valueOf(typeStr);
        } catch (Exception e) {
            type = NotificationType.ORDER_CREATED;
        }
        return sendNotification(recipient, order, type, title, message);
    }

    @Override
    @Transactional
    public void notifyOrderCreated(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.ORDER_CREATED,
                    "Order Confirmed — " + order.getTrackingNumber(),
                    String.format("Your shipment of ₹%s is confirmed and registered with GATIMAN network.", order.getTotalCharge())
            );
        }
    }

    @Override
    @Transactional
    public void notifyAgentAssigned(Order order, DeliveryAgent agent) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.AGENT_ASSIGNED,
                    "Delivery Driver Assigned — " + order.getTrackingNumber(),
                    String.format("Delivery partner %s (%s) has been assigned to your delivery.", agent.getName(), agent.getVehicleNumber())
            );
        }
        if (agent.getUser() != null) {
            sendNotification(
                    agent.getUser(),
                    order,
                    NotificationType.AGENT_ASSIGNED,
                    "New Dispatch Task — " + order.getTrackingNumber(),
                    String.format("You have been assigned shipment %s from PIN %s to PIN %s.",
                            order.getTrackingNumber(), order.getPickupPincode(), order.getDropPincode())
            );
        }
    }

    @Override
    @Transactional
    public void notifyPickedUp(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.PICKED_UP,
                    "Package Picked Up — " + order.getTrackingNumber(),
                    "Our delivery agent has picked up your parcel from origin."
            );
        }
    }

    @Override
    @Transactional
    public void notifyInTransit(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.IN_TRANSIT,
                    "In Transit — " + order.getTrackingNumber(),
                    "Your shipment is in transit between logistics hubs."
            );
        }
    }

    @Override
    @Transactional
    public void notifyOutForDelivery(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.OUT_FOR_DELIVERY,
                    "Out for Delivery — " + order.getTrackingNumber(),
                    "Our delivery partner is in your sector with your parcel."
            );
        }
    }

    @Override
    @Transactional
    public void notifyDelivered(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.DELIVERED,
                    "Delivered Successfully — " + order.getTrackingNumber(),
                    "Your package was successfully delivered to the destination."
            );
        }
    }

    @Override
    @Transactional
    public void notifyDeliveryFailed(Order order, String reason) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.DELIVERY_FAILED,
                    "Delivery Attempt Failed — " + order.getTrackingNumber(),
                    "Our delivery partner was unable to deliver your package. Reason: " + reason + ". Please reschedule your delivery slot."
            );
        }

        // Notify Admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            sendNotification(
                    admin,
                    order,
                    NotificationType.DELIVERY_FAILED,
                    "SLA Alert: Delivery Failed — " + order.getTrackingNumber(),
                    String.format("Order %s failed delivery attempt. Reason: %s.", order.getTrackingNumber(), reason)
            );
        }
    }

    @Override
    @Transactional
    public void notifyRescheduleRequested(Order order, RescheduleRequest request) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            sendNotification(
                    admin,
                    order,
                    NotificationType.RESCHEDULE_REQUESTED,
                    "Reschedule Request Pending — " + order.getTrackingNumber(),
                    String.format("Customer requested new delivery date %s for failed shipment %s.",
                            request.getRequestedDate(), order.getTrackingNumber())
            );
        }
    }

    @Override
    @Transactional
    public void notifyRescheduleApproved(Order order, RescheduleRequest request, DeliveryAgent nextAgent) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.RESCHEDULE_APPROVED,
                    "Reschedule Approved — " + order.getTrackingNumber(),
                    String.format("Your delivery has been rescheduled for %s. A driver has been assigned.", request.getRequestedDate())
            );
        }
        if (nextAgent != null && nextAgent.getUser() != null) {
            sendNotification(
                    nextAgent.getUser(),
                    order,
                    NotificationType.RESCHEDULE_APPROVED,
                    "Rescheduled Dispatch Task — " + order.getTrackingNumber(),
                    String.format("Assigned rescheduled shipment %s for delivery on %s.",
                            order.getTrackingNumber(), request.getRequestedDate())
            );
        }
    }

    @Override
    @Transactional
    public void notifyRescheduleRejected(Order order, String rejectionReason) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.RESCHEDULE_REJECTED,
                    "Reschedule Request Rejected — " + order.getTrackingNumber(),
                    "Your reschedule request was rejected. Reason: " + rejectionReason
            );
        }
    }

    @Override
    @Transactional
    public void notifyAgentReassigned(Order order, DeliveryAgent previousAgent, DeliveryAgent newAgent) {
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            sendNotification(
                    order.getCustomer().getUser(),
                    order,
                    NotificationType.AGENT_REASSIGNED,
                    "Delivery Driver Reassigned — " + order.getTrackingNumber(),
                    String.format("Your shipment has been reassigned to driver %s (%s).", newAgent.getName(), newAgent.getVehicleNumber())
            );
        }
        if (newAgent != null && newAgent.getUser() != null) {
            sendNotification(
                    newAgent.getUser(),
                    order,
                    NotificationType.AGENT_REASSIGNED,
                    "Reassigned Dispatch Task — " + order.getTrackingNumber(),
                    String.format("You have been assigned shipment %s.", order.getTrackingNumber())
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
