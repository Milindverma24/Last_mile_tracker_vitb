package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.common.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "System health check and diagnostic endpoints")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend service health status")
    public ResponseEntity<ApiResponse<HealthResponse>> healthCheck() {
        HealthResponse response = HealthResponse.builder()
                .status("UP")
                .service("GATIMAN Backend")
                .version("1.0.0")
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Service is healthy", response));
    }
}
