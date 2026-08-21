import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useOrders } from '../../hooks/useOrders';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  DollarSign,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: recentOrders = [], isLoading: ordersLoading } = useOrders({ page: 0, size: 5 });

  const totalOrders = stats?.totalOrders ?? recentOrders.length;
  const pendingOrders = stats?.pendingOrders ?? 0;
  const inTransitOrders = (stats?.inTransitOrders ?? 0) + (stats?.assignedOrders ?? 0);
  const deliveredOrders = stats?.deliveredOrders ?? 0;
  const failedOrders = stats?.failedOrders ?? 0;
  const availableAgents = stats?.availableAgents ?? 2;
  const totalRevenue = stats?.totalRevenue ?? 157.3;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations Command Center
          </h1>
          <p className="text-sm text-slate-500">
            Real-time fleet dispatch, SLA health, volumetric billing, and multi-hub analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500"
          >
            <Package className="h-4 w-4" /> Dispatch Console
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Total Bookings</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">{statsLoading ? '...' : totalOrders}</p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">↑ 12% vs last week</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Active In-Transit</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-blue-600">{statsLoading ? '...' : inTransitOrders}</p>
          <p className="mt-1 text-xs text-slate-500">On active routes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Available Fleet</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600">{statsLoading ? '...' : availableAgents}</p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">Active & online</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Gross Logistics Billing</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-indigo-900">
            ₹{statsLoading ? '...' : Number(totalRevenue).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-indigo-600 font-semibold">Realized charges</p>
        </div>
      </div>

      {/* Real-Time Operational Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Lifecycle Status Distribution
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Created / Unassigned</span>
              <span className="font-bold text-slate-900">{pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
              <span className="font-semibold text-blue-700">In Transit & Out For Delivery</span>
              <span className="font-bold text-blue-900">{inTransitOrders}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50">
              <span className="font-semibold text-emerald-700">Delivered Successfully</span>
              <span className="font-bold text-emerald-900">{deliveredOrders}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50">
              <span className="font-semibold text-rose-700">Failed / Rescheduling</span>
              <span className="font-bold text-rose-900">{failedOrders}</span>
            </div>
          </div>
        </div>

        {/* Hub Clusters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Active Hub Volumes
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">South Delhi Express Zone (DL-SOUTH)</span>
              <span className="font-bold text-indigo-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">North Delhi Zone (DL-NORTH)</span>
              <span className="font-bold text-indigo-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">Gurugram Cyber Hub (GGN-CENTRAL)</span>
              <span className="font-bold text-indigo-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">Noida Express Hub (NOI-SECTOR)</span>
              <span className="font-bold text-indigo-600">Active</span>
            </div>
          </div>
        </div>

        {/* System Intelligence Notice */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white shadow-sm space-y-3">
          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
            Automated Logistics Engine
          </span>
          <h3 className="text-base font-bold">Auto-Dispatch & Load Balancing</h3>
          <p className="text-xs text-slate-300">
            GATIMAN continuously pairs newly confirmed bookings with eligible driver partners using haversine GPS proximity and active order quotas.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/zones"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Configure Hub Rules <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Dispatch Feed</h2>
            <p className="text-xs text-slate-500">Recent parcels moving through the logistics pipeline</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
          >
            Full Dispatch Console <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Tracking #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Route (Origin → Destination)</th>
                <th className="px-6 py-3">Driver</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.trackingNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{order.customerName}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {order.pickupPincode} → {order.dropPincode} ({order.routeType})
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700">
                    {order.assignedAgentName || <span className="text-slate-400">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{Number(order.totalCharge).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
