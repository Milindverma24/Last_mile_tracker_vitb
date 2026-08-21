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
public class ZoneRequest {

    @NotBlank(message = "Zone code is required")
    private String code;

    @NotBlank(message = "Zone name is required")
    private String name;

    private String description;
    private String city;
    private String state;

    @Builder.Default
    private Boolean active = true;
}
