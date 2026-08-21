package com.gatiman.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rate_card_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RateCardRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_card_id", nullable = false)
    @JsonIgnore
    private RateCard rateCard;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal minWeightKg;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal maxWeightKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice; // Base charge for this slab

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal perKgRateAboveMin = BigDecimal.ZERO; // Additional per kg rate

    @Column(precision = 8, scale = 3)
    @Builder.Default
    private BigDecimal additionalWeightUnit = new BigDecimal("1.000");
}
