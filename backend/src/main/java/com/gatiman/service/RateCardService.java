package com.gatiman.service;

import com.gatiman.dto.order.ChargeCalculationRequest;
import com.gatiman.dto.order.ChargeCalculationResponse;
import com.gatiman.dto.ratecard.RateCardRequest;
import com.gatiman.dto.ratecard.RateCardResponse;
import java.math.BigDecimal;
import java.util.List;

public interface RateCardService {
    List<RateCardResponse> getAllRateCards();
    RateCardResponse getRateCardById(Long id);
    RateCardResponse createRateCard(RateCardRequest request);
    RateCardResponse updateRateCard(Long id, RateCardRequest request);
    void deleteRateCard(Long id);

    BigDecimal calculateVolumetricWeight(BigDecimal lengthCm, BigDecimal breadthCm, BigDecimal heightCm);
    BigDecimal calculateBillableWeight(BigDecimal actualWeightKg, BigDecimal volumetricWeightKg);
    ChargeCalculationResponse calculateCharges(ChargeCalculationRequest request);
}
