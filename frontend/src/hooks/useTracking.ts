import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';

export function useTracking(orderId: number | string | undefined) {
  return useQuery({
    queryKey: ['tracking', orderId],
    queryFn: () => (orderId ? orderApi.getTrackingTimeline(orderId) : Promise.reject('No ID')),
    enabled: !!orderId,
    refetchInterval: 10000, // Live poll every 10s
  });
}

export function useTrackingByNumber(trackingNumber: string | undefined) {
  return useQuery({
    queryKey: ['trackingByNumber', trackingNumber],
    queryFn: () => (trackingNumber ? orderApi.trackByNumber(trackingNumber) : Promise.reject('No tracking number')),
    enabled: !!trackingNumber,
  });
}
