import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { orderApi, ReschedulePayload } from '../api/orderApi';

export const useReschedules = (statusFilter: string = 'ALL', page: number = 0, size: number = 20) => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['admin', 'reschedule-requests', statusFilter, page, size],
    queryFn: () => adminApi.getRescheduleRequests(statusFilter, page, size),
    refetchInterval: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, overrideAgentId }: { id: number; overrideAgentId?: number }) =>
      adminApi.approveReschedule(id, overrideAgentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reschedule-requests'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectReschedule(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reschedule-requests'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const customerRescheduleMutation = useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number | string; payload: ReschedulePayload }) =>
      orderApi.reschedule(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    data: requestsQuery.data,
    isLoading: requestsQuery.isLoading,
    refetch: requestsQuery.refetch,
    approve: approveMutation.mutate,
    approveAsync: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutate,
    rejectAsync: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    requestCustomerReschedule: customerRescheduleMutation.mutate,
    requestCustomerRescheduleAsync: customerRescheduleMutation.mutateAsync,
    isRequestingReschedule: customerRescheduleMutation.isPending,
  };
};
