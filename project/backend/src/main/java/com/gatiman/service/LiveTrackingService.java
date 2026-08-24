package com.gatiman.service;

import com.gatiman.dto.tracking.LiveTrackingResponse;
import com.gatiman.dto.tracking.LocationUpdatePayload;
import com.gatiman.entity.User;

public interface LiveTrackingService {
    LiveTrackingResponse getLiveTracking(Long orderId, User user);
    LiveTrackingResponse updateDriverLocation(Long orderId, LocationUpdatePayload payload, User user);
}
