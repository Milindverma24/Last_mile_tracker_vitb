package com.gatiman.service;

import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;

import java.math.BigDecimal;
import java.util.List;

public interface RateCardRuleService {
    RateCard findActiveRateCard(CustomerType customerType, RouteType routeType);
    RateCardRule findMatchingRule(RateCard rateCard, BigDecimal billableWeight);
    BigDecimal calculateBaseCharge(RateCardRule rule, BigDecimal billableWeight);
    void validateRateCardRules(List<RateCardRule> rules);
}
