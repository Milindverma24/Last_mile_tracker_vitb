package com.gatiman.service.impl;

import com.gatiman.exception.BusinessRuleException;
import com.gatiman.service.VolumetricWeightService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class VolumetricWeightServiceImpl implements VolumetricWeightService {

    private static final BigDecimal VOLUMETRIC_DIVISOR = new BigDecimal("5000");

    @Override
    public BigDecimal calculateVolumetricWeight(BigDecimal lengthCm, BigDecimal breadthCm, BigDecimal heightCm) {
        if (lengthCm == null || lengthCm.compareTo(BigDecimal.ZERO) <= 0 ||
            breadthCm == null || breadthCm.compareTo(BigDecimal.ZERO) <= 0 ||
            heightCm == null || heightCm.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("INVALID_DIMENSIONS: Length, breadth, and height must all be positive numbers greater than zero.");
        }

        BigDecimal volume = lengthCm.multiply(breadthCm).multiply(heightCm);
        return volume.divide(VOLUMETRIC_DIVISOR, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateBillableWeight(BigDecimal actualWeightKg, BigDecimal volumetricWeightKg) {
        if (actualWeightKg == null || actualWeightKg.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("INVALID_WEIGHT: Actual package weight must be greater than zero kg.");
        }
        if (volumetricWeightKg == null || volumetricWeightKg.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("INVALID_WEIGHT: Volumetric weight calculation produced an invalid non-positive result.");
        }

        BigDecimal billable = actualWeightKg.max(volumetricWeightKg);
        return billable.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String formatWeightFormula(BigDecimal lengthCm, BigDecimal breadthCm, BigDecimal heightCm, BigDecimal volumetricWeightKg) {
        return String.format("(%s × %s × %s) / 5000 = %s kg",
                lengthCm.stripTrailingZeros().toPlainString(),
                breadthCm.stripTrailingZeros().toPlainString(),
                heightCm.stripTrailingZeros().toPlainString(),
                volumetricWeightKg.setScale(2, RoundingMode.HALF_UP).toPlainString());
    }
}
