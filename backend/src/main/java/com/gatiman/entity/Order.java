package com.gatiman.entity;

import com.gatiman.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_orders_tracking_num", columnList = "trackingNumber", unique = true),
        @Index(name = "idx_orders_order_num", columnList = "orderNumber"),
        @Index(name = "idx_orders_status", columnList = "status"),
        @Index(name = "idx_orders_customer_id", columnList = "customer_id"),
        @Index(name = "idx_orders_agent_id", columnList = "assigned_agent_id"),
        @Index(name = "idx_orders_created_at", columnList = "createdAt"),
        @Index(name = "idx_orders_pickup_zone", columnList = "pickup_zone_id"),
        @Index(name = "idx_orders_drop_zone", columnList = "drop_zone_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false, unique = true, updatable = false)
    private String trackingNumber;

    @Column(unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerType customerType; // B2C, B2B

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType; // PREPAID, COD

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING; // PENDING, PAID, FAILED, REFUNDED

    private String razorpayOrderId;

    private String razorpayPaymentId;

    @Column(columnDefinition = "TEXT")
    private String razorpaySignature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.CREATED;

    @Column(nullable = false)
    private String pickupName;

    @Column(nullable = false)
    private String pickupPhone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(nullable = false)
    private String pickupPincode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_area_id")
    private Area pickupArea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_zone_id")
    private Zone pickupZone;

    @Column(nullable = false)
    private String dropName;

    @Column(nullable = false)
    private String dropPhone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String dropAddress;

    @Column(nullable = false)
    private String dropPincode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_area_id")
    private Area dropArea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_zone_id")
    private Zone dropZone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteType routeType;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal actualWeightKg;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal volumetricWeightKg;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal billableWeightKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal codSurcharge = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCharge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private DeliveryAgent assignedAgent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_card_id")
    private RateCard rateCard;

    private LocalDate scheduledDeliveryDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer rescheduleCount = 0;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderPackage> packages = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("eventTimestamp ASC")
    @Builder.Default
    private List<TrackingEvent> trackingEvents = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("attemptNumber ASC")
    @Builder.Default
    private List<DeliveryAttempt> deliveryAttempts = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PrePersist
    public void prePersist() {
        if (this.orderNumber == null) {
            this.orderNumber = this.trackingNumber;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
