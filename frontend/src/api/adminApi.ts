import { apiClient } from './axios';
import {
  ApiResponse,
  DashboardStats,
  OrderAnalytics,
  ZoneAnalytics,
  AgentPerformance,
  FailureAnalytics,
  RevenueAnalytics,
  RescheduleRequest,
  AuditLogItem,
} from '../types';

export interface SystemHealthData {
  status: string;
  applicationName: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  databaseStatus: string;
  databaseEngine: string;
  activeDbConnections: number;
  maxDbPoolSize: number;
  dbQueryLatencyMs: number;
  totalJvmMemoryMb: number;
  freeJvmMemoryMb: number;
  usedJvmMemoryMb: number;
  memoryUsagePercent: number;
  activeThreads: number;
  totalAgents: number;
  onlineAgents: number;
  activeOrdersInFlight: number;
  subsystemMetrics: Record<string, any>;
}

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return res.data.data;
  },

  getOrderAnalytics: async (range: string = '7d'): Promise<OrderAnalytics> => {
    const res = await apiClient.get<ApiResponse<OrderAnalytics>>(`/admin/analytics/orders?range=${range}`);
    return res.data.data;
  },

  getZoneAnalytics: async (): Promise<ZoneAnalytics[]> => {
    const res = await apiClient.get<ApiResponse<ZoneAnalytics[]>>('/admin/analytics/zones');
    return res.data.data;
  },

  getAgentPerformance: async (): Promise<AgentPerformance[]> => {
    const res = await apiClient.get<ApiResponse<AgentPerformance[]>>('/admin/analytics/agents');
    return res.data.data;
  },

  getFailureAnalytics: async (): Promise<FailureAnalytics> => {
    const res = await apiClient.get<ApiResponse<FailureAnalytics>>('/admin/analytics/failures');
    return res.data.data;
  },

  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    const res = await apiClient.get<ApiResponse<RevenueAnalytics>>('/admin/analytics/revenue');
    return res.data.data;
  },

  getRescheduleRequests: async (status: string = 'ALL', page: number = 0, size: number = 20) => {
    const res = await apiClient.get<ApiResponse<{ content: RescheduleRequest[]; totalElements: number; totalPages: number }>>(
      `/admin/reschedule-requests?status=${status}&page=${page}&size=${size}`
    );
    return res.data.data;
  },

  approveReschedule: async (id: number, overrideAgentId?: number) => {
    const res = await apiClient.post<ApiResponse<RescheduleRequest>>(`/admin/reschedule-requests/${id}/approve`, {
      overrideAgentId,
    });
    return res.data.data;
  },

  rejectReschedule: async (id: number, rejectionReason: string) => {
    const res = await apiClient.post<ApiResponse<RescheduleRequest>>(`/admin/reschedule-requests/${id}/reject`, {
      rejectionReason,
    });
    return res.data.data;
  },

  reassignOrder: async (orderId: number, agentId: number) => {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/orders/${orderId}/reassign`, {
      agentId,
    });
    return res.data.data;
  },

  getAuditLogs: async (page: number = 0, size: number = 30) => {
    const res = await apiClient.get<ApiResponse<{ content: AuditLogItem[]; totalElements: number; totalPages: number }>>(
      `/admin/audit-logs?page=${page}&size=${size}`
    );
    return res.data.data;
  },

  getSystemHealth: async (): Promise<SystemHealthData> => {
    const res = await apiClient.get<ApiResponse<SystemHealthData>>('/admin/system/health');
    return res.data.data;
  },
};
