import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });
}
