package com.gatiman.dto.zone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String city;
    private String state;
    private Boolean active;
    private List<AreaResponse> areas;
}
