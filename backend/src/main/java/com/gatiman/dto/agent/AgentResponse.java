package com.gatiman.dto.agent;

import com.gatiman.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private VehicleType vehicleType;
    private String vehicleNumber;
    private Boolean isAvailable;
    private Boolean active;
    private Integer maxActiveOrders;
    private Integer currentActiveOrders;
    private Long assignedZoneId;
    private String assignedZoneName;
    private Double currentLatitude;
    private Double currentLongitude;
    private Instant lastLocationUpdate;
    private String status;
}
