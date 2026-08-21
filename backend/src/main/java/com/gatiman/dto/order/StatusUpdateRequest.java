package com.gatiman.dto.order;

import com.gatiman.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotNull(message = "Target status is required")
    private OrderStatus status;

    private String remarks;
    private Double latitude;
    private Double longitude;
}
