package com.gatiman.dto.zone;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AreaRequest {

    @NotBlank(message = "Area name is required")
    private String name;

    @NotBlank(message = "PIN code is required")
    private String pincode;

    private Long zoneId;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Boolean active = true;
}
