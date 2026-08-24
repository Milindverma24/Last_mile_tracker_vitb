package com.gatiman.dto.order;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.PaymentStatus;
import com.gatiman.enums.PaymentType;
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
public class OrderSummaryResponse {
    private Long id;
    private String trackingNumber;
    private String orderNumber;
    private String customerName;
    private CustomerType customerType;
    private PaymentType paymentType;
    private PaymentStatus paymentStatus;
    private OrderStatus status;
    private String pickupPincode;
    private String dropPincode;
    private String pickupAreaName;
    private String dropAreaName;
    private BigDecimal totalCharge;
    private String assignedAgentName;
    private Instant createdAt;
}
