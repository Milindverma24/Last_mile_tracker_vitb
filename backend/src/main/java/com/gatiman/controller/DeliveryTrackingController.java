package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.tracking.LiveTrackingResponse;
import com.gatiman.dto.tracking.LocationUpdatePayload;
import com.gatiman.entity.User;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.LiveTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Live Tracking", description = "Real-time delivery partner GPS tracking, dynamic ETA, road route waypoints, and WebSocket telemetry")
public class DeliveryTrackingController {

    private final LiveTrackingService liveTrackingService;
    private final UserRepository userRepository;

    @GetMapping("/deliveries/{orderId}/tracking")
    @Operation(summary = "Retrieve live delivery tracking payload with distance, ETA, and route waypoints")
    public ResponseEntity<ApiResponse<LiveTrackingResponse>> getDeliveryTracking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        User user = resolveUser(userDetails);
        LiveTrackingResponse response = liveTrackingService.getLiveTracking(orderId, user);
        return ResponseEntity.ok(ApiResponse.ok("Live tracking telemetry retrieved", response));
    }

    @GetMapping("/orders/{orderId}/live-tracking")
    @Operation(summary = "Alias endpoint for order live tracking")
    public ResponseEntity<ApiResponse<LiveTrackingResponse>> getOrderLiveTracking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        User user = resolveUser(userDetails);
        LiveTrackingResponse response = liveTrackingService.getLiveTracking(orderId, user);
        return ResponseEntity.ok(ApiResponse.ok("Live tracking telemetry retrieved", response));
    }

    @PostMapping("/deliveries/{orderId}/location")
    @Operation(summary = "Broadcast active driver GPS coordinates and trigger WebSocket update")
    public ResponseEntity<ApiResponse<LiveTrackingResponse>> updateLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @Valid @RequestBody LocationUpdatePayload payload) {
        User user = resolveUser(userDetails);
        if (user == null) {
            throw new UnauthorizedException("Authentication required to broadcast location");
        }
        LiveTrackingResponse response = liveTrackingService.updateDriverLocation(orderId, payload, user);
        return ResponseEntity.ok(ApiResponse.ok("Driver location updated & broadcasted", response));
    }

    @MessageMapping("/delivery.location")
    public void handleWebSocketLocation(@Payload LocationUpdatePayload payload) {
        if (payload != null && payload.getOrderId() != null) {
            // High-frequency WebSocket streaming endpoint
            logLocationUpdate(payload);
        }
    }

    private void logLocationUpdate(LocationUpdatePayload payload) {
        // Handled via LiveTrackingService in controller or direct message mappings
    }

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
