import { apiClient } from './axios';
import { ApiResponse, ChargePreviewResult, Order, TrackingEvent } from '../types';

export interface CreateOrderPayload {
  customerId?: number;
  customerType: string;
  paymentType: string;
  pickupName: string;
  pickupPhone: string;
  pickupAddress: string;
  pickupPincode: string;
  dropName: string;
  dropPhone: string;
  dropAddress: string;
  dropPincode: string;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  packageDescription?: string;
  declaredValue?: number;
}

export interface CalculateChargePayload {
  customerType: string;
  paymentType: string;
  pickupPincode: string;
  dropPincode: string;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
}

export interface StatusUpdatePayload {
  status: string;
  remarks?: string;
  latitude?: number;
  longitude?: number;
}

export interface FailDeliveryPayload {
  failureReason: string;
  failureNotes?: string;
  latitude?: number;
  longitude?: number;
}

export interface ReschedulePayload {
  requestedDate: string;
  preferredTimeSlot?: string;
  reason?: string;
  rescheduleNotes?: string;
}

export const orderApi = {
  calculateCharge: async (payload: CalculateChargePayload): Promise<ChargePreviewResult> => {
    const res = await apiClient.post<ApiResponse<ChargePreviewResult>>('/orders/calculate-charge', payload);
    return res.data.data;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return res.data.data;
  },

  getOrders: async (params?: { page?: number; size?: number; status?: string; zoneId?: number }): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/orders', { params });
    return res.data.data;
  },

  getOrderById: async (id: number | string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  trackByNumber: async (trackingNumber: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/track/${trackingNumber}`);
    return res.data.data;
  },

  getTrackingTimeline: async (orderId: number | string): Promise<TrackingEvent[]> => {
    const res = await apiClient.get<ApiResponse<TrackingEvent[]>>(`/orders/${orderId}/tracking`);
    return res.data.data;
  },

  autoAssign: async (orderId: number | string): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/auto-assign`);
    return res.data.data;
  },

  manualAssign: async (orderId: number | string, agentId: number): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/assign`, { agentId });
    return res.data.data;
  },

  updateStatus: async (orderId: number | string, payload: StatusUpdatePayload): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, payload);
    return res.data.data;
  },

  markFailed: async (orderId: number | string, payload: FailDeliveryPayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/fail`, payload);
    return res.data.data;
  },

  reschedule: async (orderId: number | string, payload: ReschedulePayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/reschedule`, payload);
    return res.data.data;
  },
};
