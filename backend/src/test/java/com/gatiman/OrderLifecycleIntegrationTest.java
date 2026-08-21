package com.gatiman;

import com.gatiman.dto.order.CreateOrderRequest;
import com.gatiman.dto.order.OrderResponse;
import com.gatiman.dto.order.StatusUpdateRequest;
import com.gatiman.dto.zone.ZoneDetectionResult;
import com.gatiman.entity.*;
import com.gatiman.enums.*;
import com.gatiman.repository.*;
import com.gatiman.service.*;
import com.gatiman.service.impl.OrderServiceImpl;
import com.gatiman.service.impl.OrderStatusTransitionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderLifecycleIntegrationTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private DeliveryAgentRepository deliveryAgentRepository;
    @Mock private ZoneRepository zoneRepository;
    @Mock private AreaRepository areaRepository;
    @Mock private RateCardRepository rateCardRepository;
    @Mock private TrackingService trackingService;
    @Mock private NotificationService notificationService;
    @Mock private PricingService pricingService;
    @Mock private AgentAssignmentService agentAssignmentService;

    private OrderService orderService;
    private OrderStatusTransitionService statusTransitionService;

    private User customerUser;
    private Customer customer;
    private Zone southDelhi;
    private Zone gurugram;
    private RateCard rateCard;

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
                agentAssignmentService
        );

        customerUser = User.builder()
                .id(3L)
                .email("customer@gatiman.local")
                .firstName("Priya")
                .lastName("Sharma")
                .role(Role.CUSTOMER)
                .build();

        customer = Customer.builder()
                .id(1L)
                .user(customerUser)
                .customerType(CustomerType.B2C)
                .build();

        southDelhi = Zone.builder().id(1L).name("South Delhi Express Zone").code("DL-SOUTH").build();
        gurugram = Zone.builder().id(3L).name("Gurugram Cyber Hub Zone").code("GGN-CENTRAL").build();
        rateCard = RateCard.builder().id(2L).name("Standard B2C Inter-Zone Express").build();
    }

    @Test
    @DisplayName("Complete Order Lifecycle Flow: CREATED -> ASSIGNED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED")
    void testCompleteOrderLifecycle() {
        // 1. Create Order
        CreateOrderRequest createReq = CreateOrderRequest.builder()
                .customerType(CustomerType.B2C)
                .paymentType(PaymentType.COD)
                .pickupName("Priya Sharma")
                .pickupPhone("+91 98111 22233")
                .pickupAddress("42, Hauz Khas")
                .pickupPincode("110016")
                .dropName("Vikram Seth")
                .dropPhone("+91 98222 33344")
                .dropAddress("Tower B, DLF Phase 2")
                .dropPincode("122002")
                .lengthCm(new BigDecimal("30"))
                .breadthCm(new BigDecimal("20"))
                .heightCm(new BigDecimal("20"))
                .actualWeightKg(new BigDecimal("1.50"))
                .build();

        when(customerRepository.findByUserId(3L)).thenReturn(Optional.of(customer));
        when(pricingService.calculateCharge(any())).thenReturn(
                com.gatiman.dto.order.ChargeCalculationResponse.builder()
                        .pickupZoneId(1L)
                        .dropZoneId(3L)
                        .routeType(RouteType.INTER_ZONE)
                        .customerType(CustomerType.B2C)
                        .paymentType(PaymentType.COD)
                        .actualWeightKg(new BigDecimal("1.50"))
                        .volumetricWeightKg(new BigDecimal("2.40"))
                        .billableWeightKg(new BigDecimal("2.40"))
                        .baseCharge(new BigDecimal("115.00"))
                        .codSurcharge(new BigDecimal("42.30"))
                        .totalCharge(new BigDecimal("157.30"))
                        .rateCardId(2L)
                        .build()
        );
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(southDelhi));
        when(zoneRepository.findById(3L)).thenReturn(Optional.of(gurugram));
        when(rateCardRepository.findById(2L)).thenReturn(Optional.of(rateCard));

        Order createdOrder = Order.builder()
                .id(100L)
                .trackingNumber("GTM-20260820-100001")
                .customer(customer)
                .status(OrderStatus.CREATED)
                .totalCharge(new BigDecimal("157.30"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(createdOrder);

        OrderResponse createdResp = orderService.createOrder(createReq, customerUser);
        assertNotNull(createdResp);
        assertEquals(OrderStatus.CREATED, createdResp.getStatus());
        verify(trackingService).recordEvent(any(), isNull(), eq(OrderStatus.CREATED), eq(customerUser), any(), any(), any(), any(), any());

        // 2. Advance Status: CREATED -> ASSIGNED (simulated via update)
        when(orderRepository.findById(100L)).thenReturn(Optional.of(createdOrder));
        createdOrder.setStatus(OrderStatus.ASSIGNED);

        // 3. Advance Status: ASSIGNED -> PICKED_UP
        orderService.updateOrderStatus(100L, OrderStatus.PICKED_UP, customerUser, "Parcel picked up from sender", null, null);
        assertEquals(OrderStatus.PICKED_UP, createdOrder.getStatus());

        // 4. Advance Status: PICKED_UP -> IN_TRANSIT
        orderService.updateOrderStatus(100L, OrderStatus.IN_TRANSIT, customerUser, "Parcel in transit to hub", null, null);
        assertEquals(OrderStatus.IN_TRANSIT, createdOrder.getStatus());

        // 5. Advance Status: IN_TRANSIT -> OUT_FOR_DELIVERY
        orderService.updateOrderStatus(100L, OrderStatus.OUT_FOR_DELIVERY, customerUser, "Out for delivery with agent", null, null);
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, createdOrder.getStatus());

        // 6. Advance Status: OUT_FOR_DELIVERY -> DELIVERED
        orderService.updateOrderStatus(100L, OrderStatus.DELIVERED, customerUser, "Delivered successfully", null, null);
        assertEquals(OrderStatus.DELIVERED, createdOrder.getStatus());
    }
}
