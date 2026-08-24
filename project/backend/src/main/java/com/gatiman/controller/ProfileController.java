package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.profile.*;
import com.gatiman.entity.User;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Unified user profile, personal data, security credentials and preferences")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get authenticated user's full unified profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        ProfileResponse profile = profileService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }

    @PatchMapping
    @Operation(summary = "Update authenticated user's personal profile information")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = getAuthenticatedUser(userDetails);
        ProfileResponse updated = profileService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PatchMapping("/password")
    @Operation(summary = "Change authenticated user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser(userDetails);
        profileService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @GetMapping("/notification-preferences")
    @Operation(summary = "Get user notification and localization preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesDto>> getNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        NotificationPreferencesDto preferences = profileService.getNotificationPreferences(user);
        return ResponseEntity.ok(ApiResponse.ok("Notification preferences retrieved", preferences));
    }

    @PatchMapping("/notification-preferences")
    @Operation(summary = "Update user notification and localization preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesDto>> updateNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NotificationPreferencesRequest request) {
        User user = getAuthenticatedUser(userDetails);
        NotificationPreferencesDto updated = profileService.updateNotificationPreferences(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Notification preferences updated successfully", updated));
    }

    @PatchMapping("/availability")
    @Operation(summary = "Update delivery agent on-duty availability status")
    public ResponseEntity<ApiResponse<Void>> updateAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateAvailabilityRequest request) {
        User user = getAuthenticatedUser(userDetails);
        boolean available = request.getAvailable() != null ? request.getAvailable() : true;
        profileService.updateAgentAvailability(user, available);
        return ResponseEntity.ok(ApiResponse.ok("Driver availability updated successfully", null));
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("User session is not authenticated");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User record not found"));
    }
}
