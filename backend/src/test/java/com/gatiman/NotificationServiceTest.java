package com.gatiman;

import com.gatiman.entity.*;
import com.gatiman.enums.NotificationType;
import com.gatiman.enums.Role;
import com.gatiman.repository.NotificationRepository;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.channel.NotificationChannel;
import com.gatiman.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationChannel inAppChannel;
    @Mock private NotificationChannel emailChannel;

    private NotificationServiceImpl notificationService;

    private User customerUser;
    private User agentUser;
    private User adminUser;
    private Customer customer;
    private DeliveryAgent agent;
    private Order order;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(
                notificationRepository,
                userRepository,
                List.of(inAppChannel, emailChannel)
        );

        customerUser = User.builder().id(1L).email("customer@gatiman.local").firstName("Priya").lastName("Sharma").role(Role.CUSTOMER).build();
        agentUser = User.builder().id(2L).email("agent@gatiman.local").firstName("Rajesh").lastName("Kumar").role(Role.DELIVERY_AGENT).build();
        adminUser = User.builder().id(3L).email("admin@gatiman.local").firstName("Admin").lastName("Ops").role(Role.ADMIN).build();

        customer = Customer.builder().id(10L).user(customerUser).build();
        agent = DeliveryAgent.builder().id(5L).user(agentUser).vehicleNumber("DL-03-EV-9821").build();

        order = Order.builder()
                .id(100L)
                .trackingNumber("GTM-20260820-100")
                .customer(customer)
                .assignedAgent(agent)
                .build();
    }

    @Test
    @DisplayName("Broadcasts notification across both in-app and email channels")
    void testSendNotificationBroadcastsToChannels() {
        notificationService.sendNotification(customerUser, order, NotificationType.ORDER_CREATED, "Order Confirmed", "Confirmed");

        verify(inAppChannel).send(eq(customerUser), eq(order), eq(NotificationType.ORDER_CREATED), eq("Order Confirmed"), eq("Confirmed"));
        verify(emailChannel).send(eq(customerUser), eq(order), eq(NotificationType.ORDER_CREATED), eq("Order Confirmed"), eq("Confirmed"));
    }

    @Test
    @DisplayName("notifyDeliveryFailed notifies both customer and system admins")
    void testNotifyDeliveryFailedBroadcastsToCustomerAndAdmins() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(adminUser));

        notificationService.notifyDeliveryFailed(order, "Customer was unavailable");

        // Should notify customer
        verify(inAppChannel).send(eq(customerUser), eq(order), eq(NotificationType.DELIVERY_FAILED), any(), any());
        // Should notify admin
        verify(inAppChannel).send(eq(adminUser), eq(order), eq(NotificationType.DELIVERY_FAILED), any(), any());
    }

    @Test
    @DisplayName("getUnreadCount retrieves unread notification count from repository")
    void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(4L);

        long count = notificationService.getUnreadCount(1L);

        assertEquals(4L, count);
        verify(notificationRepository).countByUserIdAndIsReadFalse(1L);
    }
}
