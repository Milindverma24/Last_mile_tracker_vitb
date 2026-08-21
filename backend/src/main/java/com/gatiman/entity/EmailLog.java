package com.gatiman.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.EmailStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
    name = "email_logs",
    indexes = {
        @Index(name = "idx_email_logs_order_id", columnList = "orderId"),
        @Index(name = "idx_email_logs_tracking_num", columnList = "trackingNumber"),
        @Index(name = "idx_email_logs_recipient", columnList = "recipientEmail"),
        @Index(name = "idx_email_logs_event_type", columnList = "eventType"),
        @Index(name = "idx_email_logs_status", columnList = "status"),
        @Index(name = "idx_email_logs_idempotency", columnList = "idempotencyKey"),
        @Index(name = "idx_email_logs_created_at", columnList = "createdAt")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long notificationId;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private String trackingNumber;

    private Long customerId;

    @Column(nullable = false)
    private String recipientEmail;

    private String recipientName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailEventType eventType;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String htmlContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EmailStatus status = EmailStatus.PENDING;

    private Instant sentAt;

    @Column(nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(nullable = false)
    private String idempotencyKey;

    private Double distanceRemaining;

    private Integer etaMinutes;

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
