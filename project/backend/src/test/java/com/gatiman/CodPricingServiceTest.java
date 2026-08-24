package com.gatiman;

import com.gatiman.entity.RateCard;
import com.gatiman.enums.PaymentType;
import com.gatiman.service.CodPricingService;
import com.gatiman.service.impl.CodPricingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CodPricingServiceTest {

    private CodPricingService codPricingService;
    private RateCard rateCard;

    @BeforeEach
    void setUp() {
        codPricingService = new CodPricingServiceImpl();

        rateCard = RateCard.builder()
                .codSurchargeFlat(new BigDecimal("40.00"))
                .codSurchargePercentage(new BigDecimal("2.00"))
                .build();
    }

    @Test
    @DisplayName("Calculate COD surcharge: flat 40 + 2% of 115 = 42.30")
    void testCalculateCodSurcharge() {
        BigDecimal baseCharge = new BigDecimal("115.00");
        BigDecimal surcharge = codPricingService.calculateCodSurcharge(rateCard, baseCharge, PaymentType.COD);

        // 40 + (115 * 0.02) = 40 + 2.30 = 42.30
        assertEquals(new BigDecimal("42.30"), surcharge);
    }

    @Test
    @DisplayName("Prepaid payment mode incurs zero COD surcharge")
    void testPrepaidZeroCodSurcharge() {
        BigDecimal baseCharge = new BigDecimal("115.00");
        BigDecimal surcharge = codPricingService.calculateCodSurcharge(rateCard, baseCharge, PaymentType.PREPAID);

        assertEquals(new BigDecimal("0.00"), surcharge);
    }
}
