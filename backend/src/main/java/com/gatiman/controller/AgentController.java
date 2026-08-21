package com.gatiman.controller;

import com.gatiman.dto.agent.AgentAvailabilityRequest;
import com.gatiman.dto.agent.AgentLocationUpdateRequest;
import com.gatiman.dto.agent.AgentResponse;
import com.gatiman.dto.common.ApiResponse;
import com.gatiman.security.CustomUserDetails;
import com.gatiman.service.DeliveryAgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@Tag(name = "Agents", description = "Delivery agent status, availability toggle, and GPS location tracking")
public class AgentController {

    private final DeliveryAgentService deliveryAgentService;

    @GetMapping
    @Operation(summary = "List all registered delivery agents")
    public ResponseEntity<ApiResponse<List<AgentResponse>>> getAllAgents() {
        List<AgentResponse> response = deliveryAgentService.getAllAgents();
        return ResponseEntity.ok(ApiResponse.ok("Agents retrieved", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery agent details by ID")
    public ResponseEntity<ApiResponse<AgentResponse>> getAgentById(@PathVariable Long id) {
        AgentResponse response = deliveryAgentService.getAgentById(id);
        return ResponseEntity.ok(ApiResponse.ok("Agent details retrieved", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated delivery agent profile")
    public ResponseEntity<ApiResponse<AgentResponse>> getMyAgentProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AgentResponse response = deliveryAgentService.getAgentByUserId(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.ok("Agent profile retrieved", response));
    }

    @PatchMapping("/{id}/availability")
    @Operation(summary = "Toggle delivery agent active/online availability")
    public ResponseEntity<ApiResponse<AgentResponse>> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AgentAvailabilityRequest request) {
        AgentResponse response = deliveryAgentService.updateAvailability(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Agent availability updated", response));
    }

    @PatchMapping("/me/availability")
    @Operation(summary = "Toggle current agent online availability")
    public ResponseEntity<ApiResponse<AgentResponse>> updateMyAvailability(
            @Valid @RequestBody AgentAvailabilityRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AgentResponse me = deliveryAgentService.getAgentByUserId(userDetails.getUser().getId());
        AgentResponse response = deliveryAgentService.updateAvailability(me.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Availability updated", response));
    }

    @PatchMapping("/{id}/location")
    @Operation(summary = "Update live GPS location telemetry of agent")
    public ResponseEntity<ApiResponse<AgentResponse>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody AgentLocationUpdateRequest request) {
        AgentResponse response = deliveryAgentService.updateLocation(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Agent location updated", response));
    }

    @PatchMapping("/me/location")
    @Operation(summary = "Update current authenticated agent location")
    public ResponseEntity<ApiResponse<AgentResponse>> updateMyLocation(
            @Valid @RequestBody AgentLocationUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AgentResponse me = deliveryAgentService.getAgentByUserId(userDetails.getUser().getId());
        AgentResponse response = deliveryAgentService.updateLocation(me.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Location updated", response));
    }
}
