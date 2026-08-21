package com.gatiman.dto.order;

import com.gatiman.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingEventResponse {
    private Long id;
    private Long orderId;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private Long actorUserId;
    private String actorName;
    private String actorRole;
    private String remarks;
    private Double latitude;
    private Double longitude;
    private Long deliveryAttemptId;
    private Instant eventTimestamp;
}
