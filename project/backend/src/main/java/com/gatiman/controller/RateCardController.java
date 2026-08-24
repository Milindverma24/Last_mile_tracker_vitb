package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.ratecard.RateCardRequest;
import com.gatiman.dto.ratecard.RateCardResponse;
import com.gatiman.service.RateCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rate-cards")
@RequiredArgsConstructor
@Tag(name = "Rate Cards", description = "Dynamic pricing matrix, weight slabs, and COD surcharge configurations")
public class RateCardController {

    private final RateCardService rateCardService;

    @GetMapping
    @Operation(summary = "List all pricing rate cards")
    public ResponseEntity<ApiResponse<List<RateCardResponse>>> getAllRateCards() {
        List<RateCardResponse> response = rateCardService.getAllRateCards();
        return ResponseEntity.ok(ApiResponse.ok("Rate cards retrieved", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rate card details by ID")
    public ResponseEntity<ApiResponse<RateCardResponse>> getRateCardById(@PathVariable Long id) {
        RateCardResponse response = rateCardService.getRateCardById(id);
        return ResponseEntity.ok(ApiResponse.ok("Rate card retrieved", response));
    }

    @PostMapping
    @Operation(summary = "Create a new rate card with weight slabs")
    public ResponseEntity<ApiResponse<RateCardResponse>> createRateCard(@Valid @RequestBody RateCardRequest request) {
        RateCardResponse response = rateCardService.createRateCard(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rate card created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing rate card configuration")
    public ResponseEntity<ApiResponse<RateCardResponse>> updateRateCard(
            @PathVariable Long id,
            @Valid @RequestBody RateCardRequest request) {
        RateCardResponse response = rateCardService.updateRateCard(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Rate card updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a rate card")
    public ResponseEntity<ApiResponse<Void>> deleteRateCard(@PathVariable Long id) {
        rateCardService.deleteRateCard(id);
        return ResponseEntity.ok(ApiResponse.ok("Rate card deactivated successfully", null));
    }
}
