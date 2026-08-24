package com.gatiman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "order_assignments",
    indexes = {
        @Index(name = "idx_assignments_order_id", columnList = "order_id"),
        @Index(name = "idx_assignments_agent_id", columnList = "agent_id"),
        @Index(name = "idx_assignments_status", columnList = "status"),
        @Index(name = "idx_assignments_assigned_at", columnList = "assignedAt")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private DeliveryAgent agent;

    @Column(nullable = false)
    private String assignmentType; // AUTO, MANUAL

    @Column(nullable = false)
    @Builder.Default
    private String status = "ASSIGNED"; // ASSIGNED, REASSIGNED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id")
    private User assignedByUser;

    private BigDecimal distanceKmAtAssignment;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant assignedAt = Instant.now();
}
