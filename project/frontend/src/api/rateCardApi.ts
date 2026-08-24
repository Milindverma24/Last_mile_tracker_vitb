import { apiClient } from './axios';
import { ApiResponse, RateCard } from '../types';

export const rateCardApi = {
  getAllRateCards: async (): Promise<RateCard[]> => {
    const res = await apiClient.get<ApiResponse<RateCard[]>>('/rate-cards');
    return res.data.data;
  },

  getRateCardById: async (id: number | string): Promise<RateCard> => {
    const res = await apiClient.get<ApiResponse<RateCard>>(`/rate-cards/${id}`);
    return res.data.data;
  },

  createRateCard: async (payload: Partial<RateCard>): Promise<RateCard> => {
    const res = await apiClient.post<ApiResponse<RateCard>>('/rate-cards', payload);
    return res.data.data;
  },

  updateRateCard: async (id: number | string, payload: Partial<RateCard>): Promise<RateCard> => {
    const res = await apiClient.put<ApiResponse<RateCard>>(`/rate-cards/${id}`, payload);
    return res.data.data;
  },

  deleteRateCard: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/rate-cards/${id}`);
  },
};
