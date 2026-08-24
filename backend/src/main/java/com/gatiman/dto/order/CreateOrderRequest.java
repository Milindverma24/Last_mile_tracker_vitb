package com.gatiman.dto.order;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    private Long customerId; // Optional if created by authenticated customer

    @NotNull(message = "Customer type is required")
    private CustomerType customerType;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @NotBlank(message = "Pickup name is required")
    private String pickupName;

    @NotBlank(message = "Pickup phone is required")
    private String pickupPhone;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "Pickup PIN code is required")
    private String pickupPincode;

    @NotBlank(message = "Drop name is required")
    private String dropName;

    @NotBlank(message = "Drop phone is required")
    private String dropPhone;

    @NotBlank(message = "Drop address is required")
    private String dropAddress;

    @NotBlank(message = "Drop PIN code is required")
    private String dropPincode;

    @NotNull(message = "Length in cm is required")
    @DecimalMin(value = "0.1", message = "Length must be greater than 0")
    private BigDecimal lengthCm;

    @NotNull(message = "Breadth in cm is required")
    @DecimalMin(value = "0.1", message = "Breadth must be greater than 0")
    private BigDecimal breadthCm;

    @NotNull(message = "Height in cm is required")
    @DecimalMin(value = "0.1", message = "Height must be greater than 0")
    private BigDecimal heightCm;

    @NotNull(message = "Actual weight in kg is required")
    @DecimalMin(value = "0.01", message = "Actual weight must be greater than 0")
    private BigDecimal actualWeightKg;

    private String packageDescription;

    private BigDecimal declaredValue;
}
