package com.gatiman.service.impl;

import com.gatiman.dto.zone.AreaRequest;
import com.gatiman.dto.zone.AreaResponse;
import com.gatiman.dto.zone.ZoneRequest;
import com.gatiman.dto.zone.ZoneResponse;
import com.gatiman.entity.Area;
import com.gatiman.entity.Zone;
import com.gatiman.enums.RouteType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.AreaRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;
    private final AreaRepository areaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ZoneResponse> getAllZones() {
        return zoneRepository.findAll().stream()
                .map(this::mapToZoneResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ZoneResponse getZoneById(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));
        return mapToZoneResponse(zone);
    }

    @Override
    @Transactional
    public ZoneResponse createZone(ZoneRequest request) {
        if (zoneRepository.findByCode(request.getCode()).isPresent()) {
            throw new BusinessRuleException("Zone with code already exists: " + request.getCode());
        }

        Zone zone = Zone.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .city(request.getCity())
                .state(request.getState())
                .active(request.getActive() != null ? request.getActive() : true)
                .isActive(request.getActive() != null ? request.getActive() : true)
                .build();

        Zone saved = zoneRepository.save(zone);
        return mapToZoneResponse(saved);
    }

    @Override
    @Transactional
    public ZoneResponse updateZone(Long id, ZoneRequest request) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));

        zone.setName(request.getName());
        zone.setDescription(request.getDescription());
        zone.setCity(request.getCity());
        zone.setState(request.getState());
        if (request.getActive() != null) {
            zone.setActive(request.getActive());
            zone.setIsActive(request.getActive());
        }

        Zone updated = zoneRepository.save(zone);
        return mapToZoneResponse(updated);
    }

    @Override
    @Transactional
    public void deleteZone(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));
        zone.setActive(false);
        zone.setIsActive(false);
        zoneRepository.save(zone);
    }

    @Override
    @Transactional
    public AreaResponse addAreaToZone(Long zoneId, AreaRequest request) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + zoneId));

        Area area = Area.builder()
                .zone(zone)
                .name(request.getName())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Area saved = areaRepository.save(area);
        return mapToAreaResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponse> getAreasByZoneId(Long zoneId) {
        return areaRepository.findByZoneId(zoneId).stream()
                .map(this::mapToAreaResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Area resolveAreaByPincode(String pincode) {
        return areaRepository.findByPincode(pincode)
                .orElseGet(() -> areaRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No areas configured in system.")));
    }

    @Override
    @Transactional(readOnly = true)
    public Zone resolveZoneForArea(Area area) {
        if (area.getZone() != null) {
            return area.getZone();
        }
        return zoneRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No zones configured in system."));
    }

    @Override
    public RouteType determineRouteType(Zone pickupZone, Zone dropZone) {
        if (pickupZone == null || dropZone == null) {
            return RouteType.INTRA_ZONE;
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

    private ZoneResponse mapToZoneResponse(Zone zone) {
        return ZoneResponse.builder()
                .id(zone.getId())
                .code(zone.getCode())
                .name(zone.getName())
                .description(zone.getDescription())
                .city(zone.getCity())
                .state(zone.getState())
                .active(zone.getActive())
                .areas(zone.getAreas() != null
                        ? zone.getAreas().stream().map(this::mapToAreaResponse).collect(Collectors.toList())
                        : List.of())
                .build();
    }

    private AreaResponse mapToAreaResponse(Area area) {
        return AreaResponse.builder()
                .id(area.getId())
                .name(area.getName())
                .pincode(area.getPincode())
                .zoneId(area.getZone() != null ? area.getZone().getId() : null)
                .zoneName(area.getZone() != null ? area.getZone().getName() : "")
                .latitude(area.getLatitude())
                .longitude(area.getLongitude())
                .active(area.getActive())
                .build();
    }
}
