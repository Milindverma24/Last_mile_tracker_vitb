package com.gatiman.dto.order;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.PaymentStatus;
import com.gatiman.enums.PaymentType;
import com.gatiman.enums.RouteType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String trackingNumber;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private CustomerType customerType;
    private PaymentType paymentType;
    private PaymentStatus paymentStatus;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private OrderStatus status;

    private String pickupName;
    private String pickupPhone;
    private String pickupAddress;
    private String pickupPincode;
    private Long pickupAreaId;
    private String pickupAreaName;
    private Long pickupZoneId;
    private String pickupZoneName;

    private String dropName;
    private String dropPhone;
    private String dropAddress;
    private String dropPincode;
    private Long dropAreaId;
    private String dropAreaName;
    private Long dropZoneId;
    private String dropZoneName;

    private RouteType routeType;

    private BigDecimal actualWeightKg;
    private BigDecimal volumetricWeightKg;
    private BigDecimal billableWeightKg;

    private BigDecimal baseCharge;
    private BigDecimal codSurcharge;
    private BigDecimal totalCharge;

    private Long assignedAgentId;
    private String assignedAgentName;
    private String assignedAgentPhone;
    private String assignedAgentVehicle;

    private Long rateCardId;
    private String rateCardName;

    private LocalDate scheduledDeliveryDate;
    private Integer rescheduleCount;

    private List<PackageDto> packages;
    private List<TrackingEventResponse> trackingHistory;
    private List<DeliveryAttemptResponse> deliveryAttempts;

    private Instant createdAt;
    private Instant updatedAt;
}
