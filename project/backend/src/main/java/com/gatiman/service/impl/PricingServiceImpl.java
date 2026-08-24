package com.gatiman.service.impl;

import com.gatiman.dto.order.ChargeCalculationRequest;
import com.gatiman.dto.order.ChargeCalculationResponse;
import com.gatiman.dto.zone.ZoneDetectionResult;
import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.RouteType;
import com.gatiman.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingServiceImpl implements PricingService {

    private final ZoneDetectionService zoneDetectionService;
    private final VolumetricWeightService volumetricWeightService;
    private final RateCardRuleService rateCardRuleService;
    private final CodPricingService codPricingService;

    @Override
    @Transactional(readOnly = true)
    public ChargeCalculationResponse calculateCharge(ChargeCalculationRequest request) {
        log.info("Calculating delivery charges for request: customerType={}, paymentType={}, pickupPin={}, dropPin={}",
                request.getCustomerType(), request.getPaymentType(), request.getPickupPincode(), request.getDropPincode());

        // 1 & 2. Validate dimensions & actual weight
        BigDecimal length = request.getLengthCm();
        BigDecimal breadth = request.getBreadthCm();
        BigDecimal height = request.getHeightCm();
        BigDecimal actualWeight = request.getActualWeightKg();

        // 3 & 4. Detect pickup and drop zones
        ZoneDetectionResult pickupResult = zoneDetectionService.detectPickupZone(request.getPickupPincode(), null);
        ZoneDetectionResult dropResult = zoneDetectionService.detectDropZone(request.getDropPincode(), null);

        // 5. Determine route type (INTRA_ZONE vs INTER_ZONE)
        RouteType routeType = zoneDetectionService.determineRouteType(pickupResult.getZone(), dropResult.getZone());

        // 6. Calculate volumetric weight: (L * B * H) / 5000
        BigDecimal volumetricWeight = volumetricWeightService.calculateVolumetricWeight(length, breadth, height);

        // 7. Calculate billable weight: MAX(actualWeight, volumetricWeight)
        BigDecimal billableWeight = volumetricWeightService.calculateBillableWeight(actualWeight, volumetricWeight);

        // 8 & 9. Determine customer type and payment type
        CustomerType customerType = request.getCustomerType() != null ? request.getCustomerType() : CustomerType.B2C;
        PaymentType paymentType = request.getPaymentType() != null ? request.getPaymentType() : PaymentType.PREPAID;

        // 10. Find matching rate card
        RateCard rateCard = rateCardRuleService.findActiveRateCard(customerType, routeType);

        // 11. Find matching weight rule slab
        RateCardRule matchingRule = rateCardRuleService.findMatchingRule(rateCard, billableWeight);

        // 12. Calculate base charge
        BigDecimal baseCharge = rateCardRuleService.calculateBaseCharge(matchingRule, billableWeight);

        // 13. Calculate COD surcharge
        BigDecimal codSurcharge = codPricingService.calculateCodSurcharge(rateCard, baseCharge, paymentType);

        // 14. Calculate total charge
        BigDecimal totalCharge = baseCharge.add(codSurcharge).setScale(2, RoundingMode.HALF_UP);

        // 15. Return complete breakdown
        String formula = volumetricWeightService.formatWeightFormula(length, breadth, height, volumetricWeight);

        return ChargeCalculationResponse.builder()
                .pickupZone(pickupResult.getZone().getName())
                .dropZone(dropResult.getZone().getName())
                .pickupZoneId(pickupResult.getZone().getId())
                .dropZoneId(dropResult.getZone().getId())
                .pickupAreaId(pickupResult.getArea() != null ? pickupResult.getArea().getId() : null)
                .dropAreaId(dropResult.getArea() != null ? dropResult.getArea().getId() : null)
                .pickupAreaName(pickupResult.getArea() != null ? pickupResult.getArea().getName() : null)
                .dropAreaName(dropResult.getArea() != null ? dropResult.getArea().getName() : null)
                .routeType(routeType)
                .customerType(customerType)
                .paymentType(paymentType)
                .actualWeightKg(actualWeight.setScale(2, RoundingMode.HALF_UP))
                .volumetricWeightKg(volumetricWeight)
                .billableWeightKg(billableWeight)
                .baseCharge(baseCharge)
                .codSurcharge(codSurcharge)
                .totalCharge(totalCharge)
                .rateCardId(rateCard.getId())
                .rateCardName(rateCard.getName())
                .weightFormula(formula)
                .build();
    }
}
