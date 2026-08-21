package com.gatiman.dto.ratecard;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateCardRuleDto {
    private Long id;

    @NotNull(message = "Min weight is required")
    @DecimalMin(value = "0.0", message = "Min weight must be >= 0")
    private BigDecimal minWeightKg;

    @NotNull(message = "Max weight is required")
    @DecimalMin(value = "0.1", message = "Max weight must be > 0")
    private BigDecimal maxWeightKg;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", message = "Base price must be >= 0")
    private BigDecimal basePrice;

    @Builder.Default
    private BigDecimal perKgRateAboveMin = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal additionalWeightUnit = new BigDecimal("1.000");
}
