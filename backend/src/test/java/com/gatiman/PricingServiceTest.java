package com.gatiman;

import com.gatiman.dto.order.ChargeCalculationRequest;
import com.gatiman.dto.order.ChargeCalculationResponse;
import com.gatiman.dto.zone.ZoneDetectionResult;
import com.gatiman.entity.Area;
import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.entity.Zone;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.RouteType;
import com.gatiman.service.*;
import com.gatiman.service.impl.PricingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private ZoneDetectionService zoneDetectionService;

    @Mock
    private VolumetricWeightService volumetricWeightService;

    @Mock
    private RateCardRuleService rateCardRuleService;

    @Mock
    private CodPricingService codPricingService;

    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingServiceImpl(
                zoneDetectionService,
                volumetricWeightService,
                rateCardRuleService,
                codPricingService
        );
    }

    @Test
    @DisplayName("Complete composite pricing calculation flow (Volumetric + Slab + COD)")
    void testCompletePricingFlow() {
        ChargeCalculationRequest req = ChargeCalculationRequest.builder()
                .customerType(CustomerType.B2C)
                .paymentType(PaymentType.COD)
                .pickupPincode("110016")
                .dropPincode("122002")
                .lengthCm(new BigDecimal("30"))
                .breadthCm(new BigDecimal("20"))
                .heightCm(new BigDecimal("20"))
                .actualWeightKg(new BigDecimal("1.50"))
                .build();

        Zone southDelhi = Zone.builder().id(1L).name("South Delhi Express Zone").code("DL-SOUTH").build();
        Zone gurugram = Zone.builder().id(3L).name("Gurugram Cyber Hub Zone").code("GGN-CENTRAL").build();
        Area hauzKhas = Area.builder().id(1L).name("Hauz Khas").pincode("110016").zone(southDelhi).build();
        Area cyberCity = Area.builder().id(6L).name("DLF Cyber City").pincode("122002").zone(gurugram).build();

        when(zoneDetectionService.detectPickupZone("110016", null))
                .thenReturn(ZoneDetectionResult.builder().zone(southDelhi).area(hauzKhas).build());
        when(zoneDetectionService.detectDropZone("122002", null))
                .thenReturn(ZoneDetectionResult.builder().zone(gurugram).area(cyberCity).build());
        when(zoneDetectionService.determineRouteType(southDelhi, gurugram))
                .thenReturn(RouteType.INTER_ZONE);

        when(volumetricWeightService.calculateVolumetricWeight(new BigDecimal("30"), new BigDecimal("20"), new BigDecimal("20")))
                .thenReturn(new BigDecimal("2.40"));
        when(volumetricWeightService.calculateBillableWeight(new BigDecimal("1.50"), new BigDecimal("2.40")))
                .thenReturn(new BigDecimal("2.40"));
        when(volumetricWeightService.formatWeightFormula(any(), any(), any(), any()))
                .thenReturn("(30 × 20 × 20) / 5000 = 2.40 kg");

        RateCard card = RateCard.builder().id(2L).name("Standard B2C Inter-Zone Express").build();
        RateCardRule rule = RateCardRule.builder().id(2L).basePrice(new BigDecimal("90.00")).build();

        when(rateCardRuleService.findActiveRateCard(CustomerType.B2C, RouteType.INTER_ZONE)).thenReturn(card);
        when(rateCardRuleService.findMatchingRule(card, new BigDecimal("2.40"))).thenReturn(rule);
        when(rateCardRuleService.calculateBaseCharge(rule, new BigDecimal("2.40"))).thenReturn(new BigDecimal("115.00"));
        when(codPricingService.calculateCodSurcharge(card, new BigDecimal("115.00"), PaymentType.COD)).thenReturn(new BigDecimal("42.30"));

        ChargeCalculationResponse resp = pricingService.calculateCharge(req);

        assertNotNull(resp);
        assertEquals(RouteType.INTER_ZONE, resp.getRouteType());
        assertEquals(new BigDecimal("2.40"), resp.getVolumetricWeightKg());
        assertEquals(new BigDecimal("2.40"), resp.getBillableWeightKg());
        assertEquals(new BigDecimal("115.00"), resp.getBaseCharge());
        assertEquals(new BigDecimal("42.30"), resp.getCodSurcharge());
        assertEquals(new BigDecimal("157.30"), resp.getTotalCharge());
    }
}
