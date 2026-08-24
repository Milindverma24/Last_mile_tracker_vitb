package com.gatiman.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gatiman.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(
    name = "tracking_events",
    indexes = {
        @Index(name = "idx_tracking_order_id", columnList = "order_id"),
        @Index(name = "idx_tracking_timestamp", columnList = "eventTimestamp"),
        @Index(name = "idx_tracking_order_time", columnList = "order_id, eventTimestamp")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Enumerated(EnumType.STRING)
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actorUser;

    @Column(nullable = false)
    private String actorName;

    @Column(nullable = false)
    private String actorRole; // CUSTOMER, AGENT, ADMIN, SYSTEM

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private Double latitude;

    private Double longitude;

    private Long deliveryAttemptId;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant eventTimestamp = Instant.now();
}
