package com.gatiman;

import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.RateCardRepository;
import com.gatiman.service.RateCardRuleService;
import com.gatiman.service.impl.RateCardRuleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateCardRuleServiceTest {

    @Mock
    private RateCardRepository rateCardRepository;

    private RateCardRuleService rateCardRuleService;

    private RateCard b2cInterZoneCard;

    @BeforeEach
    void setUp() {
        rateCardRuleService = new RateCardRuleServiceImpl(rateCardRepository);

        b2cInterZoneCard = RateCard.builder()
                .id(2L)
                .name("Standard B2C Inter-Zone Express")
                .customerType(CustomerType.B2C)
                .routeType(RouteType.INTER_ZONE)
                .codSurchargeFlat(new BigDecimal("40.00"))
                .codSurchargePercentage(new BigDecimal("2.00"))
                .isActive(true)
                .rules(new ArrayList<>())
                .build();

        RateCardRule rule1 = RateCardRule.builder()
                .id(1L)
                .minWeightKg(new BigDecimal("0.00"))
                .maxWeightKg(new BigDecimal("2.00"))
                .basePrice(new BigDecimal("90.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .rateCard(b2cInterZoneCard)
                .build();

        RateCardRule rule2 = RateCardRule.builder()
                .id(2L)
                .minWeightKg(new BigDecimal("2.00"))
                .maxWeightKg(new BigDecimal("5.00"))
                .basePrice(new BigDecimal("90.00"))
                .perKgRateAboveMin(new BigDecimal("25.00"))
                .rateCard(b2cInterZoneCard)
                .build();

        b2cInterZoneCard.getRules().addAll(List.of(rule1, rule2));
    }

    @Test
    @DisplayName("Match 1.5kg parcel to 0-2kg base slab")
    void testMatchBaseSlab() {
        RateCardRule rule = rateCardRuleService.findMatchingRule(b2cInterZoneCard, new BigDecimal("1.50"));
        assertNotNull(rule);
        assertEquals(new BigDecimal("2.00"), rule.getMaxWeightKg());
        assertEquals(new BigDecimal("90.00"), rule.getBasePrice());
    }

    @Test
    @DisplayName("Calculate base charge for 2.40kg parcel in 2-5kg slab with incremental rate")
    void testCalculateBaseChargeWithIncremental() {
        RateCardRule rule = rateCardRuleService.findMatchingRule(b2cInterZoneCard, new BigDecimal("2.40"));
        BigDecimal charge = rateCardRuleService.calculateBaseCharge(rule, new BigDecimal("2.40"));

        // 90.00 + ceil(2.40 - 2.00) * 25.00 = 90 + 1 * 25 = 115.00
        assertEquals(new BigDecimal("115.00"), charge);
    }

    @Test
    @DisplayName("Validate rate card rules rejects overlapping slabs")
    void testRejectOverlappingRules() {
        RateCardRule slab1 = RateCardRule.builder()
                .minWeightKg(new BigDecimal("0.00"))
                .maxWeightKg(new BigDecimal("3.00"))
                .basePrice(new BigDecimal("50.00"))
                .build();

        RateCardRule slab2 = RateCardRule.builder()
                .minWeightKg(new BigDecimal("2.00"))
                .maxWeightKg(new BigDecimal("5.00"))
                .basePrice(new BigDecimal("80.00"))
                .build();

        assertThrows(BusinessRuleException.class, () ->
                rateCardRuleService.validateRateCardRules(List.of(slab1, slab2)));
    }
}
