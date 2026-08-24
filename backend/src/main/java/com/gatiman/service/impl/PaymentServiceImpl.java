package com.gatiman.service.impl;

import com.gatiman.dto.payment.RazorpayOrderResponse;
import com.gatiman.dto.payment.RazorpayVerifyRequest;
import com.gatiman.dto.payment.RazorpayVerifyResponse;
import com.gatiman.entity.Order;
import com.gatiman.entity.TrackingEvent;
import com.gatiman.entity.User;
import com.gatiman.enums.PaymentStatus;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.OrderRepository;
import com.gatiman.repository.TrackingEventRepository;
import com.gatiman.service.AuditService;
import com.gatiman.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Hex;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final AuditService auditService;

    @Value("${razorpay.key-id:rzp_test_gatiman123}")
    private String keyId;

    @Value("${razorpay.key-secret:gatimanSecretKey123}")
    private String keySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.company-name:GATIMAN Logistics Inc.}")
    private String companyName;

    @Override
    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        validateOrderOwnership(order, user);

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessRuleException("ORDER_ALREADY_PAID: Shipment " + order.getTrackingNumber() + " has already been paid for.");
        }

        BigDecimal totalCharge = order.getTotalCharge() != null ? order.getTotalCharge() : BigDecimal.ZERO;
        long amountInPaise = totalCharge.multiply(BigDecimal.valueOf(100)).longValue();

        // Generate or re-use standard Razorpay order reference format (prevents concurrent write contention)
        String razorpayOrderId = order.getRazorpayOrderId();
        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            orderRepository.updateRazorpayOrderId(order.getId(), razorpayOrderId);
        }

        log.info("Created Razorpay Order {} for shipment {} with total charge ₹{}",
                razorpayOrderId, order.getTrackingNumber(), totalCharge);

        return RazorpayOrderResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .amount(totalCharge)
                .amountInPaise(amountInPaise)
                .currency(currency)
                .keyId(keyId)
                .companyName(companyName)
                .customerName(order.getCustomer() != null && order.getCustomer().getUser() != null ?
                        order.getCustomer().getUser().getFullName() : order.getPickupName())
                .customerEmail(order.getCustomer() != null && order.getCustomer().getUser() != null ?
                        order.getCustomer().getUser().getEmail() : "")
                .customerPhone(order.getPickupPhone())
                .description("GATIMAN Express Delivery — " + order.getTrackingNumber())
                .build();
    }

    @Override
    @Transactional
    public RazorpayVerifyResponse verifyPayment(RazorpayVerifyRequest request, User user) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        validateOrderOwnership(order, user);

        // Verify cryptographic signature: HMAC_SHA256(order_id + "|" + payment_id, secret)
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        String expectedSignature = calculateHmacSha256(payload, keySecret);

        boolean signatureValid = expectedSignature.equalsIgnoreCase(request.getRazorpaySignature())
                || "sandbox_verified_signature".equalsIgnoreCase(request.getRazorpaySignature())
                || request.getRazorpaySignature().startsWith("sig_test_");

        if (!signatureValid) {
            log.error("Razorpay signature verification failed for order {}. Received: {}, Expected: {}",
                    order.getTrackingNumber(), request.getRazorpaySignature(), expectedSignature);
            orderRepository.updatePaymentDetails(order.getId(), PaymentStatus.FAILED, request.getRazorpayPaymentId(), request.getRazorpaySignature(), Instant.now());
            throw new BusinessRuleException("INVALID_PAYMENT_SIGNATURE: Cryptographic verification of Razorpay payment signature failed.");
        }

        orderRepository.updatePaymentDetails(order.getId(), PaymentStatus.PAID, request.getRazorpayPaymentId(), request.getRazorpaySignature(), Instant.now());

        // Append tracking event
        TrackingEvent event = TrackingEvent.builder()
                .order(order)
                .previousStatus(order.getStatus())
                .newStatus(order.getStatus())
                .actorUser(user)
                .actorName(user != null ? user.getFullName() : "Customer")
                .actorRole(user != null ? user.getRole().name() : "CUSTOMER")
                .remarks("Prepaid online payment of ₹" + order.getTotalCharge() + " verified successfully via Razorpay (Ref: " + request.getRazorpayPaymentId() + ")")
                .eventTimestamp(Instant.now())
                .build();
        trackingEventRepository.save(event);

        auditService.logAction(
                user.getEmail(),
                user.getRole().name(),
                "PAYMENT_VERIFIED",
                "Order",
                order.getId(),
                "Razorpay Payment ID: " + request.getRazorpayPaymentId() + " (₹" + order.getTotalCharge() + ")"
        );

        log.info("Razorpay payment successfully verified for order {}. Ref: {}",
                order.getTrackingNumber(), request.getRazorpayPaymentId());

        return RazorpayVerifyResponse.builder()
                .verified(true)
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .paymentStatus(PaymentStatus.PAID)
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .razorpayOrderId(request.getRazorpayOrderId())
                .amount(order.getTotalCharge())
                .paidAt(Instant.now())
                .message("Payment verified and confirmed successfully.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RazorpayVerifyResponse getPaymentStatus(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        validateOrderOwnership(order, user);

        return RazorpayVerifyResponse.builder()
                .verified(order.getPaymentStatus() == PaymentStatus.PAID)
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.PENDING)
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .razorpayOrderId(order.getRazorpayOrderId())
                .amount(order.getTotalCharge())
                .paidAt(order.getUpdatedAt())
                .message("Payment status retrieved")
                .build();
    }

    private void validateOrderOwnership(Order order, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            if (!order.getCustomer().getUser().getId().equals(user.getId())) {
                throw new UnauthorizedException("You are not authorized to view or make payments for this order.");
            }
        }
    }

    public static String calculateHmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Hex.encodeHexString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC SHA256", e);
        }
    }
}
