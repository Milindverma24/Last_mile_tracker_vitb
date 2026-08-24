import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AgentLayout } from '../layouts/AgentLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { PublicTrackingPage } from '../pages/public/PublicTrackingPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { CustomerRegisterPage } from '../pages/auth/CustomerRegisterPage';
import { DriverRegisterPage } from '../pages/auth/DriverRegisterPage';

// Customer Pages
import { CustomerDashboardPage } from '../pages/customer/DashboardPage';
import { CustomerCreateOrderPage } from '../pages/customer/CreateOrderPage';
import { CustomerOrdersPage } from '../pages/customer/OrdersPage';
import { CustomerOrderTrackingPage } from '../pages/customer/OrderTrackingPage';
import { CustomerReschedulePage } from '../pages/customer/ReschedulePage';
import { CustomerNotificationsPage } from '../pages/customer/NotificationsPage';
import { CustomerProfilePage } from '../pages/customer/ProfilePage';

// Agent Pages
import { AgentDashboardPage } from '../pages/agent/DashboardPage';
import { AgentDeliveriesPage } from '../pages/agent/DeliveriesPage';
import { AgentHistoryPage } from '../pages/agent/HistoryPage';
import { AgentProfilePage } from '../pages/agent/ProfilePage';
import { AgentNotificationsPage } from '../pages/agent/NotificationsPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/DashboardPage';
import { AdminOrdersPage } from '../pages/admin/OrdersPage';
import { AdminOrderDetailPage } from '../pages/admin/OrderDetailPage';
import { AdminRescheduleRequestsPage } from '../pages/admin/RescheduleRequestsPage';
import { AdminCustomersPage } from '../pages/admin/CustomersPage';
import { AdminAgentsPage } from '../pages/admin/AgentsPage';
import { AdminZonesPage } from '../pages/admin/ZonesPage';
import { AdminRateCardsPage } from '../pages/admin/RateCardsPage';
import { AdminAnalyticsPage } from '../pages/admin/AnalyticsPage';
import { AdminAuditLogsPage } from '../pages/admin/AuditLogsPage';
import { AdminSystemHealthPage } from '../pages/admin/SystemHealthPage';
import { AdminNotificationsPage } from '../pages/admin/NotificationsPage';
import { AdminSettingsPage } from '../pages/admin/SettingsPage';
import { AdminProfilePage } from '../pages/admin/ProfilePage';
import { EmailMonitoringPage } from '../pages/admin/EmailMonitoringPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Landing Page (Modern Industrial UI) */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Tracking Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/track" element={<PublicTrackingPage />} />
        <Route path="/track/:trackingNumber" element={<PublicTrackingPage />} />
      </Route>

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CustomerRegisterPage />} />
        <Route path="/register/customer" element={<CustomerRegisterPage />} />
        <Route path="/register/driver" element={<DriverRegisterPage />} />
        <Route path="/register/agent" element={<DriverRegisterPage />} />
      </Route>

      {/* Customer Portal Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="orders/create" element={<CustomerCreateOrderPage />} />
        <Route path="orders/:id" element={<CustomerOrderTrackingPage />} />
        <Route path="orders/:id/track" element={<CustomerOrderTrackingPage />} />
        <Route path="reschedule" element={<CustomerReschedulePage />} />
        <Route path="notifications" element={<CustomerNotificationsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Delivery Agent Portal Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['DELIVERY_AGENT', 'ADMIN']}>
              <AgentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboardPage />} />
        <Route path="deliveries" element={<AgentDeliveriesPage />} />
        <Route path="deliveries/:id" element={<CustomerOrderTrackingPage />} />
        <Route path="history" element={<AgentHistoryPage />} />
        <Route path="notifications" element={<AgentNotificationsPage />} />
        <Route path="profile" element={<AgentProfilePage />} />
      </Route>

      {/* Admin Operations Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="emails" element={<EmailMonitoringPage />} />
        <Route path="reschedules" element={<AdminRescheduleRequestsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="agents" element={<AdminAgentsPage />} />
        <Route path="zones" element={<AdminZonesPage />} />
        <Route path="rate-cards" element={<AdminRateCardsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="system-health" element={<AdminSystemHealthPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
