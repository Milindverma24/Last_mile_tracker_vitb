import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Client, IMessage } from '@stomp/stompjs';
import { trackingApi, LiveTrackingData } from '../api/trackingApi';

export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING';

export const useLiveTracking = (orderId?: number | string) => {
  const queryClient = useQueryClient();
  const numericId = orderId ? Number(orderId) : null;
  const [liveData, setLiveData] = useState<LiveTrackingData | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('CONNECTING');
  const stompClientRef = useRef<Client | null>(null);

  // 1. Initial REST fetch and periodic fallback query
  const query = useQuery({
    queryKey: ['liveTracking', numericId],
    queryFn: () => (numericId ? trackingApi.getLiveTracking(numericId) : null),
    enabled: !!numericId,
    staleTime: 2000,
    refetchInterval: connectionState === 'CONNECTED' ? false : 8000,
  });

  // Sync initial query response into liveData if null
  useEffect(() => {
    if (query.data && !liveData) {
      setLiveData(query.data);
    }
  }, [query.data, liveData]);

  // 2. Real-time STOMP WebSocket Subscription using Native WebSockets
  useEffect(() => {
    if (!numericId) return;

    const rawWs = import.meta.env.VITE_WS_URL || 'ws://localhost:8088/ws';
    const wsUrl = rawWs.startsWith('http://')
      ? rawWs.replace('http://', 'ws://').replace(/\/$/, '') + (rawWs.includes('/ws') ? '' : '/ws')
      : rawWs.startsWith('https://')
      ? rawWs.replace('https://', 'wss://').replace(/\/$/, '') + (rawWs.includes('/ws') ? '' : '/ws')
      : rawWs;

    let client: Client | null = null;
    try {
      client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: () => {},
        onConnect: () => {
          setConnectionState('CONNECTED');

          // Real-time Driver GPS Telemetry stream
          client?.subscribe(`/topic/orders/${numericId}/tracking`, (message: IMessage) => {
            try {
              const update: LiveTrackingData = JSON.parse(message.body);
              setLiveData(update);
              queryClient.setQueryData(['liveTracking', numericId], update);
            } catch (e) {
              console.error('Failed to parse WebSocket tracking update:', e);
            }
          });

          // Real-time Order Status Milestone stream
          client?.subscribe(`/topic/orders/${numericId}/status`, (message: IMessage) => {
            try {
              const statusUpdate = JSON.parse(message.body);
              queryClient.invalidateQueries({ queryKey: ['order', numericId] });
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['tracking', numericId] });
              if (statusUpdate && statusUpdate.status) {
                setLiveData((prev) => prev ? { ...prev, status: statusUpdate.status } : null);
              }
            } catch (e) {
              console.error('Failed to parse WebSocket status update:', e);
            }
          });
        },
        onDisconnect: () => {
          setConnectionState('DISCONNECTED');
        },
        onStompError: () => {
          setConnectionState('RECONNECTING');
        },
        onWebSocketClose: () => {
          setConnectionState('DISCONNECTED');
        },
        onWebSocketError: () => {
          setConnectionState('DISCONNECTED');
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (err) {
      console.warn('WebSocket STOMP client failed to initialize:', err);
      setConnectionState('DISCONNECTED');
    }

    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate();
        } catch (e) {
          // ignore cleanup error
        }
        stompClientRef.current = null;
      }
    };
  }, [numericId, queryClient]);

  return {
    data: liveData || query.data || null,
    isLoading: query.isLoading && !liveData,
    isError: query.isError,
    error: query.error,
    connectionState,
    refetch: query.refetch,
  };
};
