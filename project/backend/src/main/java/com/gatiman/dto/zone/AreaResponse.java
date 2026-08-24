package com.gatiman.dto.zone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AreaResponse {
    private Long id;
    private String name;
    private String pincode;
    private Long zoneId;
    private String zoneName;
    private Double latitude;
    private Double longitude;
    private Boolean active;
}
