package com.gatiman.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private Long orderId;
    private String trackingNumber;
    private BigDecimal amount;
    private Long amountInPaise;
    private String currency;
    private String keyId;
    private String companyName;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String description;
}
