package com.gatiman.dto.payment;

import com.gatiman.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayVerifyResponse {
    private boolean verified;
    private Long orderId;
    private String trackingNumber;
    private PaymentStatus paymentStatus;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private BigDecimal amount;
    private Instant paidAt;
    private String message;
}
