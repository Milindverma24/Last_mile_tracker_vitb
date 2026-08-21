package com.gatiman.service;

import java.math.BigDecimal;

public interface VolumetricWeightService {
    BigDecimal calculateVolumetricWeight(BigDecimal lengthCm, BigDecimal breadthCm, BigDecimal heightCm);
    BigDecimal calculateBillableWeight(BigDecimal actualWeightKg, BigDecimal volumetricWeightKg);
    String formatWeightFormula(BigDecimal lengthCm, BigDecimal breadthCm, BigDecimal heightCm, BigDecimal volumetricWeightKg);
}
