package com.gatiman.service.impl;

import com.gatiman.dto.order.TrackingEventResponse;
import com.gatiman.entity.Order;
import com.gatiman.entity.TrackingEvent;
import com.gatiman.entity.User;
import com.gatiman.enums.OrderStatus;
import com.gatiman.repository.TrackingEventRepository;
import com.gatiman.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final TrackingEventRepository trackingEventRepository;

    @Override
    @Transactional
    public TrackingEvent recordEvent(
            Order order,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            User actorUser,
            String actorName,
            String actorRole,
            String remarks,
            Double latitude,
            Double longitude,
            Long deliveryAttemptId) {

        TrackingEvent event = TrackingEvent.builder()
                .order(order)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .actorUser(actorUser)
                .actorName(actorName != null ? actorName : "System")
                .actorRole(actorRole != null ? actorRole : "SYSTEM")
                .remarks(remarks)
                .latitude(latitude)
                .longitude(longitude)
                .deliveryAttemptId(deliveryAttemptId)
                .eventTimestamp(Instant.now())
                .build();

        return trackingEventRepository.save(event);
    }

    @Override
    @Transactional
    public TrackingEvent recordEvent(
            Order order,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            User actorUser,
            String actorName,
            String actorRole,
            String remarks,
            Double latitude,
            Double longitude) {
        return recordEvent(order, previousStatus, newStatus, actorUser, actorName, actorRole, remarks, latitude, longitude, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackingEventResponse> getTrackingHistoryForOrder(Long orderId) {
        return trackingEventRepository.findByOrderIdOrderByEventTimestampAsc(orderId).stream()
                .map(t -> TrackingEventResponse.builder()
                        .id(t.getId())
                        .orderId(t.getOrder().getId())
                        .previousStatus(t.getPreviousStatus())
                        .newStatus(t.getNewStatus())
                        .actorUserId(t.getActorUser() != null ? t.getActorUser().getId() : null)
                        .actorName(t.getActorName())
                        .actorRole(t.getActorRole())
                        .remarks(t.getRemarks())
                        .latitude(t.getLatitude())
                        .longitude(t.getLongitude())
                        .deliveryAttemptId(t.getDeliveryAttemptId())
                        .eventTimestamp(t.getEventTimestamp())
                        .build())
                .collect(Collectors.toList());
    }
}
