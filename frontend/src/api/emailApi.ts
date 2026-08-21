import { apiClient } from './axios';
import { ApiResponse } from '../types';

export type EmailStatus = 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING';

export type EmailEventType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'AGENT_ASSIGNED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'OUT_FOR_DELIVERY'
  | 'NEAR_DESTINATION'
  | 'DELIVERED'
  | 'DELIVERY_CANCELLED'
  | 'DELIVERY_DELAYED'
  | 'DELIVERY_FAILED'
  | 'RESCHEDULE_APPROVED'
  | 'RESCHEDULE_REJECTED';

export interface EmailLogItem {
  id: number;
  notificationId?: number;
  orderId: number;
  trackingNumber: string;
  customerId?: number;
  recipientEmail: string;
  recipientName?: string;
  eventType: EmailEventType;
  subject: string;
  htmlContent?: string;
  status: EmailStatus;
  sentAt?: string;
  retryCount: number;
  failureReason?: string;
  idempotencyKey: string;
  distanceRemaining?: number;
  etaMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailStats {
  totalEmails: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  retryingCount: number;
  successRate: number;
  eventCounts: Record<EmailEventType, number>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const emailApi = {
  getEmailLogs: async (params?: {
    status?: string;
    eventType?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<EmailLogItem>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<EmailLogItem>>>('/admin/emails', {
      params,
    });
    return res.data.data;
  },

  getEmailStats: async (): Promise<EmailStats> => {
    const res = await apiClient.get<ApiResponse<EmailStats>>('/admin/emails/stats');
    return res.data.data;
  },

  getEmailLogById: async (id: number): Promise<EmailLogItem> => {
    const res = await apiClient.get<ApiResponse<EmailLogItem>>(`/admin/emails/${id}`);
    return res.data.data;
  },

  retryEmail: async (id: number): Promise<EmailLogItem> => {
    const res = await apiClient.post<ApiResponse<EmailLogItem>>(`/admin/emails/${id}/retry`);
    return res.data.data;
  },

  previewEmailTemplate: async (eventType: EmailEventType, orderId?: number): Promise<string> => {
    const res = await apiClient.get<ApiResponse<string>>('/admin/emails/preview', {
      params: { eventType, orderId },
    });
    return res.data.data;
  },

  sendTestEmail: async (payload: {
    toEmail: string;
    eventType: EmailEventType;
    orderId?: number;
  }): Promise<string> => {
    const res = await apiClient.post<ApiResponse<string>>('/admin/emails/test-send', payload);
    return res.data.data || res.data.message || 'Test email dispatched';
  },
};
