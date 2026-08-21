import { apiClient } from './axios';
import { ApiResponse } from '../types';

export interface RazorpayOrderDetails {
  razorpayOrderId: string;
  orderId: number;
  trackingNumber: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  companyName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export interface RazorpayVerifyPayload {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerifyResult {
  verified: boolean;
  orderId: number;
  trackingNumber: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  paidAt: string;
  message: string;
}

export const paymentApi = {
  createRazorpayOrder: async (orderId: number): Promise<RazorpayOrderDetails> => {
    const res = await apiClient.post<ApiResponse<RazorpayOrderDetails>>('/payments/razorpay/create-order', {
      orderId,
    });
    return res.data.data;
  },

  verifyPayment: async (payload: RazorpayVerifyPayload): Promise<PaymentVerifyResult> => {
    const res = await apiClient.post<ApiResponse<PaymentVerifyResult>>('/payments/razorpay/verify', payload);
    return res.data.data;
  },

  getPaymentStatus: async (orderId: number): Promise<PaymentVerifyResult> => {
    const res = await apiClient.get<ApiResponse<PaymentVerifyResult>>(`/payments/orders/${orderId}/status`);
    return res.data.data;
  },
};
