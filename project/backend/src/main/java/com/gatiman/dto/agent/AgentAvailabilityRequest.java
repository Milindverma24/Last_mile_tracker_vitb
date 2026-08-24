package com.gatiman.dto.agent;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentAvailabilityRequest {
    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;
}
