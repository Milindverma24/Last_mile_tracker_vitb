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
public class ChargeCalculationRequest {

    @NotNull(message = "Customer type is required")
    private CustomerType customerType;

    @NotBlank(message = "Pickup PIN code is required")
    private String pickupPincode;

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

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;
}
