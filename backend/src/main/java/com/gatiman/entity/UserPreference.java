package com.gatiman.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(
    name = "user_preferences",
    indexes = {
        @Index(name = "idx_user_pref_user_id", columnList = "user_id", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Boolean orderUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deliveryUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean rescheduleUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean securityAlerts = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean marketing = false;

    @Column(nullable = false)
    @Builder.Default
    private String language = "en";

    @Column(nullable = false)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(nullable = false)
    @Builder.Default
    private String dateFormat = "DD/MM/YYYY";

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
