package com.gatiman.controller;

import com.gatiman.dto.agent.AssignAgentRequest;
import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.order.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.security.CustomUserDetails;
import com.gatiman.service.OrderService;
import com.gatiman.service.RateCardService;
import com.gatiman.service.RescheduleService;
import com.gatiman.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order booking, charge preview, status workflow, and assignment APIs")
public class OrderController {

    private final OrderService orderService;
    private final RateCardService rateCardService;
    private final TrackingService trackingService;
    private final RescheduleService rescheduleService;

    @PostMapping("/calculate-charge")
    @Operation(summary = "Calculate volumetric and billable price preview")
    public ResponseEntity<ApiResponse<ChargeCalculationResponse>> calculateCharge(
            @Valid @RequestBody ChargeCalculationRequest request) {
        ChargeCalculationResponse response = rateCardService.calculateCharges(request);
        return ResponseEntity.ok(ApiResponse.ok("Charges calculated successfully", response));
    }

    @PostMapping
    @Operation(summary = "Create and confirm a new delivery order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderResponse response = orderService.createOrder(request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", response));
    }

    @GetMapping
    @Operation(summary = "Retrieve orders list filtered by role")
    public ResponseEntity<ApiResponse<?>> getOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long zoneId) {

        if (userDetails.getUser().getRole().name().equals("CUSTOMER")) {
            List<OrderResponse> customerOrders = orderService.getOrdersForCustomer(userDetails.getUser());
            return ResponseEntity.ok(ApiResponse.ok("Customer orders retrieved", customerOrders));
        } else if (userDetails.getUser().getRole().name().equals("DELIVERY_AGENT")) {
            List<OrderResponse> agentOrders = orderService.getOrdersForAgent(userDetails.getUser());
            return ResponseEntity.ok(ApiResponse.ok("Agent deliveries retrieved", agentOrders));
        } else {
            Pageable pageable = PageRequest.of(page, size);
            Page<OrderResponse> allOrders = orderService.getAllOrders(pageable, status, zoneId);
            return ResponseEntity.ok(ApiResponse.ok("All system orders retrieved", allOrders));
        }
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Retrieve complete order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderResponse response = orderService.getOrderById(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Order retrieved", response));
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Public tracking lookup by tracking number")
    public ResponseEntity<ApiResponse<OrderResponse>> trackByTrackingNumber(
            @PathVariable String trackingNumber) {
        OrderResponse response = orderService.getOrderByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(ApiResponse.ok("Tracking details found", response));
    }

    @GetMapping("/{id}/tracking")
    @Operation(summary = "Retrieve immutable tracking events for an order")
    public ResponseEntity<ApiResponse<List<TrackingEventResponse>>> getTrackingEvents(
            @PathVariable Long id) {
        List<TrackingEventResponse> events = trackingService.getTrackingHistoryForOrder(id);
        return ResponseEntity.ok(ApiResponse.ok("Tracking timeline retrieved", events));
    }

    @PostMapping("/{id}/auto-assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Trigger intelligent auto-assignment to nearest active driver")
    public ResponseEntity<ApiResponse<OrderResponse>> autoAssignOrder(
            @PathVariable Long id) {
        OrderResponse response = orderService.autoAssignOrder(id);
        return ResponseEntity.ok(ApiResponse.ok("Driver auto-assigned successfully", response));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually assign order to a specific delivery agent")
    public ResponseEntity<ApiResponse<OrderResponse>> manualAssignOrder(
            @PathVariable Long id,
            @Valid @RequestBody AssignAgentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderResponse response = orderService.manualAssignOrder(id, request.getAgentId(), userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Order manually assigned", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Advance order lifecycle status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderResponse response = orderService.updateOrderStatus(
                id, request.getStatus(), userDetails.getUser(),
                request.getRemarks(), request.getLatitude(), request.getLongitude()
        );
        return ResponseEntity.ok(ApiResponse.ok("Status updated successfully", response));
    }

    @PostMapping("/{id}/fail")
    @Operation(summary = "Record failed delivery attempt with specific reason")
    public ResponseEntity<ApiResponse<OrderResponse>> markDeliveryFailed(
            @PathVariable Long id,
            @Valid @RequestBody FailDeliveryRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderResponse response = orderService.markDeliveryFailed(
                id, userDetails.getUser(), request.getFailureReason(),
                request.getFailureNotes(), request.getLatitude(), request.getLongitude()
        );
        return ResponseEntity.ok(ApiResponse.ok("Delivery marked as failed", response));
    }

    @PostMapping("/{orderId}/delivery-attempts/{attemptId}/fail")
    @Operation(summary = "Record failed delivery attempt for specific attempt ID")
    public ResponseEntity<ApiResponse<OrderResponse>> markDeliveryAttemptFailed(
            @PathVariable Long orderId,
            @PathVariable Long attemptId,
            @Valid @RequestBody FailDeliveryRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderResponse response = orderService.markDeliveryFailed(
                orderId, userDetails.getUser(), request.getFailureReason(),
                request.getFailureNotes(), request.getLatitude(), request.getLongitude()
        );
        return ResponseEntity.ok(ApiResponse.ok("Delivery attempt marked as failed", response));
    }

    @PostMapping("/{id}/reschedule")
    @Operation(summary = "Customer rescheduling for failed delivery with auto-reassignment")
    public ResponseEntity<ApiResponse<RescheduleResponse>> rescheduleOrder(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        RescheduleResponse response = rescheduleService.requestReschedule(id, request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Reschedule requested successfully", response));
    }
}
