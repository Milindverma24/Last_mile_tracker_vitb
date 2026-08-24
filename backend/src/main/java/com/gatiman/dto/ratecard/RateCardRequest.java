package com.gatiman.dto.ratecard;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateCardRequest {

    @NotBlank(message = "Rate card name is required")
    private String name;

    @NotNull(message = "Customer type is required")
    private CustomerType customerType;

    @NotNull(message = "Route type is required")
    private RouteType routeType;

    @Builder.Default
    private BigDecimal codSurchargeFlat = new BigDecimal("40.00");

    @Builder.Default
    private BigDecimal codSurchargePercentage = new BigDecimal("2.00");

    @Builder.Default
    private Boolean active = true;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private List<RateCardRuleDto> rules;
}
