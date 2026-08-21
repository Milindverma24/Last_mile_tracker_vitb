import { apiClient } from './axios';
import { ApiResponse, Area, Zone } from '../types';

export interface CreateZonePayload {
  code: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
}

export interface CreateAreaPayload {
  name: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export const zoneApi = {
  getAllZones: async (): Promise<Zone[]> => {
    const res = await apiClient.get<ApiResponse<Zone[]>>('/zones');
    return res.data.data;
  },

  getZoneById: async (id: number | string): Promise<Zone> => {
    const res = await apiClient.get<ApiResponse<Zone>>(`/zones/${id}`);
    return res.data.data;
  },

  createZone: async (payload: CreateZonePayload): Promise<Zone> => {
    const res = await apiClient.post<ApiResponse<Zone>>('/zones', payload);
    return res.data.data;
  },

  updateZone: async (id: number | string, payload: CreateZonePayload): Promise<Zone> => {
    const res = await apiClient.put<ApiResponse<Zone>>(`/zones/${id}`, payload);
    return res.data.data;
  },

  deleteZone: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/zones/${id}`);
  },

  addAreaToZone: async (zoneId: number | string, payload: CreateAreaPayload): Promise<Area> => {
    const res = await apiClient.post<ApiResponse<Area>>(`/zones/${zoneId}/areas`, payload);
    return res.data.data;
  },

  getAreasByZone: async (zoneId: number | string): Promise<Area[]> => {
    const res = await apiClient.get<ApiResponse<Area[]>>(`/zones/${zoneId}/areas`);
    return res.data.data;
  },
};
