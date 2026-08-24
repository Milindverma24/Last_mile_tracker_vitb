package com.gatiman.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {
    @Builder.Default
    private String status = "UP";
    @Builder.Default
    private String service = "GATIMAN Backend";
    @Builder.Default
    private String version = "1.0.0";
    @Builder.Default
    private Instant timestamp = Instant.now();
}
