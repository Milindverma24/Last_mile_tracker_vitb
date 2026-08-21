import { apiClient } from './axios';
import { ApiResponse } from '../types';

export interface NotificationPreferences {
  orderUpdates?: boolean;
  deliveryUpdates?: boolean;
  rescheduleUpdates?: boolean;
  securityAlerts?: boolean;
  marketing?: boolean;
  language?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface AgentProfileInfo {
  agentId: number;
  vehicleType: string;
  vehicleNumber: string;
  assignedZoneId?: number;
  assignedZoneName?: string;
  isAvailable: boolean;
  currentActiveOrders: number;
  maxActiveOrders: number;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: string;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  successRate: number;
}

export interface AdminProfileInfo {
  adminId: number;
  department: string;
  permissions: string[];
  superAdmin: boolean;
  totalSystemAudits: number;
}

export interface CustomerProfileInfo {
  customerId: number;
  customerType: string;
  companyName?: string;
  gstNumber?: string;
  defaultPickupAddress?: string;
  defaultPickupPincode?: string;
  totalOrdersPlaced: number;
}

export interface ProfileData {
  id: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN';
  status: string;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: NotificationPreferences;
  agentInfo?: AgentProfileInfo;
  adminInfo?: AdminProfileInfo;
  customerInfo?: CustomerProfileInfo;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export const profileApi = {
  getProfile: async (): Promise<ProfileData> => {
    const res = await apiClient.get<ApiResponse<ProfileData>>('/profile');
    return res.data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ProfileData> => {
    const res = await apiClient.patch<ApiResponse<ProfileData>>('/profile', payload);
    return res.data.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/profile/password', payload);
  },

  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const res = await apiClient.get<ApiResponse<NotificationPreferences>>('/profile/notification-preferences');
    return res.data.data;
  },

  updateNotificationPreferences: async (payload: NotificationPreferences): Promise<NotificationPreferences> => {
    const res = await apiClient.patch<ApiResponse<NotificationPreferences>>('/profile/notification-preferences', payload);
    return res.data.data;
  },

  updateAvailability: async (available: boolean): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/profile/availability', { available });
  },
};
