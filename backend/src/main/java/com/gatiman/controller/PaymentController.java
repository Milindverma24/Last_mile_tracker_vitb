package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.payment.RazorpayOrderRequest;
import com.gatiman.dto.payment.RazorpayOrderResponse;
import com.gatiman.dto.payment.RazorpayVerifyRequest;
import com.gatiman.dto.payment.RazorpayVerifyResponse;
import com.gatiman.entity.User;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay payment processing, order generation and cryptographic verification")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @PostMapping("/razorpay/create-order")
    @Operation(summary = "Create a Razorpay order reference for a delivery shipment")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createRazorpayOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RazorpayOrderRequest request) {
        User user = getAuthenticatedUser(userDetails);
        RazorpayOrderResponse response = paymentService.createRazorpayOrder(request.getOrderId(), user);
        return ResponseEntity.ok(ApiResponse.ok("Razorpay order initiated successfully", response));
    }

    @PostMapping("/razorpay/verify")
    @Operation(summary = "Verify Razorpay payment signature and mark order as PAID")
    public ResponseEntity<ApiResponse<RazorpayVerifyResponse>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RazorpayVerifyRequest request) {
        User user = getAuthenticatedUser(userDetails);
        RazorpayVerifyResponse response = paymentService.verifyPayment(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Payment verified successfully", response));
    }

    @GetMapping("/orders/{orderId}/status")
    @Operation(summary = "Get the live payment status of an order")
    public ResponseEntity<ApiResponse<RazorpayVerifyResponse>> getPaymentStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        User user = getAuthenticatedUser(userDetails);
        RazorpayVerifyResponse response = paymentService.getPaymentStatus(orderId, user);
        return ResponseEntity.ok(ApiResponse.ok("Payment status retrieved", response));
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required for payment operations");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User account not found"));
    }
}
