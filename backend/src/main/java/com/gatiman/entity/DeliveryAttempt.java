package com.gatiman.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gatiman.enums.FailureReason;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
    name = "delivery_attempts",
    indexes = {
        @Index(name = "idx_attempts_order_id", columnList = "order_id"),
        @Index(name = "idx_attempts_agent_id", columnList = "agent_id"),
        @Index(name = "idx_attempts_status", columnList = "status"),
        @Index(name = "idx_attempts_order_attempt", columnList = "order_id, attemptNumber")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(nullable = false)
    private Integer attemptNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private DeliveryAgent agent;

    @Column(nullable = false)
    private String status; // FAILED, DELIVERED, IN_PROGRESS

    @Enumerated(EnumType.STRING)
    private FailureReason failureReason;

    @Column(columnDefinition = "TEXT")
    private String failureNotes;

    private LocalDate scheduledDate;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant attemptedAt = Instant.now();

    private Instant startedAt;

    private Instant completedAt;
}
