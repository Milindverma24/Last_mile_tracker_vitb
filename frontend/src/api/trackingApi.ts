import { apiClient } from './axios';
import { ApiResponse, OrderStatus, VehicleType } from '../types';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface DeliveryPartnerInfo {
  id: number;
  name: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
}

export interface LocationDetail {
  name: string;
  address: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface LiveTrackingData {
  orderId: number;
  trackingNumber: string;
  status: OrderStatus;
  isLive: boolean;
  deliveryPartner?: DeliveryPartnerInfo;
  currentLocation: Coordinate;
  heading?: number;
  speed?: number;
  pickupLocation: LocationDetail;
  destination: LocationDetail;
  routeWaypoints: Coordinate[];
  distanceRemaining: number;
  distanceUnit: string;
  etaMinutes: number;
  expectedArrival: string;
  lastUpdated: string;
  nearDestination: boolean;
}

export interface LocationUpdatePayload {
  orderId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

export const trackingApi = {
  getLiveTracking: async (orderId: number): Promise<LiveTrackingData> => {
    const res = await apiClient.get<ApiResponse<LiveTrackingData>>(`/deliveries/${orderId}/tracking`);
    return res.data.data;
  },

  updateDriverLocation: async (orderId: number, payload: LocationUpdatePayload): Promise<LiveTrackingData> => {
    const res = await apiClient.post<ApiResponse<LiveTrackingData>>(`/deliveries/${orderId}/location`, payload);
    return res.data.data;
  },
};
