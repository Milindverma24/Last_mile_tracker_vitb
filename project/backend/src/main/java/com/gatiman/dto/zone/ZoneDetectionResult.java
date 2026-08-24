package com.gatiman.dto.zone;

import com.gatiman.entity.Area;
import com.gatiman.entity.Zone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneDetectionResult {
    private Area area;
    private Zone zone;
    private String pincode;
    private String source; // PINCODE_DATABASE, AREA_DATABASE, GIS_FALLBACK
    private Double confidence;
}
