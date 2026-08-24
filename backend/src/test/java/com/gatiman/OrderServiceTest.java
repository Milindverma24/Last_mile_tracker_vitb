package com.gatiman;

import com.gatiman.dto.order.OrderResponse;
import com.gatiman.entity.*;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.Role;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.InvalidStatusTransitionException;
import com.gatiman.repository.*;
import com.gatiman.service.*;
import com.gatiman.service.impl.OrderServiceImpl;
import com.gatiman.service.impl.OrderStatusTransitionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private DeliveryAgentRepository deliveryAgentRepository;
    @Mock private AreaRepository areaRepository;
    @Mock private ZoneRepository zoneRepository;
    @Mock private RateCardRepository rateCardRepository;
    @Mock private TrackingService trackingService;
    @Mock private NotificationService notificationService;
    @Mock private PricingService pricingService;
    @Mock private AgentAssignmentService agentAssignmentService;
    @Mock private OrderAssignmentRepository orderAssignmentRepository;
    @Mock private DeliveryAttemptRepository deliveryAttemptRepository;

    private OrderStatusTransitionService statusTransitionService;
    private OrderServiceImpl orderService;

    private User customerUser;
    private User agentUser;
    private Customer customer;
    private Order order;

    @BeforeEach
    void setUp() {
        statusTransitionService = new OrderStatusTransitionServiceImpl();
        orderService = new OrderServiceImpl(
                orderRepository,
                customerRepository,
                deliveryAgentRepository,
                zoneRepository,
                areaRepository,
                rateCardRepository,
                trackingService,
                notificationService,
                pricingService,
                statusTransitionService,
                agentAssignmentService,
                orderAssignmentRepository,
                deliveryAttemptRepository
        );

        customerUser = User.builder().id(1L).email("customer@gatiman.local").firstName("Priya").lastName("Sharma").role(Role.CUSTOMER).build();
        agentUser = User.builder().id(2L).email("agent@gatiman.local").firstName("Rajesh").lastName("Kumar").role(Role.DELIVERY_AGENT).build();

        customer = Customer.builder().id(10L).user(customerUser).customerType(CustomerType.B2C).build();

        order = Order.builder()
                .id(100L)
                .trackingNumber("GTM-TEST-001")
                .customer(customer)
                .customerType(CustomerType.B2C)
                .paymentType(PaymentType.PREPAID)
                .status(OrderStatus.CREATED)
                .pickupName("Sender")
                .pickupPhone("9999999999")
                .pickupAddress("Address A")
                .pickupPincode("110016")
                .dropName("Receiver")
                .dropPhone("8888888888")
                .dropAddress("Address B")
                .dropPincode("110054")
                .routeType(RouteType.INTER_ZONE)
                .actualWeightKg(new BigDecimal("1.00"))
                .volumetricWeightKg(new BigDecimal("1.00"))
                .billableWeightKg(new BigDecimal("1.00"))
                .baseCharge(new BigDecimal("90.00"))
                .codSurcharge(BigDecimal.ZERO)
                .totalCharge(new BigDecimal("90.00"))
                .packages(new ArrayList<>())
                .trackingEvents(new ArrayList<>())
                .deliveryAttempts(new ArrayList<>())
                .build();
    }

    @Test
    void testGetOrderById() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(100L, customerUser);

        assertNotNull(response);
        assertEquals("GTM-TEST-001", response.getTrackingNumber());
        assertEquals(OrderStatus.CREATED, response.getStatus());
    }

    @Test
    void testValidStatusTransition() {
        order.setStatus(OrderStatus.PICKED_UP);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse response = orderService.updateOrderStatus(
                100L, OrderStatus.IN_TRANSIT, agentUser, "Departed transit center", 28.5, 77.2);

        assertNotNull(response);
        assertEquals(OrderStatus.IN_TRANSIT, response.getStatus());
        verify(trackingService).recordEvent(any(), eq(OrderStatus.PICKED_UP), eq(OrderStatus.IN_TRANSIT), any(), any(), any(), any(), any(), any());
    }

    @Test
    void testInvalidStatusTransitionThrowsException() {
        order.setStatus(OrderStatus.CREATED);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThrows(InvalidStatusTransitionException.class, () ->
                orderService.updateOrderStatus(100L, OrderStatus.DELIVERED, agentUser, "Direct deliver", null, null)
        );
    }
}
