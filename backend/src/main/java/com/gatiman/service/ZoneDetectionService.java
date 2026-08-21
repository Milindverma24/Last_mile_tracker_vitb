package com.gatiman.service;

import com.gatiman.dto.zone.ZoneDetectionResult;
import com.gatiman.entity.Area;
import com.gatiman.entity.Zone;
import com.gatiman.enums.RouteType;

import java.util.Optional;

public interface ZoneDetectionService {
    ZoneDetectionResult detectPickupZone(String pincode, String areaName);
    ZoneDetectionResult detectDropZone(String pincode, String areaName);
    Optional<Zone> findZoneByPinCode(String pincode);
    Optional<Zone> findZoneByArea(String areaName);
    RouteType determineRouteType(Zone pickupZone, Zone dropZone);
}
