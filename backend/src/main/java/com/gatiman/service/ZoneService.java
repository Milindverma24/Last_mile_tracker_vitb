package com.gatiman.service;

import com.gatiman.dto.zone.AreaRequest;
import com.gatiman.dto.zone.AreaResponse;
import com.gatiman.dto.zone.ZoneRequest;
import com.gatiman.dto.zone.ZoneResponse;
import com.gatiman.entity.Area;
import com.gatiman.entity.Zone;
import com.gatiman.enums.RouteType;
import java.util.List;

public interface ZoneService {
    List<ZoneResponse> getAllZones();
    ZoneResponse getZoneById(Long id);
    ZoneResponse createZone(ZoneRequest request);
    ZoneResponse updateZone(Long id, ZoneRequest request);
    void deleteZone(Long id);

    AreaResponse addAreaToZone(Long zoneId, AreaRequest request);
    List<AreaResponse> getAreasByZoneId(Long zoneId);
    Area resolveAreaByPincode(String pincode);
    Zone resolveZoneForArea(Area area);
    RouteType determineRouteType(Zone pickupZone, Zone dropZone);
}
