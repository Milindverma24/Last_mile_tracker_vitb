package com.gatiman;

import com.gatiman.dto.order.TrackingEventResponse;
import com.gatiman.entity.Order;
import com.gatiman.entity.TrackingEvent;
import com.gatiman.entity.User;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.Role;
import com.gatiman.repository.TrackingEventRepository;
import com.gatiman.service.impl.TrackingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TrackingServiceTest {

    @Mock private TrackingEventRepository trackingEventRepository;

    @InjectMocks
    private TrackingServiceImpl trackingService;

    private Order order;
    private User actor;

    @BeforeEach
    void setUp() {
        order = Order.builder().id(100L).trackingNumber("GTM-TRK-001").build();
        actor = User.builder().id(1L).firstName("Agent").lastName("One").role(Role.DELIVERY_AGENT).build();
    }

    @Test
    void testRecordEvent() {
        when(trackingEventRepository.save(any(TrackingEvent.class))).thenAnswer(i -> {
            TrackingEvent t = i.getArgument(0);
            t.setId(10L);
            return t;
        });

        TrackingEvent event = trackingService.recordEvent(
                order, OrderStatus.CREATED, OrderStatus.ASSIGNED, actor, "Agent One", "DELIVERY_AGENT",
                "Assigned to driver", 28.5, 77.2, null
        );

        assertNotNull(event);
        assertEquals(OrderStatus.ASSIGNED, event.getNewStatus());
        assertEquals("Agent One", event.getActorName());
    }

    @Test
    void testGetTrackingHistory() {
        TrackingEvent event = TrackingEvent.builder()
                .id(10L)
                .order(order)
                .previousStatus(OrderStatus.CREATED)
                .newStatus(OrderStatus.ASSIGNED)
                .actorName("Agent One")
                .actorRole("DELIVERY_AGENT")
                .eventTimestamp(Instant.now())
                .build();

        when(trackingEventRepository.findByOrderIdOrderByEventTimestampAsc(100L))
                .thenReturn(List.of(event));

        List<TrackingEventResponse> history = trackingService.getTrackingHistoryForOrder(100L);

        assertFalse(history.isEmpty());
        assertEquals(10L, history.get(0).getId());
        assertEquals(OrderStatus.ASSIGNED, history.get(0).getNewStatus());
    }
}
