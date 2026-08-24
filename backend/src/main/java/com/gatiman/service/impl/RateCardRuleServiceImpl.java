package com.gatiman.service.impl;

import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.RateCardRepository;
import com.gatiman.service.RateCardRuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateCardRuleServiceImpl implements RateCardRuleService {

    private final RateCardRepository rateCardRepository;

    @Override
    @Transactional(readOnly = true)
    public RateCard findActiveRateCard(CustomerType customerType, RouteType routeType) {
        return rateCardRepository.findByCustomerTypeAndRouteTypeAndIsActiveTrue(customerType, routeType)
                .or(() -> {
                    if (routeType == RouteType.INTER_STATE || routeType == RouteType.INTER_CITY) {
                        return rateCardRepository.findByCustomerTypeAndRouteTypeAndIsActiveTrue(customerType, RouteType.INTER_ZONE);
                    } else if (routeType == RouteType.INTRA_CITY) {
                        return rateCardRepository.findByCustomerTypeAndRouteTypeAndIsActiveTrue(customerType, RouteType.INTRA_ZONE);
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new BusinessRuleException(
                        String.format("NO_ACTIVE_RATE_CARD: No active rate card configured for %s %s shipments.",
                                customerType, routeType)));
    }

    @Override
    public RateCardRule findMatchingRule(RateCard rateCard, BigDecimal billableWeight) {
        if (rateCard == null || rateCard.getRules() == null || rateCard.getRules().isEmpty()) {
            throw new BusinessRuleException("NO_ACTIVE_RATE_CARD: Rate card has no configured weight slab rules.");
        }

        List<RateCardRule> sortedRules = rateCard.getRules().stream()
                .sorted(Comparator.comparing(RateCardRule::getMinWeightKg))
                .toList();

        for (RateCardRule rule : sortedRules) {
            BigDecimal min = rule.getMinWeightKg();
            BigDecimal max = rule.getMaxWeightKg();

            // Match if billableWeight >= min and (max is unbounded or billableWeight <= max)
            boolean matchesMin = min == null || billableWeight.compareTo(min) >= 0;
            boolean matchesMax = max == null || billableWeight.compareTo(max) <= 0;

            if (matchesMin && matchesMax) {
                return rule;
            }
        }

        // If weight exceeds highest defined max, use the top slab as open-ended tier
        RateCardRule highestRule = sortedRules.get(sortedRules.size() - 1);
        if (billableWeight.compareTo(highestRule.getMaxWeightKg()) > 0) {
            return highestRule;
        }

        throw new BusinessRuleException(
                String.format("NO_MATCHING_WEIGHT_RULE: No weight slab matches billable weight %s kg in rate card '%s'.",
                        billableWeight, rateCard.getName()));
    }

    @Override
    public BigDecimal calculateBaseCharge(RateCardRule rule, BigDecimal billableWeight) {
        BigDecimal base = rule.getBasePrice() != null ? rule.getBasePrice() : BigDecimal.ZERO;

        if (rule.getPerKgRateAboveMin() != null && rule.getPerKgRateAboveMin().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal min = rule.getMinWeightKg() != null ? rule.getMinWeightKg() : BigDecimal.ZERO;
            if (billableWeight.compareTo(min) > 0) {
                BigDecimal excessWeight = billableWeight.subtract(min);
                // Standard parcel freight: ceil excess weight to full kilograms or unit increments
                BigDecimal billableExcessUnits = excessWeight.setScale(0, RoundingMode.CEILING);
                BigDecimal incremental = billableExcessUnits.multiply(rule.getPerKgRateAboveMin());
                base = base.add(incremental);
            }
        }

        return base.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public void validateRateCardRules(List<RateCardRule> rules) {
        if (rules == null || rules.isEmpty()) {
            throw new BusinessRuleException("INVALID_WEIGHT_RANGE: Rate card must have at least one weight rule slab.");
        }

        List<RateCardRule> sorted = rules.stream()
                .sorted(Comparator.comparing(r -> r.getMinWeightKg() != null ? r.getMinWeightKg() : BigDecimal.ZERO))
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            RateCardRule current = sorted.get(i);
            if (current.getMinWeightKg() == null || current.getMaxWeightKg() == null) {
                throw new BusinessRuleException("INVALID_WEIGHT_RANGE: Minimum and maximum weight boundaries cannot be null.");
            }
            if (current.getMinWeightKg().compareTo(current.getMaxWeightKg()) >= 0) {
                throw new BusinessRuleException(String.format("INVALID_WEIGHT_RANGE: Min weight (%s) must be strictly less than max weight (%s).",
                        current.getMinWeightKg(), current.getMaxWeightKg()));
            }
            if (current.getBasePrice() == null || current.getBasePrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessRuleException("INVALID_CHARGE: Base price must be a non-negative number.");
            }

            if (i > 0) {
                RateCardRule previous = sorted.get(i - 1);
                if (current.getMinWeightKg().compareTo(previous.getMaxWeightKg()) < 0) {
                    throw new BusinessRuleException(String.format("RATE_CARD_OVERLAP: Weight slab [%s - %s] overlaps with previous slab [%s - %s].",
                            current.getMinWeightKg(), current.getMaxWeightKg(), previous.getMinWeightKg(), previous.getMaxWeightKg()));
                }
            }
        }
    }
}
