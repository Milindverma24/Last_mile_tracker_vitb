package com.gatiman.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rate_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RateCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerType customerType; // B2C or B2B

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteType routeType; // INTRA_ZONE or INTER_ZONE

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal codSurchargeFlat = new BigDecimal("40.00");

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal codSurchargePercentage = new BigDecimal("2.00");

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @OneToMany(mappedBy = "rateCard", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RateCardRule> rules = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
