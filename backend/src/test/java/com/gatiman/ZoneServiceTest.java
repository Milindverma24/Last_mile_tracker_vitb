package com.gatiman;

import com.gatiman.dto.zone.ZoneRequest;
import com.gatiman.dto.zone.ZoneResponse;
import com.gatiman.entity.Zone;
import com.gatiman.repository.AreaRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.service.impl.ZoneServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ZoneServiceTest {

    @Mock private ZoneRepository zoneRepository;
    @Mock private AreaRepository areaRepository;

    @InjectMocks
    private ZoneServiceImpl zoneService;

    private Zone zone;

    @BeforeEach
    void setUp() {
        zone = Zone.builder()
                .id(1L)
                .code("DL-SOUTH")
                .name("South Delhi")
                .city("New Delhi")
                .state("Delhi")
                .active(true)
                .isActive(true)
                .build();
    }

    @Test
    void testGetAllZones() {
        when(zoneRepository.findAll()).thenReturn(List.of(zone));
        List<ZoneResponse> zones = zoneService.getAllZones();
        assertFalse(zones.isEmpty());
        assertEquals("DL-SOUTH", zones.get(0).getCode());
    }

    @Test
    void testCreateZone() {
        ZoneRequest req = ZoneRequest.builder().code("DL-EAST").name("East Delhi").city("New Delhi").state("Delhi").active(true).build();
        when(zoneRepository.findByCode("DL-EAST")).thenReturn(Optional.empty());
        when(zoneRepository.save(any(Zone.class))).thenAnswer(i -> {
            Zone z = i.getArgument(0);
            z.setId(2L);
            return z;
        });

        ZoneResponse res = zoneService.createZone(req);
        assertNotNull(res);
        assertEquals("DL-EAST", res.getCode());
    }
}
