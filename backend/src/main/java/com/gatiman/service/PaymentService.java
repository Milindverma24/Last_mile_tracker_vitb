package com.gatiman.service;

import com.gatiman.dto.payment.RazorpayOrderResponse;
import com.gatiman.dto.payment.RazorpayVerifyRequest;
import com.gatiman.dto.payment.RazorpayVerifyResponse;
import com.gatiman.entity.User;

public interface PaymentService {
    RazorpayOrderResponse createRazorpayOrder(Long orderId, User user);
    RazorpayVerifyResponse verifyPayment(RazorpayVerifyRequest request, User user);
    RazorpayVerifyResponse getPaymentStatus(Long orderId, User user);
}
