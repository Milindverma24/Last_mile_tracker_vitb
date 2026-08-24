package com.gatiman.entity;

import com.gatiman.enums.RescheduleStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
    name = "reschedule_requests",
    indexes = {
        @Index(name = "idx_reschedules_order_id", columnList = "order_id"),
        @Index(name = "idx_reschedules_status", columnList = "status"),
        @Index(name = "idx_reschedules_req_date", columnList = "requestedDate"),
        @Index(name = "idx_reschedules_user_id", columnList = "requested_by_user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescheduleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_attempt_id")
    private DeliveryAttempt deliveryAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedByUser;

    @Column(nullable = false)
    private LocalDate requestedDate;

    private String preferredTimeSlot;

    @Column(columnDefinition = "TEXT")
    private String rescheduleNotes;

    private String reason;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private Instant reviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RescheduleStatus status = RescheduleStatus.PENDING;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant requestedAt = Instant.now();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
