import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  Package, Clock, CheckCircle, AlertTriangle, PlusCircle, Search,
  ArrowRight, Truck, ExternalLink, Navigation, TrendingUp, Zap,
  MapPin, RefreshCw,
} from 'lucide-react';
import { OrderStatus } from '../../types';

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'OUT_FOR_DELIVERY': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
    case 'IN_TRANSIT': case 'PICKED_UP': case 'ASSIGNED': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'FAILED': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'RESCHEDULED': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, refetch } = useOrders();
  const [quickTrackNumber, setQuickTrackNumber] = useState('');

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const failedOrders = orders.filter((o) => o.status === 'FAILED').length;

  const liveDeliveries = activeOrders.filter((o) =>
    ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const recentOrders = orders.slice(0, 6);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackNumber.trim()) {
      navigate(`/customer/orders/${quickTrackNumber.trim()}/track`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {getGreeting()}, {user?.firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track real-time shipment movements and manage delivery schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/customer/orders/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Book Shipment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Bookings', value: isLoading ? '—' : totalOrders, icon: Package, iconBg: 'bg-slate-100', iconColor: 'text-slate-600', valueColor: 'text-slate-900' },
          { label: 'Active Shipments', value: isLoading ? '—' : activeOrders.length, icon: Truck, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
          { label: 'Delivered', value: isLoading ? '—' : deliveredOrders, icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
          { label: 'Failed / Issues', value: isLoading ? '—' : failedOrders, icon: AlertTriangle, iconBg: 'bg-rose-50', iconColor: 'text-rose-600', valueColor: 'text-rose-700' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
            <div className={`${card.iconBg} ${card.iconColor} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-slate-500 leading-none">{card.label}</p>
              <p className={`mt-1.5 text-2xl font-black ${card.valueColor}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live deliveries alert (only if there are active deliveries) */}
      {!isLoading && liveDeliveries.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Live Now</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  {liveDeliveries.length} Shipment{liveDeliveries.length > 1 ? 's' : ''} en Route
                </h2>
                <p className="text-sm text-indigo-100">
                  {liveDeliveries[0].trackingNumber}
                  {liveDeliveries.length > 1 && ` and ${liveDeliveries.length - 1} more`}
                  {' — '}
                  {liveDeliveries[0].status.replace('_', ' ')}
                  {liveDeliveries[0].assignedAgentName && ` · Driver: ${liveDeliveries[0].assignedAgentName}`}
                </p>
              </div>
            </div>
            <Link
              to={`/customer/orders/${liveDeliveries[0].id}/track`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/30 transition whitespace-nowrap"
            >
              Track Live <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick track + Book shipment row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Quick track */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Quick Track</h3>
          </div>
          <form onSubmit={handleQuickTrack} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTrackNumber}
                onChange={(e) => setQuickTrackNumber(e.target.value)}
                placeholder="GTM-20260820-..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 transition font-mono"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              Go
            </button>
          </form>
          <Link to="/track" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Or use public tracker →
          </Link>
        </div>

        {/* Book shipment CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-slate-900">Express Dispatch</h3>
          </div>
          <p className="text-sm text-slate-500">Instant volumetric pricing, nearest driver auto-assigned within 2 minutes.</p>
          <Link
            to="/customer/orders/create"
            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Book New Shipment
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Recent Deliveries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest shipments registered under your account</p>
          </div>
          <Link to="/customer/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-b-0">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-4 w-24 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">No shipments yet</h3>
              <p className="text-sm text-slate-500 mt-1">Place your first delivery booking to see it here.</p>
            </div>
            <Link
              to="/customer/orders/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              <PlusCircle className="h-4 w-4" /> Book First Shipment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Tracking #</th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Route</th>
                  <th className="px-6 py-3 text-left hidden sm:table-cell">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                        {order.trackingNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <div className="text-xs font-medium text-slate-700">{order.pickupPincode} → {order.dropPincode}</div>
                      <div className="text-[11px] text-slate-400">{order.routeType}</div>
                    </td>
                    <td className="px-6 py-3.5 hidden sm:table-cell font-semibold text-slate-900 text-xs">
                      ₹{Number(order.totalCharge).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/customer/orders/${order.id}/track`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Track <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
