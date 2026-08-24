package com.gatiman.service.impl;

import com.gatiman.dto.zone.ZoneDetectionResult;
import com.gatiman.entity.Area;
import com.gatiman.entity.Zone;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.AreaRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.service.ZoneDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZoneDetectionServiceImpl implements ZoneDetectionService {

    private final AreaRepository areaRepository;
    private final ZoneRepository zoneRepository;

    @Override
    @Transactional(readOnly = true)
    public ZoneDetectionResult detectPickupZone(String pincode, String areaName) {
        return detectZoneInternal(pincode, areaName, "PICKUP");
    }

    @Override
    @Transactional(readOnly = true)
    public ZoneDetectionResult detectDropZone(String pincode, String areaName) {
        return detectZoneInternal(pincode, areaName, "DROP");
    }

    private ZoneDetectionResult detectZoneInternal(String pincode, String areaName, String context) {
        if (pincode == null || pincode.trim().isEmpty()) {
            throw new BusinessRuleException("ZONE_NOT_FOUND: " + context + " PIN code is required for zone detection.");
        }

        String cleanPin = pincode.trim();
        Optional<Area> areaOpt = areaRepository.findByPincode(cleanPin);

        if (areaOpt.isPresent()) {
            Area area = areaOpt.get();
            Zone zone = area.getZone();
            if (zone == null || !Boolean.TRUE.equals(zone.getIsActive())) {
                throw new BusinessRuleException("ZONE_NOT_FOUND: Delivery zone for PIN code " + cleanPin + " is inactive or not configured.");
            }
            return ZoneDetectionResult.builder()
                    .area(area)
                    .zone(zone)
                    .pincode(cleanPin)
                    .source("PINCODE_DATABASE")
                    .confidence(1.0)
                    .build();
        }

        // Fallback search by area name if provided
        if (areaName != null && !areaName.trim().isEmpty()) {
            Optional<Zone> zoneByArea = findZoneByArea(areaName.trim());
            if (zoneByArea.isPresent() && Boolean.TRUE.equals(zoneByArea.get().getIsActive())) {
                Zone z = zoneByArea.get();
                Area syntheticArea = z.getAreas().stream().findFirst().orElseGet(() ->
                        Area.builder().name(areaName).pincode(cleanPin).zone(z).active(true).build()
                );
                return ZoneDetectionResult.builder()
                        .area(syntheticArea)
                        .zone(z)
                        .pincode(cleanPin)
                        .source("AREA_DATABASE")
                        .confidence(0.85)
                        .build();
            }
        }

        throw new BusinessRuleException("ZONE_NOT_FOUND: Could not identify an active delivery zone for " + context + " PIN " + cleanPin + ".");
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Zone> findZoneByPinCode(String pincode) {
        return areaRepository.findByPincode(pincode).map(Area::getZone);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Zone> findZoneByArea(String areaName) {
        return zoneRepository.findAll().stream()
                .filter(z -> z.getName().toLowerCase().contains(areaName.toLowerCase()) ||
                        (z.getDescription() != null && z.getDescription().toLowerCase().contains(areaName.toLowerCase())))
                .findFirst();
    }

    @Override
    public RouteType determineRouteType(Zone pickupZone, Zone dropZone) {
        if (pickupZone == null || dropZone == null) {
            throw new BusinessRuleException("ZONE_NOT_FOUND: Both pickup and drop zones must be resolved to determine route type.");
        }
        if (pickupZone.getId() != null && dropZone.getId() != null && pickupZone.getId().equals(dropZone.getId())) {
            return RouteType.INTRA_ZONE;
        }
        if (pickupZone.getCode() != null && dropZone.getCode() != null && pickupZone.getCode().equalsIgnoreCase(dropZone.getCode())) {
            return RouteType.INTRA_ZONE;
        }

        String pickupState = pickupZone.getState() != null ? pickupZone.getState().trim().toLowerCase() : "";
        String dropState = dropZone.getState() != null ? dropZone.getState().trim().toLowerCase() : "";

        if (!pickupState.isEmpty() && !dropState.isEmpty() && !pickupState.equalsIgnoreCase(dropState)) {
            return RouteType.INTER_STATE;
        }

        return RouteType.INTER_ZONE;
    }
}
