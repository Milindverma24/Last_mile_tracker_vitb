package com.gatiman.service.impl;

import com.gatiman.dto.tracking.CoordinateDto;
import com.gatiman.dto.tracking.LiveTrackingResponse;
import com.gatiman.dto.tracking.LocationUpdatePayload;
import com.gatiman.entity.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.service.LiveTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveTrackingServiceImpl implements LiveTrackingService {

    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.gatiman.service.EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.email.proximity-threshold-km:0.5}")
    private double proximityThresholdKm = 0.5;

    // High-performance concurrency-safe telemetry cache to avoid database contention on high-frequency GPS ticks
    private final Map<Long, LocationUpdatePayload> telemetryCache = new ConcurrentHashMap<>();

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a")
            .withZone(ZoneId.of("Asia/Kolkata"));

    // Delhi NCR Default Reference Coordinate (Hauz Khas)
    private static final double DEFAULT_DELHI_LAT = 28.5494;
    private static final double DEFAULT_DELHI_LNG = 77.2001;

    // Gurugram Cyber City Reference Coordinate
    private static final double DEFAULT_GGN_LAT = 28.4900;
    private static final double DEFAULT_GGN_LNG = 77.0888;

    @Override
    @Transactional(readOnly = true)
    public LiveTrackingResponse getLiveTracking(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        validateOrderReadAccess(order, user);

        return buildLiveTrackingResponse(order);
    }

    @Override
    @Transactional
    public LiveTrackingResponse updateDriverLocation(Long orderId, LocationUpdatePayload payload, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        validateDriverUpdateAccess(order, user);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.FAILED || order.getStatus() == OrderStatus.CANCELLED) {
            log.info("Ignoring GPS update for completed/terminated order {} (Status: {})", order.getTrackingNumber(), order.getStatus());
            return buildLiveTrackingResponse(order);
        }

        // 1. Cache latest telemetry
        payload.setOrderId(orderId);
        payload.setTimestamp(Instant.now());
        telemetryCache.put(orderId, payload);

        // 2. Update DeliveryAgent location
        DeliveryAgent agent = order.getAssignedAgent();
        if (agent != null) {
            agent.setCurrentLatitude(payload.getLatitude());
            agent.setCurrentLongitude(payload.getLongitude());
            agent.setLastLocationUpdate(Instant.now());
            deliveryAgentRepository.save(agent);
        }

        // 3. Build enriched response with updated distance and ETA
        LiveTrackingResponse response = buildLiveTrackingResponse(order);

        // 4. Real-time WebSocket Broadcast to active order channel
        try {
            String destinationTopic = "/topic/orders/" + orderId + "/tracking";
            String deliveryTopic = "/topic/deliveries/" + orderId + "/tracking";
            messagingTemplate.convertAndSend(destinationTopic, response);
            messagingTemplate.convertAndSend(deliveryTopic, response);
            log.debug("Broadcasted live telemetry for order {} to {}", order.getTrackingNumber(), destinationTopic);
        } catch (Exception e) {
            log.warn("Failed to broadcast WebSocket tracking event for order {}: {}", order.getTrackingNumber(), e.getMessage());
        }

        return response;
    }

    private LiveTrackingResponse buildLiveTrackingResponse(Order order) {
        // Resolve Pickup Location Coordinates
        CoordinateDto pickupCoords = resolvePickupCoordinates(order);
        LiveTrackingResponse.LocationDetail pickupDetail = LiveTrackingResponse.LocationDetail.builder()
                .name(order.getPickupName())
                .address(order.getPickupAddress())
                .pincode(order.getPickupPincode())
                .latitude(pickupCoords.getLatitude())
                .longitude(pickupCoords.getLongitude())
                .build();

        // Resolve Destination / Drop Location Coordinates
        CoordinateDto destCoords = resolveDropCoordinates(order);
        LiveTrackingResponse.LocationDetail destDetail = LiveTrackingResponse.LocationDetail.builder()
                .name(order.getDropName())
                .address(order.getDropAddress())
                .pincode(order.getDropPincode())
                .latitude(destCoords.getLatitude())
                .longitude(destCoords.getLongitude())
                .build();

        // Resolve Driver Partner Information
        DeliveryAgent agent = order.getAssignedAgent();
        LiveTrackingResponse.DeliveryPartnerInfo driverInfo = null;
        if (agent != null) {
            driverInfo = LiveTrackingResponse.DeliveryPartnerInfo.builder()
                    .id(agent.getId())
                    .name(agent.getName())
                    .phoneNumber(agent.getPhoneNumber())
                    .vehicleType(agent.getVehicleType())
                    .vehicleNumber(agent.getVehicleNumber())
                    .build();
        }

        // Resolve Current Driver Location
        LocationUpdatePayload cachedTelemetry = telemetryCache.get(order.getId());
        double currentLat;
        double currentLng;
        double heading = 0.0;
        double speed = 28.0; // default average city speed in km/h

        if (cachedTelemetry != null) {
            currentLat = cachedTelemetry.getLatitude();
            currentLng = cachedTelemetry.getLongitude();
            heading = cachedTelemetry.getHeading() != null ? cachedTelemetry.getHeading() : calculateBearing(currentLat, currentLng, destCoords.getLatitude(), destCoords.getLongitude());
            if (cachedTelemetry.getSpeed() != null && cachedTelemetry.getSpeed() > 0) {
                speed = cachedTelemetry.getSpeed();
            }
        } else if (agent != null && agent.getCurrentLatitude() != null && agent.getCurrentLongitude() != null) {
            currentLat = agent.getCurrentLatitude();
            currentLng = agent.getCurrentLongitude();
            heading = calculateBearing(currentLat, currentLng, destCoords.getLatitude(), destCoords.getLongitude());
        } else {
            // Default driver position starts at pickup origin
            currentLat = pickupCoords.getLatitude();
            currentLng = pickupCoords.getLongitude();
            heading = calculateBearing(currentLat, currentLng, destCoords.getLatitude(), destCoords.getLongitude());
        }

        CoordinateDto currentCoords = CoordinateDto.builder()
                .latitude(currentLat)
                .longitude(currentLng)
                .build();

        // Calculate Remaining Distance and ETA
        boolean isLive = (order.getStatus() == OrderStatus.PICKED_UP || order.getStatus() == OrderStatus.IN_TRANSIT || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY);
        double distanceKm;
        int etaMinutes;
        boolean nearDestination = false;

        if (order.getStatus() == OrderStatus.DELIVERED) {
            distanceKm = 0.0;
            etaMinutes = 0;
            isLive = false;
        } else {
            // Calculate geodesic distance + urban road street network factor (1.25x)
            double directDistance = haversineDistance(currentLat, currentLng, destCoords.getLatitude(), destCoords.getLongitude());
            distanceKm = Math.round(directDistance * 1.25 * 10.0) / 10.0;
            if (distanceKm < 0.1) distanceKm = 0.1;

            if (distanceKm <= proximityThresholdKm) {
                nearDestination = true;
                // Dispatch Near Destination email asynchronously (idempotent, won't duplicate)
                if (isLive) {
                    try {
                        emailService.sendNearDestinationEmail(order, distanceKm, Math.max(1, (int) Math.round((distanceKm / speed) * 60.0)));
                    } catch (Exception e) {
                        log.debug("Non-fatal error dispatching proximity email: {}", e.getMessage());
                    }
                }
            }

            // ETA: (distance / speed) * 60 minutes
            etaMinutes = Math.max(1, (int) Math.round((distanceKm / speed) * 60.0));
        }

        Instant expectedInstant = Instant.now().plusSeconds(etaMinutes * 60L);
        String expectedArrivalStr = TIME_FORMATTER.format(expectedInstant);

        // Generate Interpolated Road Waypoints from Current Location to Destination
        List<CoordinateDto> waypoints = generateRouteWaypoints(currentCoords, destCoords);

        return LiveTrackingResponse.builder()
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .status(order.getStatus())
                .isLive(isLive)
                .deliveryPartner(driverInfo)
                .currentLocation(currentCoords)
                .heading(heading)
                .speed(speed)
                .pickupLocation(pickupDetail)
                .destination(destDetail)
                .routeWaypoints(waypoints)
                .distanceRemaining(distanceKm)
                .distanceUnit("km")
                .etaMinutes(etaMinutes)
                .expectedArrival(expectedArrivalStr)
                .lastUpdated(Instant.now())
                .nearDestination(nearDestination)
                .build();
    }

    private CoordinateDto resolvePickupCoordinates(Order order) {
        if (order.getPickupArea() != null && order.getPickupArea().getLatitude() != null && order.getPickupArea().getLongitude() != null) {
            return CoordinateDto.builder()
                    .latitude(order.getPickupArea().getLatitude())
                    .longitude(order.getPickupArea().getLongitude())
                    .build();
        }
        return CoordinateDto.builder()
                .latitude(DEFAULT_DELHI_LAT)
                .longitude(DEFAULT_DELHI_LNG)
                .build();
    }

    private CoordinateDto resolveDropCoordinates(Order order) {
        if (order.getDropArea() != null && order.getDropArea().getLatitude() != null && order.getDropArea().getLongitude() != null) {
            return CoordinateDto.builder()
                    .latitude(order.getDropArea().getLatitude())
                    .longitude(order.getDropArea().getLongitude())
                    .build();
        }
        return CoordinateDto.builder()
                .latitude(DEFAULT_GGN_LAT)
                .longitude(DEFAULT_GGN_LNG)
                .build();
    }

    private void validateOrderReadAccess(Order order, User user) {
        if (user == null || user.getRole() == Role.ADMIN) {
            return; // Public lookup or Admin has full read access
        }
        if (user.getRole() == Role.CUSTOMER) {
            if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
                if (!order.getCustomer().getUser().getId().equals(user.getId())) {
                    throw new UnauthorizedException("You are not authorized to view tracking for this order.");
                }
            }
        } else if (user.getRole() == Role.DELIVERY_AGENT) {
            if (order.getAssignedAgent() != null && order.getAssignedAgent().getUser() != null) {
                if (!order.getAssignedAgent().getUser().getId().equals(user.getId())) {
                    throw new UnauthorizedException("You are not assigned to this delivery task.");
                }
            }
        }
    }

    private void validateDriverUpdateAccess(Order order, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (user.getRole() != Role.DELIVERY_AGENT) {
            throw new UnauthorizedException("Only delivery agents can broadcast live GPS coordinates.");
        }
        if (order.getAssignedAgent() == null || order.getAssignedAgent().getUser() == null ||
                !order.getAssignedAgent().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not assigned to update coordinates for this delivery.");
        }
    }

    public static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public static double calculateBearing(double lat1, double lon1, double lat2, double lon2) {
        double y = Math.sin(Math.toRadians(lon2 - lon1)) * Math.cos(Math.toRadians(lat2));
        double x = Math.cos(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))
                - Math.sin(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(lon2 - lon1));
        double brng = Math.toDegrees(Math.atan2(y, x));
        return (brng + 360) % 360;
    }

    private List<CoordinateDto> generateRouteWaypoints(CoordinateDto origin, CoordinateDto destination) {
        List<CoordinateDto> waypoints = new ArrayList<>();
        waypoints.add(origin);

        int intermediateSteps = 8;
        for (int i = 1; i <= intermediateSteps; i++) {
            double fraction = (double) i / (intermediateSteps + 1);
            // Linear interpolation with slight natural road curvature offset
            double baseLat = origin.getLatitude() + fraction * (destination.getLatitude() - origin.getLatitude());
            double baseLng = origin.getLongitude() + fraction * (destination.getLongitude() - origin.getLongitude());

            // Add slight deterministic sine bend to represent real road turns
            double bend = Math.sin(fraction * Math.PI) * 0.0035;
            waypoints.add(new CoordinateDto(baseLat + bend, baseLng - (bend * 0.7)));
        }

        waypoints.add(destination);
        return waypoints;
    }
}
