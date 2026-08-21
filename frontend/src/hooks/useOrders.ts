import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, CreateOrderPayload, StatusUpdatePayload, FailDeliveryPayload, ReschedulePayload } from '../api/orderApi';
import { Order } from '../types';

export function useOrders(params?: { page?: number; size?: number; status?: string; zoneId?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const data = await orderApi.getOrders(params);
      // Handle both Page<Order> or List<Order>
      if (data && Array.isArray(data.content)) {
        return data.content as Order[];
      }
      if (Array.isArray(data)) {
        return data as Order[];
      }
      return [] as Order[];
    },
  });
}

export function useOrder(id: number | string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => (id ? orderApi.getOrderById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: StatusUpdatePayload }) =>
      orderApi.updateStatus(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['tracking', vars.id] });
    },
  });

  const autoAssign = useMutation({
    mutationFn: (id: number | string) => orderApi.autoAssign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  const manualAssign = useMutation({
    mutationFn: ({ id, agentId }: { id: number | string; agentId: number }) =>
      orderApi.manualAssign(id, agentId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', vars.id] });
    },
  });

  const markFailed = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: FailDeliveryPayload }) =>
      orderApi.markFailed(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', vars.id] });
    },
  });

  const reschedule = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ReschedulePayload }) =>
      orderApi.reschedule(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', vars.id] });
    },
  });

  return {
    createOrder,
    updateStatus,
    autoAssign,
    manualAssign,
    markFailed,
    reschedule,
  };
}
