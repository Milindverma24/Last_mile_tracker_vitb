import { apiClient } from './axios';
import { ApiResponse, DeliveryAgent } from '../types';

export const agentApi = {
  getAllAgents: async (): Promise<DeliveryAgent[]> => {
    const res = await apiClient.get<ApiResponse<DeliveryAgent[]>>('/agents');
    return res.data.data;
  },

  getAgentById: async (id: number | string): Promise<DeliveryAgent> => {
    const res = await apiClient.get<ApiResponse<DeliveryAgent>>(`/agents/${id}`);
    return res.data.data;
  },

  getMyProfile: async (): Promise<DeliveryAgent> => {
    const res = await apiClient.get<ApiResponse<DeliveryAgent>>('/agents/me');
    return res.data.data;
  },

  toggleAvailability: async (id: number | string, isAvailable: boolean): Promise<DeliveryAgent> => {
    const res = await apiClient.patch<ApiResponse<DeliveryAgent>>(`/agents/${id}/availability`, { isAvailable });
    return res.data.data;
  },

  toggleMyAvailability: async (isAvailable: boolean): Promise<DeliveryAgent> => {
    const res = await apiClient.patch<ApiResponse<DeliveryAgent>>('/agents/me/availability', { isAvailable });
    return res.data.data;
  },

  updateLocation: async (id: number | string, latitude: number, longitude: number): Promise<DeliveryAgent> => {
    const res = await apiClient.patch<ApiResponse<DeliveryAgent>>(`/agents/${id}/location`, { latitude, longitude });
    return res.data.data;
  },

  updateMyLocation: async (latitude: number, longitude: number): Promise<DeliveryAgent> => {
    const res = await apiClient.patch<ApiResponse<DeliveryAgent>>('/agents/me/location', { latitude, longitude });
    return res.data.data;
  },
};
