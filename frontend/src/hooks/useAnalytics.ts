import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

export const useAnalytics = (range: string = '7d') => {
  const dashboardQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboardStats,
    refetchInterval: 10000,
  });

  const orderAnalyticsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'orders', range],
    queryFn: () => adminApi.getOrderAnalytics(range),
    refetchInterval: 15000,
  });

  const zoneAnalyticsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'zones'],
    queryFn: adminApi.getZoneAnalytics,
  });

  const agentPerformanceQuery = useQuery({
    queryKey: ['admin', 'analytics', 'agents'],
    queryFn: adminApi.getAgentPerformance,
  });

  const failureAnalyticsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'failures'],
    queryFn: adminApi.getFailureAnalytics,
  });

  const revenueAnalyticsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'revenue'],
    queryFn: adminApi.getRevenueAnalytics,
  });

  return {
    dashboard: dashboardQuery.data,
    isDashboardLoading: dashboardQuery.isLoading,
    orderAnalytics: orderAnalyticsQuery.data,
    isOrderAnalyticsLoading: orderAnalyticsQuery.isLoading,
    zoneAnalytics: zoneAnalyticsQuery.data || [],
    isZoneAnalyticsLoading: zoneAnalyticsQuery.isLoading,
    agentPerformance: agentPerformanceQuery.data || [],
    isAgentPerformanceLoading: agentPerformanceQuery.isLoading,
    failureAnalytics: failureAnalyticsQuery.data,
    isFailureAnalyticsLoading: failureAnalyticsQuery.isLoading,
    revenueAnalytics: revenueAnalyticsQuery.data,
    isRevenueAnalyticsLoading: revenueAnalyticsQuery.isLoading,
    refetchAll: () => {
      dashboardQuery.refetch();
      orderAnalyticsQuery.refetch();
      zoneAnalyticsQuery.refetch();
      agentPerformanceQuery.refetch();
      failureAnalyticsQuery.refetch();
      revenueAnalyticsQuery.refetch();
    },
  };
};
