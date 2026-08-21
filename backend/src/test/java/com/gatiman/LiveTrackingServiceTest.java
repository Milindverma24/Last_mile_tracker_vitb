package com.gatiman;

import com.gatiman.dto.tracking.LiveTrackingResponse;
import com.gatiman.dto.tracking.LocationUpdatePayload;
import com.gatiman.entity.*;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.Role;
import com.gatiman.enums.VehicleType;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.service.impl.LiveTrackingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LiveTrackingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DeliveryAgentRepository deliveryAgentRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private LiveTrackingServiceImpl liveTrackingService;

    private User customerUser;
    private User agentUser;
    private Customer customer;
    private DeliveryAgent agent;
    private Area pickupArea;
    private Area dropArea;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        customerUser = User.builder().id(1L).email("customer@gatiman.local").role(Role.CUSTOMER).firstName("Priya").lastName("Sharma").build();
        agentUser = User.builder().id(2L).email("agent1@gatiman.local").role(Role.DELIVERY_AGENT).firstName("Rajesh").lastName("Kumar").build();

        customer = Customer.builder().id(10L).user(customerUser).customerType(CustomerType.B2C).build();
        agent = DeliveryAgent.builder()
                .id(20L)
                .user(agentUser)
                .vehicleType(VehicleType.EV_SCOOTER)
                .vehicleNumber("DL-03-EV-9821")
                .currentLatitude(28.5494)
                .currentLongitude(77.2001)
                .build();

        pickupArea = Area.builder().id(100L).name("Hauz Khas").pincode("110016").latitude(28.5494).longitude(77.2001).build();
        dropArea = Area.builder().id(200L).name("DLF Cyber City").pincode("122002").latitude(28.4900).longitude(77.0888).build();

        testOrder = Order.builder()
                .id(50L)
                .trackingNumber("GTM-20260821-001")
                .customer(customer)
                .assignedAgent(agent)
                .status(OrderStatus.IN_TRANSIT)
                .pickupName("Priya Sharma")
                .pickupPhone("+91 98111 22233")
                .pickupAddress("42 Hauz Khas")
                .pickupPincode("110016")
                .pickupArea(pickupArea)
                .dropName("Vikram Seth")
                .dropPhone("+91 98222 33344")
                .dropAddress("Tower B Cyber City")
                .dropPincode("122002")
                .dropArea(dropArea)
                .totalCharge(new BigDecimal("120.00"))
                .build();
    }

    @Test
    @DisplayName("Should return authoritative live tracking telemetry with distance, ETA and route waypoints")
    void testGetLiveTracking() {
        when(orderRepository.findById(50L)).thenReturn(Optional.of(testOrder));

        LiveTrackingResponse response = liveTrackingService.getLiveTracking(50L, customerUser);

        assertNotNull(response);
        assertEquals(50L, response.getOrderId());
        assertEquals("GTM-20260821-001", response.getTrackingNumber());
        assertEquals(OrderStatus.IN_TRANSIT, response.getStatus());
        assertTrue(response.isLive());
        assertNotNull(response.getDeliveryPartner());
        assertEquals("Rajesh Kumar", response.getDeliveryPartner().getName());
        assertEquals("DL-03-EV-9821", response.getDeliveryPartner().getVehicleNumber());
        assertTrue(response.getDistanceRemaining() > 0);
        assertTrue(response.getEtaMinutes() > 0);
        assertNotNull(response.getRouteWaypoints());
        assertFalse(response.getRouteWaypoints().isEmpty());
    }

    @Test
    @DisplayName("Should update driver location and broadcast via WebSocket to /topic/orders/{id}/tracking")
    void testUpdateDriverLocation() {
        when(orderRepository.findById(50L)).thenReturn(Optional.of(testOrder));
        when(deliveryAgentRepository.save(any(DeliveryAgent.class))).thenReturn(agent);

        LocationUpdatePayload payload = LocationUpdatePayload.builder()
                .orderId(50L)
                .latitude(28.5100)
                .longitude(77.1500)
                .speed(30.0)
                .heading(215.0)
                .build();

        LiveTrackingResponse response = liveTrackingService.updateDriverLocation(50L, payload, agentUser);

        assertNotNull(response);
        assertEquals(28.5100, response.getCurrentLocation().getLatitude());
        assertEquals(77.1500, response.getCurrentLocation().getLongitude());
        assertEquals(215.0, response.getHeading());

        verify(deliveryAgentRepository).save(agent);
        verify(messagingTemplate).convertAndSend(eq("/topic/orders/50/tracking"), any(LiveTrackingResponse.class));
    }

    @Test
    @DisplayName("Should reject location update from unassigned delivery agent")
    void testRejectUnassignedDriverLocationUpdate() {
        User otherDriver = User.builder().id(999L).email("intruder@gatiman.local").role(Role.DELIVERY_AGENT).build();
        when(orderRepository.findById(50L)).thenReturn(Optional.of(testOrder));

        LocationUpdatePayload payload = LocationUpdatePayload.builder()
                .orderId(50L)
                .latitude(28.5100)
                .longitude(77.1500)
                .build();

        assertThrows(UnauthorizedException.class, () -> liveTrackingService.updateDriverLocation(50L, payload, otherDriver));
    }
}
