package com.gatiman.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageDto {
    private Long id;
    private String packageDescription;
    private BigDecimal lengthCm;
    private BigDecimal breadthCm;
    private BigDecimal heightCm;
    private BigDecimal declaredValue;
}
