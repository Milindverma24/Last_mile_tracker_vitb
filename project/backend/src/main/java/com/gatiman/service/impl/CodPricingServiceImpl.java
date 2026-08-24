package com.gatiman.service.impl;

import com.gatiman.entity.RateCard;
import com.gatiman.enums.PaymentType;
import com.gatiman.service.CodPricingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class CodPricingServiceImpl implements CodPricingService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    @Override
    public BigDecimal calculateCodSurcharge(RateCard rateCard, BigDecimal baseCharge, PaymentType paymentType) {
        if (paymentType != PaymentType.COD || rateCard == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal flatFee = rateCard.getCodSurchargeFlat() != null ? rateCard.getCodSurchargeFlat() : BigDecimal.ZERO;
        BigDecimal percentage = rateCard.getCodSurchargePercentage() != null ? rateCard.getCodSurchargePercentage() : BigDecimal.ZERO;

        BigDecimal variableFee = BigDecimal.ZERO;
        if (percentage.compareTo(BigDecimal.ZERO) > 0 && baseCharge != null && baseCharge.compareTo(BigDecimal.ZERO) > 0) {
            variableFee = baseCharge.multiply(percentage).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalCodFee = flatFee.add(variableFee);
        return totalCodFee.setScale(2, RoundingMode.HALF_UP);
    }
}
