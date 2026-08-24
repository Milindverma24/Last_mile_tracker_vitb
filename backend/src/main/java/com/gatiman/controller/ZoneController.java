package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.zone.AreaRequest;
import com.gatiman.dto.zone.AreaResponse;
import com.gatiman.dto.zone.ZoneRequest;
import com.gatiman.dto.zone.ZoneResponse;
import com.gatiman.service.ZoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
@Tag(name = "Zones", description = "Zone definition, PIN code mapping, and geographic areas management")
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    @Operation(summary = "List all delivery zones")
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> getAllZones() {
        List<ZoneResponse> response = zoneService.getAllZones();
        return ResponseEntity.ok(ApiResponse.ok("Zones retrieved", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get zone details by ID")
    public ResponseEntity<ApiResponse<ZoneResponse>> getZoneById(@PathVariable Long id) {
        ZoneResponse response = zoneService.getZoneById(id);
        return ResponseEntity.ok(ApiResponse.ok("Zone retrieved", response));
    }

    @PostMapping
    @Operation(summary = "Create a new logistics delivery zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> createZone(@Valid @RequestBody ZoneRequest request) {
        ZoneResponse response = zoneService.createZone(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Zone created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing zone configuration")
    public ResponseEntity<ApiResponse<ZoneResponse>> updateZone(
            @PathVariable Long id,
            @Valid @RequestBody ZoneRequest request) {
        ZoneResponse response = zoneService.updateZone(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Zone updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a delivery zone")
    public ResponseEntity<ApiResponse<Void>> deleteZone(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseEntity.ok(ApiResponse.ok("Zone deactivated successfully", null));
    }

    @PostMapping("/{id}/areas")
    @Operation(summary = "Add an Area / PIN code mapping to a zone")
    public ResponseEntity<ApiResponse<AreaResponse>> addAreaToZone(
            @PathVariable Long id,
            @Valid @RequestBody AreaRequest request) {
        AreaResponse response = zoneService.addAreaToZone(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Area mapped to zone successfully", response));
    }

    @GetMapping("/{id}/areas")
    @Operation(summary = "Get all mapped areas for a zone")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> getAreasByZoneId(@PathVariable Long id) {
        List<AreaResponse> response = zoneService.getAreasByZoneId(id);
        return ResponseEntity.ok(ApiResponse.ok("Areas retrieved", response));
    }
}
