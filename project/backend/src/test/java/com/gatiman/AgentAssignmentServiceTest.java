package com.gatiman;

import com.gatiman.dto.agent.AssignmentResponse;
import com.gatiman.entity.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.*;
import com.gatiman.service.AgentAssignmentService;
import com.gatiman.service.AgentEligibilityService;
import com.gatiman.service.AuditService;
import com.gatiman.service.NotificationService;
import com.gatiman.service.TrackingService;
import com.gatiman.service.impl.AgentAssignmentServiceImpl;
import com.gatiman.service.impl.AgentEligibilityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgentAssignmentServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DeliveryAgentRepository agentRepository;

    @Mock
    private OrderAssignmentRepository assignmentRepository;

    @Mock
    private DeliveryAttemptRepository attemptRepository;

    @Mock
    private TrackingService trackingService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    private AgentEligibilityService eligibilityService;
    private AgentAssignmentService assignmentService;

    private Zone southDelhiZone;
    private Zone northDelhiZone;
    private DeliveryAgent agent1;
    private DeliveryAgent agent2;
    private Order order;

    @BeforeEach
    void setUp() {
        eligibilityService = new AgentEligibilityServiceImpl();
        assignmentService = new AgentAssignmentServiceImpl(
                orderRepository,
                agentRepository,
                assignmentRepository,
                attemptRepository,
                eligibilityService,
                trackingService,
                notificationService,
                auditService
        );

        southDelhiZone = Zone.builder().id(1L).name("South Delhi Express Zone").build();
        northDelhiZone = Zone.builder().id(2L).name("North Delhi Zone").build();

        User user1 = User.builder().id(101L).firstName("Rajesh").lastName("Kumar").phoneNumber("+91 98999 11223").role(Role.DELIVERY_AGENT).build();
        User user2 = User.builder().id(102L).firstName("Amit").lastName("Singh").phoneNumber("+91 98777 44556").role(Role.DELIVERY_AGENT).build();

        agent1 = DeliveryAgent.builder()
                .id(1L)
                .user(user1)
                .vehicleNumber("DL-03-EV-9821")
                .assignedZone(southDelhiZone)
                .active(true)
                .isAvailable(true)
                .currentActiveOrders(1)
                .maxActiveOrders(5)
                .currentLatitude(28.5535)
                .currentLongitude(77.2007)
                .build();

        agent2 = DeliveryAgent.builder()
                .id(2L)
                .user(user2)
                .vehicleNumber("DL-01-BK-4532")
                .assignedZone(northDelhiZone)
                .active(true)
                .isAvailable(true)
                .currentActiveOrders(3)
                .maxActiveOrders(5)
                .currentLatitude(28.7041)
                .currentLongitude(77.1025)
                .build();

        order = Order.builder()
                .id(10L)
                .trackingNumber("GTM-20260820-000010")
                .status(OrderStatus.CREATED)
                .pickupZone(southDelhiZone)
                .build();
    }

    @Test
    @DisplayName("Auto-assign selects nearest same-zone agent with lower workload")
    void testAutoAssignSelectsBestAgent() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(agentRepository.findAll()).thenReturn(List.of(agent1, agent2));

        AssignmentResponse resp = assignmentService.autoAssign(10L);

        assertNotNull(resp);
        assertEquals(1L, resp.getAgentId());
        assertEquals("Rajesh Kumar", resp.getAgentName());
        assertEquals("AUTO", resp.getAssignmentType());
        assertEquals("ASSIGNED", resp.getStatus());
        verify(orderRepository).save(any(Order.class));
        verify(assignmentRepository).save(any(OrderAssignment.class));
    }

    @Test
    @DisplayName("Reject auto-assignment when order is already in ASSIGNED state")
    void testRejectDoubleAssignment() {
        order.setStatus(OrderStatus.ASSIGNED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        assertThrows(BusinessRuleException.class, () -> assignmentService.autoAssign(10L));
    }
}
