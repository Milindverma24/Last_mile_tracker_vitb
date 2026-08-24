package com.gatiman;

import com.gatiman.exception.BusinessRuleException;
import com.gatiman.service.VolumetricWeightService;
import com.gatiman.service.impl.VolumetricWeightServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class VolumetricWeightServiceTest {

    private VolumetricWeightService volumetricWeightService;

    @BeforeEach
    void setUp() {
        volumetricWeightService = new VolumetricWeightServiceImpl();
    }

    @Test
    @DisplayName("Calculate volumetric weight: (30 x 20 x 20) / 5000 = 2.40 kg")
    void testVolumetricWeightStandardBox() {
        BigDecimal length = new BigDecimal("30");
        BigDecimal breadth = new BigDecimal("20");
        BigDecimal height = new BigDecimal("20");

        BigDecimal result = volumetricWeightService.calculateVolumetricWeight(length, breadth, height);
        assertEquals(new BigDecimal("2.40"), result);
    }

    @Test
    @DisplayName("Calculate volumetric weight with decimal dimensions")
    void testVolumetricWeightDecimalDimensions() {
        BigDecimal length = new BigDecimal("25.5");
        BigDecimal breadth = new BigDecimal("15.2");
        BigDecimal height = new BigDecimal("10.0");

        // 25.5 * 15.2 * 10 = 3876 / 5000 = 0.7752 -> 0.78
        BigDecimal result = volumetricWeightService.calculateVolumetricWeight(length, breadth, height);
        assertEquals(new BigDecimal("0.78"), result);
    }

    @Test
    @DisplayName("Billable weight selects actual when actual > volumetric")
    void testBillableWeightActualHigher() {
        BigDecimal actual = new BigDecimal("5.50");
        BigDecimal volumetric = new BigDecimal("3.20");

        BigDecimal billable = volumetricWeightService.calculateBillableWeight(actual, volumetric);
        assertEquals(new BigDecimal("5.50"), billable);
    }

    @Test
    @DisplayName("Billable weight selects volumetric when volumetric > actual")
    void testBillableWeightVolumetricHigher() {
        BigDecimal actual = new BigDecimal("1.50");
        BigDecimal volumetric = new BigDecimal("4.80");

        BigDecimal billable = volumetricWeightService.calculateBillableWeight(actual, volumetric);
        assertEquals(new BigDecimal("4.80"), billable);
    }

    @Test
    @DisplayName("Reject non-positive dimension (zero/negative)")
    void testRejectInvalidDimensions() {
        assertThrows(BusinessRuleException.class, () ->
                volumetricWeightService.calculateVolumetricWeight(BigDecimal.ZERO, new BigDecimal("20"), new BigDecimal("10")));

        assertThrows(BusinessRuleException.class, () ->
                volumetricWeightService.calculateVolumetricWeight(new BigDecimal("30"), new BigDecimal("-5"), new BigDecimal("10")));
    }

    @Test
    @DisplayName("Reject non-positive actual weight")
    void testRejectInvalidActualWeight() {
        assertThrows(BusinessRuleException.class, () ->
                volumetricWeightService.calculateBillableWeight(BigDecimal.ZERO, new BigDecimal("2.00")));
    }
}
