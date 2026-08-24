package com.gatiman;

import com.gatiman.dto.admin.AnalyticsResponse;
import com.gatiman.dto.admin.DashboardResponse;
import com.gatiman.entity.*;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.FailureReason;
import com.gatiman.enums.OrderStatus;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.DeliveryAttemptRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.service.impl.AnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private DeliveryAgentRepository deliveryAgentRepository;
    @Mock private DeliveryAttemptRepository deliveryAttemptRepository;
    @Mock private ZoneRepository zoneRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private Zone zone;
    private DeliveryAgent agent;
    private Order order1;
    private Order order2;
    private DeliveryAttempt attemptFailed;

    @BeforeEach
    void setUp() {
        zone = Zone.builder().id(1L).code("DL-SOUTH").name("South Delhi Express Zone").build();

        agent = DeliveryAgent.builder()
                .id(1L)
                .user(User.builder().firstName("Rajesh").lastName("Kumar").phoneNumber("+91 98999 11223").build())
                .vehicleNumber("DL-03-EV-9821")
                .vehicleType(com.gatiman.enums.VehicleType.EV_SCOOTER)
                .assignedZone(zone)
                .currentActiveOrders(1)
                .maxActiveOrders(5)
                .active(true)
                .isAvailable(true)
                .build();

        order1 = Order.builder()
                .id(101L)
                .customerType(CustomerType.B2C)
                .status(OrderStatus.DELIVERED)
                .pickupZone(zone)
                .dropZone(zone)
                .assignedAgent(agent)
                .baseCharge(new BigDecimal("100.00"))
                .codSurcharge(BigDecimal.ZERO)
                .totalCharge(new BigDecimal("100.00"))
                .createdAt(Instant.now())
                .build();

        order2 = Order.builder()
                .id(102L)
                .customerType(CustomerType.B2B)
                .status(OrderStatus.FAILED)
                .pickupZone(zone)
                .dropZone(zone)
                .assignedAgent(agent)
                .baseCharge(new BigDecimal("150.00"))
                .codSurcharge(new BigDecimal("20.00"))
                .totalCharge(new BigDecimal("170.00"))
                .createdAt(Instant.now())
                .build();

        attemptFailed = DeliveryAttempt.builder()
                .id(1L)
                .order(order2)
                .agent(agent)
                .status("FAILED")
                .failureReason(FailureReason.CUSTOMER_UNAVAILABLE)
                .build();
    }

    @Test
    @DisplayName("Dashboard summary correctly aggregates metrics from active database records")
    void testGetDashboardSummary() {
        when(orderRepository.findAll()).thenReturn(List.of(order1, order2));
        when(deliveryAgentRepository.findAll()).thenReturn(List.of(agent));

        DashboardResponse summary = analyticsService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(2L, summary.getTotalOrders());
        assertEquals(1L, summary.getDeliveredOrders());
        assertEquals(1L, summary.getFailedOrders());
        assertEquals(1L, summary.getAvailableAgents());
        assertEquals(new BigDecimal("270.00"), summary.getTotalRevenue());
    }

    @Test
    @DisplayName("Order analytics correctly computes delivery success rate and failure rate")
    void testGetOrderAnalytics() {
        when(orderRepository.findAll()).thenReturn(List.of(order1, order2));

        AnalyticsResponse.OrderAnalyticsDto analytics = analyticsService.getOrderAnalytics("7d");

        assertNotNull(analytics);
        assertEquals(2L, analytics.getTotalOrders());
        assertEquals(1L, analytics.getDeliveredOrders());
        assertEquals(1L, analytics.getFailedOrders());
        assertEquals(50.0, analytics.getSuccessRate());
        assertEquals(50.0, analytics.getFailureRate());
    }

    @Test
    @DisplayName("Failure analytics groups failure reasons correctly")
    void testGetFailureAnalytics() {
        when(deliveryAttemptRepository.findAll()).thenReturn(List.of(attemptFailed));

        AnalyticsResponse.FailureAnalyticsDto failures = analyticsService.getFailureAnalytics();

        assertNotNull(failures);
        assertEquals(1L, failures.getTotalFailures());
        assertEquals(1L, failures.getFailureByReason().get("CUSTOMER_UNAVAILABLE"));
    }
}
