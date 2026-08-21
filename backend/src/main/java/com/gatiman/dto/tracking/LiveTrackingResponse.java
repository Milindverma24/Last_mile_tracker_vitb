package com.gatiman.dto.tracking;

import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveTrackingResponse {

    private Long orderId;
    private String trackingNumber;
    private OrderStatus status;
    private boolean isLive;

    // Delivery Partner Details
    private DeliveryPartnerInfo deliveryPartner;

    // Coordinates & Telemetry
    private CoordinateDto currentLocation;
    private Double heading;
    private Double speed;

    // Locations
    private LocationDetail pickupLocation;
    private LocationDetail destination;

    // Route Geometry
    private List<CoordinateDto> routeWaypoints;

    // Distance & ETA
    private Double distanceRemaining;
    private String distanceUnit;
    private Integer etaMinutes;
    private String expectedArrival;
    private Instant lastUpdated;
    private boolean nearDestination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryPartnerInfo {
        private Long id;
        private String name;
        private String phoneNumber;
        private VehicleType vehicleType;
        private String vehicleNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationDetail {
        private String name;
        private String address;
        private String pincode;
        private Double latitude;
        private Double longitude;
    }
}
