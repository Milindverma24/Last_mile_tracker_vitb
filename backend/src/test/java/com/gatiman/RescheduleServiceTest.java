package com.gatiman;

import com.gatiman.dto.order.RescheduleRequestDto;
import com.gatiman.dto.order.RescheduleResponse;
import com.gatiman.dto.order.RescheduleReviewRequest;
import com.gatiman.entity.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.RescheduleStatus;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.*;
import com.gatiman.service.*;
import com.gatiman.service.impl.RescheduleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RescheduleServiceTest {

    @Mock private RescheduleRequestRepository rescheduleRequestRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private DeliveryAttemptRepository deliveryAttemptRepository;
    @Mock private OrderAssignmentRepository orderAssignmentRepository;
    @Mock private DeliveryAgentRepository deliveryAgentRepository;
    @Mock private AgentAssignmentService agentAssignmentService;
    @Mock private AgentEligibilityService agentEligibilityService;
    @Mock private TrackingService trackingService;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;

    @InjectMocks
    private RescheduleServiceImpl rescheduleService;

    private User customerUser;
    private User adminUser;
    private Customer customer;
    private Order order;
    private DeliveryAgent agent;

    @BeforeEach
    void setUp() {
        customerUser = User.builder().id(1L).email("customer@gatiman.local").firstName("Priya").lastName("Sharma").role(Role.CUSTOMER).build();
        adminUser = User.builder().id(99L).email("admin@gatiman.local").firstName("Operations").lastName("Admin").role(Role.ADMIN).build();
        customer = Customer.builder().id(10L).user(customerUser).build();

        order = Order.builder()
                .id(100L)
                .trackingNumber("GTM-20260820-100")
                .customer(customer)
                .status(OrderStatus.FAILED)
                .rescheduleCount(0)
                .deliveryAttempts(new ArrayList<>())
                .build();

        agent = DeliveryAgent.builder()
                .id(5L)
                .user(User.builder().firstName("Rajesh").lastName("Kumar").phoneNumber("+91 98999 11223").build())
                .vehicleNumber("DL-03-EV-9821")
                .currentActiveOrders(0)
                .maxActiveOrders(5)
                .active(true)
                .isAvailable(true)
                .build();
    }

    @Test
    @DisplayName("Customer successfully requests reschedule for future date")
    void testRequestRescheduleSuccess() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(rescheduleRequestRepository.findFirstByOrderIdAndStatus(100L, RescheduleStatus.PENDING)).thenReturn(Optional.empty());
        when(rescheduleRequestRepository.save(any(RescheduleRequest.class))).thenAnswer(i -> {
            RescheduleRequest r = i.getArgument(0);
            r.setId(1L);
            return r;
        });

        RescheduleRequestDto dto = RescheduleRequestDto.builder()
                .requestedDate(LocalDate.now().plusDays(2))
                .preferredTimeSlot("Morning (9 AM - 12 PM)")
                .reason("Available after weekend")
                .build();

        RescheduleResponse resp = rescheduleService.requestReschedule(100L, dto, customerUser);

        assertNotNull(resp);
        assertEquals(RescheduleStatus.PENDING, resp.getStatus());
        assertEquals("GTM-20260820-100", resp.getTrackingNumber());
        verify(notificationService).notifyRescheduleRequested(any(Order.class), any(RescheduleRequest.class));
    }

    @Test
    @DisplayName("Reject reschedule request with past date")
    void testRequestReschedulePastDateThrowsException() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        RescheduleRequestDto dto = RescheduleRequestDto.builder()
                .requestedDate(LocalDate.now().minusDays(1))
                .reason("Invalid past date")
                .build();

        assertThrows(BusinessRuleException.class, () -> rescheduleService.requestReschedule(100L, dto, customerUser));
    }

    @Test
    @DisplayName("Admin approval increments attempt number, assigns driver, and updates order to ASSIGNED")
    void testApproveRescheduleSuccess() {
        RescheduleRequest req = RescheduleRequest.builder()
                .id(1L)
                .order(order)
                .status(RescheduleStatus.PENDING)
                .requestedDate(LocalDate.now().plusDays(1))
                .build();

        when(rescheduleRequestRepository.findById(1L)).thenReturn(Optional.of(req));
        when(rescheduleRequestRepository.save(any(RescheduleRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(agentAssignmentService.selectNearestEligibleAgent(order)).thenReturn(agent);

        RescheduleResponse resp = rescheduleService.approveReschedule(1L, new RescheduleReviewRequest(), adminUser);

        assertNotNull(resp);
        assertEquals(RescheduleStatus.APPROVED, resp.getStatus());
        assertEquals(1, order.getRescheduleCount());
        assertEquals(OrderStatus.ASSIGNED, order.getStatus());
        verify(deliveryAttemptRepository).save(any(DeliveryAttempt.class));
        verify(notificationService).notifyRescheduleApproved(eq(order), any(RescheduleRequest.class), eq(agent));
    }

    @Test
    @DisplayName("Admin rejection updates request status to REJECTED and records reason")
    void testRejectRescheduleSuccess() {
        RescheduleRequest req = RescheduleRequest.builder()
                .id(1L)
                .order(order)
                .status(RescheduleStatus.PENDING)
                .requestedDate(LocalDate.now().plusDays(1))
                .build();

        when(rescheduleRequestRepository.findById(1L)).thenReturn(Optional.of(req));
        when(rescheduleRequestRepository.save(any(RescheduleRequest.class))).thenAnswer(i -> i.getArgument(0));

        RescheduleResponse resp = rescheduleService.rejectReschedule(1L, "Outside service area on selected date", adminUser);

        assertNotNull(resp);
        assertEquals(RescheduleStatus.REJECTED, resp.getStatus());
        assertEquals("Outside service area on selected date", resp.getRejectionReason());
        verify(notificationService).notifyRescheduleRejected(eq(order), eq("Outside service area on selected date"));
    }
}
