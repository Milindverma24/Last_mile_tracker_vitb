package com.gatiman.entity;

import com.gatiman.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(
    name = "delivery_agents",
    indexes = {
        @Index(name = "idx_agents_user_id", columnList = "user_id", unique = true),
        @Index(name = "idx_agents_available", columnList = "isAvailable"),
        @Index(name = "idx_agents_status", columnList = "status"),
        @Index(name = "idx_agents_zone_id", columnList = "assigned_zone_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.BIKE;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxActiveOrders = 5;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentActiveOrders = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_zone_id")
    private Zone assignedZone;

    private Double currentLatitude;

    private Double currentLongitude;

    private Instant lastLocationUpdate;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, ON_BREAK

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    public String getName() {
        if (user != null) {
            String first = user.getFirstName() != null ? user.getFirstName() : "";
            String last = user.getLastName() != null ? user.getLastName() : "";
            return (first + " " + last).trim();
        }
        return "Driver Partner";
    }

    public String getPhoneNumber() {
        return user != null && user.getPhoneNumber() != null ? user.getPhoneNumber() : "";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
