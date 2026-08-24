package com.gatiman.dto.ratecard;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;
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
public class RateCardResponse {
    private Long id;
    private String name;
    private CustomerType customerType;
    private RouteType routeType;
    private BigDecimal codSurchargeFlat;
    private BigDecimal codSurchargePercentage;
    private Boolean active;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private List<RateCardRuleDto> rules;
}
