package com.gatiman.dto.order;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.RouteType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargeCalculationResponse {
    private String pickupZone;
    private String dropZone;
    private Long pickupZoneId;
    private Long dropZoneId;
    private Long pickupAreaId;
    private Long dropAreaId;
    private String pickupAreaName;
    private String dropAreaName;
    private RouteType routeType;
    private CustomerType customerType;
    private PaymentType paymentType;
    private BigDecimal actualWeightKg;
    private BigDecimal volumetricWeightKg;
    private BigDecimal billableWeightKg;
    private BigDecimal baseCharge;
    private BigDecimal codSurcharge;
    private BigDecimal totalCharge;
    private Long rateCardId;
    private String rateCardName;
    private String weightFormula;
}
