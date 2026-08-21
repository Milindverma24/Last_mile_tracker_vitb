package com.gatiman.service;

import com.gatiman.dto.order.TrackingEventResponse;
import com.gatiman.entity.Order;
import com.gatiman.entity.TrackingEvent;
import com.gatiman.entity.User;
import com.gatiman.enums.OrderStatus;
import java.util.List;

public interface TrackingService {
    TrackingEvent recordEvent(
            Order order,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            User actorUser,
            String actorName,
            String actorRole,
            String remarks,
            Double latitude,
            Double longitude,
            Long deliveryAttemptId
    );

    TrackingEvent recordEvent(
            Order order,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            User actorUser,
            String actorName,
            String actorRole,
            String remarks,
            Double latitude,
            Double longitude
    );

    List<TrackingEventResponse> getTrackingHistoryForOrder(Long orderId);
}
