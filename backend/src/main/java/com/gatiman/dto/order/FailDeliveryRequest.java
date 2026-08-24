package com.gatiman.dto.order;

import com.gatiman.enums.FailureReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FailDeliveryRequest {

    @NotNull(message = "Failure reason is required")
    private FailureReason failureReason;

    private String failureNotes;
    private Double latitude;
    private Double longitude;
}
