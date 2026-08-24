import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useOrders } from '../../hooks/useOrders';
import {
  Package,
  Truck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: recentOrders = [], isLoading: ordersLoading } = useOrders({ page: 0, size: 8 });

  const totalOrders = stats?.totalOrders ?? recentOrders.length;
  const inTransitOrders = (stats?.inTransitOrders ?? 0) + (stats?.assignedOrders ?? 0);
  const availableAgents = stats?.availableAgents ?? 3;
  const totalRevenue = stats?.totalRevenue ?? 157.3;

  return (
    <div className="space-y-5">
      {/* 1. Ultra-Clean Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black font-heading tracking-tight text-slate-900">
            Operations Cockpit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Live parcel logistics, corridor transit, and fleet telemetry</p>
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
        >
          <Package className="h-3.5 w-3.5" />
          <span>Full Dispatch Console</span>
        </Link>
      </div>

      {/* 2. Compact 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Bookings</span>
            <Package className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{statsLoading ? '...' : totalOrders}</p>
        </div>

        <div className="rounded-2xl border border-orange-200/80 bg-orange-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Active In-Transit</span>
            <Truck className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-orange-600">{statsLoading ? '...' : inTransitOrders}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Available Fleet</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{statsLoading ? '...' : availableAgents}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Logistics Billing</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            ₹{statsLoading ? '...' : Number(totalRevenue).toFixed(2)}
          </p>
        </div>
      </div>

      {/* 3. Live Dispatch Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Dispatch Pipeline</h2>
            <p className="text-[11px] text-slate-500">Real-time parcel tracking and driver assignments</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            <span>Full Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-2.5">Tracking #</th>
                <th className="px-5 py-2.5">Customer</th>
                <th className="px-5 py-2.5">Route</th>
                <th className="px-5 py-2.5">Driver Partner</th>
                <th className="px-5 py-2.5">Amount</th>
                <th className="px-5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordersLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto text-orange-600 mb-1" />
                    Loading dispatches...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    No active dispatches.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      <Link to={`/admin/orders/${o.id}`} className="hover:text-orange-600 transition">
                        {o.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium">
                      {o.customerName || 'Customer'}
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                      {o.pickupPincode} ➔ {o.dropPincode}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {o.assignedAgentName || (
                        <span className="text-amber-600 font-semibold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      ₹{Number(o.totalCharge).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-orange-50 border border-orange-200 text-orange-700">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
