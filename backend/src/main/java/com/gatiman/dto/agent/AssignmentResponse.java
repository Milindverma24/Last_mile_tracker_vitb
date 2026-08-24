package com.gatiman.dto.agent;

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
public class AssignmentResponse {
    private Long id;
    private Long assignmentId;
    private Long orderId;
    private String trackingNumber;
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private String vehicleType;
    private String vehicleNumber;
    private String assignmentType;
    private String status;
    private BigDecimal distanceKm;
    private Instant assignedAt;
}
