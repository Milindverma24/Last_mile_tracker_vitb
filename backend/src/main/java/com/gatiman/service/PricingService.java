package com.gatiman.service;

import com.gatiman.dto.order.ChargeCalculationRequest;
import com.gatiman.dto.order.ChargeCalculationResponse;

public interface PricingService {
    ChargeCalculationResponse calculateCharge(ChargeCalculationRequest request);
}
