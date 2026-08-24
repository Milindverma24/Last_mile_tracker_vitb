package com.gatiman.service.impl;

import com.gatiman.dto.order.ChargeCalculationRequest;
import com.gatiman.dto.order.ChargeCalculationResponse;
import com.gatiman.dto.ratecard.RateCardRequest;
import com.gatiman.dto.ratecard.RateCardResponse;
import com.gatiman.dto.ratecard.RateCardRuleDto;
import com.gatiman.entity.Area;
import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.entity.Zone;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.RateCardRepository;
import com.gatiman.service.RateCardService;
import com.gatiman.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RateCardServiceImpl implements RateCardService {

    private static final BigDecimal VOLUMETRIC_DIVISOR = new BigDecimal("5000");
    private final RateCardRepository rateCardRepository;
    private final ZoneService zoneService;

    @Override
    @Transactional(readOnly = true)
    public List<RateCardResponse> getAllRateCards() {
        return rateCardRepository.findAll().stream()
                .map(this::mapToRateCardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RateCardResponse getRateCardById(Long id) {
        RateCard card = rateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate card not found with ID: " + id));
        return mapToRateCardResponse(card);
    }

    @Override
    @Transactional
    public RateCardResponse createRateCard(RateCardRequest request) {
        RateCard card = RateCard.builder()
                .name(request.getName())
                .customerType(request.getCustomerType())
                .routeType(request.getRouteType())
                .codSurchargeFlat(request.getCodSurchargeFlat())
                .codSurchargePercentage(request.getCodSurchargePercentage())
                .active(request.getActive() != null ? request.getActive() : true)
                .isActive(request.getActive() != null ? request.getActive() : true)
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .build();

        if (request.getRules() != null) {
            for (RateCardRuleDto r : request.getRules()) {
                card.getRules().add(RateCardRule.builder()
                        .rateCard(card)
                        .minWeightKg(r.getMinWeightKg())
                        .maxWeightKg(r.getMaxWeightKg())
                        .basePrice(r.getBasePrice())
                        .perKgRateAboveMin(r.getPerKgRateAboveMin())
                        .additionalWeightUnit(r.getAdditionalWeightUnit())
                        .build());
            }
        }

        RateCard saved = rateCardRepository.save(card);
        return mapToRateCardResponse(saved);
    }

    @Override
    @Transactional
    public RateCardResponse updateRateCard(Long id, RateCardRequest request) {
        RateCard card = rateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate card not found with ID: " + id));

        card.setName(request.getName());
        card.setCustomerType(request.getCustomerType());
        card.setRouteType(request.getRouteType());
        card.setCodSurchargeFlat(request.getCodSurchargeFlat());
        card.setCodSurchargePercentage(request.getCodSurchargePercentage());
        if (request.getActive() != null) {
            card.setActive(request.getActive());
            card.setIsActive(request.getActive());
        }
        card.setEffectiveFrom(request.getEffectiveFrom());
        card.setEffectiveTo(request.getEffectiveTo());

        RateCard updated = rateCardRepository.save(card);
        return mapToRateCardResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRateCard(Long id) {
        RateCard card = rateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate card not found with ID: " + id));
        card.setActive(false);
        card.setIsActive(false);
        rateCardRepository.save(card);
    }

    @Override
    public BigDecimal calculateVolumetricWeight(BigDecimal lengthCm, BigDecimal breadthCm, BigDecimal heightCm) {
        if (lengthCm == null || breadthCm == null || heightCm == null ||
                lengthCm.compareTo(BigDecimal.ZERO) <= 0 ||
                breadthCm.compareTo(BigDecimal.ZERO) <= 0 ||
                heightCm.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return lengthCm.multiply(breadthCm).multiply(heightCm)
                .divide(VOLUMETRIC_DIVISOR, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateBillableWeight(BigDecimal actualWeightKg, BigDecimal volumetricWeightKg) {
        if (actualWeightKg == null) actualWeightKg = BigDecimal.ZERO;
        if (volumetricWeightKg == null) volumetricWeightKg = BigDecimal.ZERO;
        return actualWeightKg.max(volumetricWeightKg).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public ChargeCalculationResponse calculateCharges(ChargeCalculationRequest request) {
        Area pickupArea = zoneService.resolveAreaByPincode(request.getPickupPincode());
        Area dropArea = zoneService.resolveAreaByPincode(request.getDropPincode());

        Zone pickupZone = zoneService.resolveZoneForArea(pickupArea);
        Zone dropZone = zoneService.resolveZoneForArea(dropArea);

        RouteType routeType = zoneService.determineRouteType(pickupZone, dropZone);

        BigDecimal volumetricWeight = calculateVolumetricWeight(
                request.getLengthCm(), request.getBreadthCm(), request.getHeightCm());
        BigDecimal billableWeight = calculateBillableWeight(request.getActualWeightKg(), volumetricWeight);

        RateCard rateCard = rateCardRepository
                .findByCustomerTypeAndRouteTypeAndIsActiveTrue(request.getCustomerType(), routeType)
                .orElseGet(() -> rateCardRepository.findAll().stream().filter(RateCard::getIsActive).findFirst()
                        .orElseThrow(() -> new BusinessRuleException("No active rate card found for " +
                                request.getCustomerType() + " / " + routeType)));

        RateCardRule matchedRule = rateCard.getRules().stream()
                .filter(rule -> billableWeight.compareTo(rule.getMinWeightKg()) >= 0 &&
                        billableWeight.compareTo(rule.getMaxWeightKg()) <= 0)
                .findFirst()
                .orElseGet(() -> rateCard.getRules().stream()
                        .max((r1, r2) -> r1.getMaxWeightKg().compareTo(r2.getMaxWeightKg()))
                        .orElseThrow(() -> new BusinessRuleException("No weight slab defined in rate card " + rateCard.getName())));

        BigDecimal baseCharge = matchedRule.getBasePrice();
        if (billableWeight.compareTo(matchedRule.getMinWeightKg()) > 0 &&
                matchedRule.getPerKgRateAboveMin().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal extraWeight = billableWeight.subtract(matchedRule.getMinWeightKg());
            BigDecimal extraWeightCeiled = BigDecimal.valueOf(Math.ceil(extraWeight.doubleValue()));
            baseCharge = baseCharge.add(extraWeightCeiled.multiply(matchedRule.getPerKgRateAboveMin()));
        }
        baseCharge = baseCharge.setScale(2, RoundingMode.HALF_UP);

        BigDecimal codSurcharge = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (request.getPaymentType() == PaymentType.COD) {
            BigDecimal flatSurcharge = rateCard.getCodSurchargeFlat();
            BigDecimal percentageSurcharge = baseCharge
                    .multiply(rateCard.getCodSurchargePercentage())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            codSurcharge = flatSurcharge.add(percentageSurcharge).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalCharge = baseCharge.add(codSurcharge).setScale(2, RoundingMode.HALF_UP);
        String formula = String.format("(%s × %s × %s) / 5000 = %s kg",
                request.getLengthCm(), request.getBreadthCm(), request.getHeightCm(), volumetricWeight);

        return ChargeCalculationResponse.builder()
                .pickupZone(pickupZone.getName())
                .dropZone(dropZone.getName())
                .pickupZoneId(pickupZone.getId())
                .dropZoneId(dropZone.getId())
                .pickupAreaId(pickupArea.getId())
                .dropAreaId(dropArea.getId())
                .pickupAreaName(pickupArea.getName())
                .dropAreaName(dropArea.getName())
                .routeType(routeType)
                .customerType(request.getCustomerType())
                .paymentType(request.getPaymentType())
                .actualWeightKg(request.getActualWeightKg().setScale(2, RoundingMode.HALF_UP))
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

    private RateCardResponse mapToRateCardResponse(RateCard card) {
        return RateCardResponse.builder()
                .id(card.getId())
                .name(card.getName())
                .customerType(card.getCustomerType())
                .routeType(card.getRouteType())
                .codSurchargeFlat(card.getCodSurchargeFlat())
                .codSurchargePercentage(card.getCodSurchargePercentage())
                .active(card.getActive())
                .effectiveFrom(card.getEffectiveFrom())
                .effectiveTo(card.getEffectiveTo())
                .rules(card.getRules() != null
                        ? card.getRules().stream().map(r -> RateCardRuleDto.builder()
                        .id(r.getId())
                        .minWeightKg(r.getMinWeightKg())
                        .maxWeightKg(r.getMaxWeightKg())
                        .basePrice(r.getBasePrice())
                        .perKgRateAboveMin(r.getPerKgRateAboveMin())
                        .additionalWeightUnit(r.getAdditionalWeightUnit())
                        .build()).collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
