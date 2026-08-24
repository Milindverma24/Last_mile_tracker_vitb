package com.gatiman;

import com.gatiman.dto.zone.ZoneDetectionResult;
import com.gatiman.entity.Area;
import com.gatiman.entity.Zone;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.AreaRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.service.ZoneDetectionService;
import com.gatiman.service.impl.ZoneDetectionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ZoneDetectionServiceTest {

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private ZoneRepository zoneRepository;

    private ZoneDetectionService zoneDetectionService;

    private Zone southDelhiZone;
    private Zone gurugramZone;
    private Area hauzKhasArea;
    private Area cyberCityArea;

    @BeforeEach
    void setUp() {
        zoneDetectionService = new ZoneDetectionServiceImpl(areaRepository, zoneRepository);

        southDelhiZone = Zone.builder().id(1L).code("DL-SOUTH").name("South Delhi Express Zone").isActive(true).build();
        gurugramZone = Zone.builder().id(3L).code("GGN-CENTRAL").name("Gurugram Cyber Hub Zone").isActive(true).build();

        hauzKhasArea = Area.builder().id(1L).name("Hauz Khas").pincode("110016").zone(southDelhiZone).active(true).build();
        cyberCityArea = Area.builder().id(6L).name("DLF Cyber City").pincode("122002").zone(gurugramZone).active(true).build();
    }

    @Test
    @DisplayName("Detect zone by mapped PIN code successfully")
    void testDetectZoneByPincode() {
        when(areaRepository.findByPincode("110016")).thenReturn(Optional.of(hauzKhasArea));

        ZoneDetectionResult result = zoneDetectionService.detectPickupZone("110016", null);
        assertNotNull(result);
        assertEquals("DL-SOUTH", result.getZone().getCode());
        assertEquals("Hauz Khas", result.getArea().getName());
        assertEquals(1.0, result.getConfidence());
    }

    @Test
    @DisplayName("Determine INTRA_ZONE route when pickup and drop in same zone")
    void testIntraZoneRoute() {
        RouteType route = zoneDetectionService.determineRouteType(southDelhiZone, southDelhiZone);
        assertEquals(RouteType.INTRA_ZONE, route);
    }

    @Test
    @DisplayName("Determine INTER_ZONE route when pickup and drop in different zones")
    void testInterZoneRoute() {
        RouteType route = zoneDetectionService.determineRouteType(southDelhiZone, gurugramZone);
        assertEquals(RouteType.INTER_ZONE, route);
    }

    @Test
    @DisplayName("Reject unmapped or missing PIN code with ZONE_NOT_FOUND")
    void testUnknownPincodeThrows() {
        when(areaRepository.findByPincode("999999")).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () ->
                zoneDetectionService.detectPickupZone("999999", null));
    }
}
