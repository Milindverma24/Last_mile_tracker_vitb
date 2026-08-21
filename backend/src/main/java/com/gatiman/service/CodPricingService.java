package com.gatiman.service;

import com.gatiman.entity.RateCard;
import com.gatiman.enums.PaymentType;

import java.math.BigDecimal;

public interface CodPricingService {
    BigDecimal calculateCodSurcharge(RateCard rateCard, BigDecimal baseCharge, PaymentType paymentType);
}
