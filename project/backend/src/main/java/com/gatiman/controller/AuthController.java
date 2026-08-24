package com.gatiman.controller;

import com.gatiman.dto.auth.AuthResponse;
import com.gatiman.dto.auth.LoginRequest;
import com.gatiman.dto.auth.RegisterRequest;
import com.gatiman.dto.auth.UserResponse;
import com.gatiman.dto.common.ApiResponse;
import com.gatiman.security.CustomUserDetails;
import com.gatiman.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, and profile verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account (Customer, Agent, Admin)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", response));
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate or register user via Google OAuth2 credential")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody com.gatiman.dto.auth.GoogleAuthRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.ok("Google login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve authenticated user details")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUser() == null) {
            throw new com.gatiman.exception.UnauthorizedException("User is not authenticated");
        }
        UserResponse response = authService.getCurrentUser(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Profile details retrieved", response));
    }
}
