package com.gatiman;

import com.gatiman.dto.order.ChargeCalculationRequest;
import com.gatiman.dto.order.ChargeCalculationResponse;
import com.gatiman.entity.Area;
import com.gatiman.entity.RateCard;
import com.gatiman.entity.RateCardRule;
import com.gatiman.entity.Zone;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.RouteType;
import com.gatiman.repository.RateCardRepository;
import com.gatiman.service.ZoneService;
import com.gatiman.service.impl.RateCardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RateCardServiceTest {

    @Mock
    private RateCardRepository rateCardRepository;

    @Mock
    private ZoneService zoneService;

    @InjectMocks
    private RateCardServiceImpl rateCardService;

    private Zone southZone;
    private Zone northZone;
    private Area pickupArea;
    private Area dropArea;
    private RateCard b2cInterCard;

    @BeforeEach
    void setUp() {
        southZone = Zone.builder().id(1L).code("DL-SOUTH").name("South Delhi").active(true).isActive(true).build();
        northZone = Zone.builder().id(2L).code("DL-NORTH").name("North Delhi").active(true).isActive(true).build();

        pickupArea = Area.builder().id(10L).name("Hauz Khas").pincode("110016").zone(southZone).build();
        dropArea = Area.builder().id(20L).name("Civil Lines").pincode("110054").zone(northZone).build();

        b2cInterCard = RateCard.builder()
                .id(100L)
                .name("B2C Inter-Zone")
                .customerType(CustomerType.B2C)
                .routeType(RouteType.INTER_ZONE)
                .codSurchargeFlat(new BigDecimal("40.00"))
                .codSurchargePercentage(new BigDecimal("2.00"))
                .active(true)
                .isActive(true)
                .rules(new ArrayList<>())
                .build();

        RateCardRule rule1 = RateCardRule.builder()
                .rateCard(b2cInterCard)
                .minWeightKg(BigDecimal.ZERO)
                .maxWeightKg(new BigDecimal("2.000"))
                .basePrice(new BigDecimal("90.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .build();

        RateCardRule rule2 = RateCardRule.builder()
                .rateCard(b2cInterCard)
                .minWeightKg(new BigDecimal("2.000"))
                .maxWeightKg(new BigDecimal("10.000"))
                .basePrice(new BigDecimal("90.00"))
                .perKgRateAboveMin(new BigDecimal("25.00"))
                .build();

        b2cInterCard.getRules().add(rule1);
        b2cInterCard.getRules().add(rule2);
    }

    @Test
    void testVolumetricWeightCalculation() {
        // (30 * 20 * 20) / 5000 = 12000 / 5000 = 2.40 kg
        BigDecimal volumetric = rateCardService.calculateVolumetricWeight(
                new BigDecimal("30"), new BigDecimal("20"), new BigDecimal("20"));
        assertEquals(new BigDecimal("2.40"), volumetric);
    }

    @Test
    void testBillableWeightIsMaxOfActualAndVolumetric() {
        BigDecimal actual = new BigDecimal("1.50");
        BigDecimal volumetric = new BigDecimal("2.40");
        BigDecimal billable = rateCardService.calculateBillableWeight(actual, volumetric);
        assertEquals(new BigDecimal("2.40"), billable);
    }

    @Test
    void testChargeCalculationWithCod() {
        when(zoneService.resolveAreaByPincode("110016")).thenReturn(pickupArea);
        when(zoneService.resolveAreaByPincode("110054")).thenReturn(dropArea);
        when(zoneService.resolveZoneForArea(pickupArea)).thenReturn(southZone);
        when(zoneService.resolveZoneForArea(dropArea)).thenReturn(northZone);
        when(zoneService.determineRouteType(southZone, northZone)).thenReturn(RouteType.INTER_ZONE);
        when(rateCardRepository.findByCustomerTypeAndRouteTypeAndIsActiveTrue(CustomerType.B2C, RouteType.INTER_ZONE))
                .thenReturn(Optional.of(b2cInterCard));

        ChargeCalculationRequest request = ChargeCalculationRequest.builder()
                .customerType(CustomerType.B2C)
                .paymentType(PaymentType.COD)
                .pickupPincode("110016")
                .dropPincode("110054")
                .lengthCm(new BigDecimal("30"))
                .breadthCm(new BigDecimal("20"))
                .heightCm(new BigDecimal("20"))
                .actualWeightKg(new BigDecimal("1.50"))
                .build();

        ChargeCalculationResponse response = rateCardService.calculateCharges(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("2.40"), response.getVolumetricWeightKg());
        assertEquals(new BigDecimal("2.40"), response.getBillableWeightKg());
        // Base charge: 90 + ceil(2.4 - 2.0)*25 = 90 + 25 = 115.00
        assertEquals(new BigDecimal("115.00"), response.getBaseCharge());
        // COD Surcharge: 40 + (115 * 0.02 = 2.30) = 42.30
        assertEquals(new BigDecimal("42.30"), response.getCodSurcharge());
        // Total: 115 + 42.30 = 157.30
        assertEquals(new BigDecimal("157.30"), response.getTotalCharge());
    }
}
