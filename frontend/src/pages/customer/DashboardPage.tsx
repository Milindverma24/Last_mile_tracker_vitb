import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Search,
  ArrowRight,
  Truck,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useOrders();
  const [quickTrackNumber, setQuickTrackNumber] = useState('');

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) =>
      o.status === 'CREATED' ||
      o.status === 'ASSIGNED' ||
      o.status === 'PICKED_UP' ||
      o.status === 'IN_TRANSIT' ||
      o.status === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const failedOrders = orders.filter((o) => o.status === 'FAILED').length;

  const recentOrders = orders.slice(0, 5);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackNumber.trim()) {
      navigate(`/customer/orders/${quickTrackNumber.trim()}/track`);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'IN_TRANSIT':
      case 'PICKED_UP':
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RESCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Greeting & Quick Track */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track real-time shipment movements and manage delivery schedules with GATIMAN.
          </p>
        </div>

        {/* Quick Tracking Search Bar */}
        <form onSubmit={handleQuickTrack} className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={quickTrackNumber}
              onChange={(e) => setQuickTrackNumber(e.target.value)}
              placeholder="Enter Tracking # (GTM-...)"
              className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Track
          </button>
        </form>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Total Bookings</p>
            <p className="text-2xl font-black text-slate-900">{isLoading ? '...' : totalOrders}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Active Shipments</p>
            <p className="text-2xl font-black text-blue-600">{isLoading ? '...' : activeOrders}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Successfully Delivered</p>
            <p className="text-2xl font-black text-emerald-600">{isLoading ? '...' : deliveredOrders}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Failed / Rescheduled</p>
            <p className="text-2xl font-black text-rose-600">{isLoading ? '...' : failedOrders}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="rounded bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              ⚡ Instant Dispatch
            </span>
            <h2 className="mt-2 text-xl font-bold">Book a New Express Delivery</h2>
            <p className="text-sm text-slate-300">
              Calculate volumetric pricing automatically and dispatch to the nearest verified agent.
            </p>
          </div>
          <Link
            to="/customer/orders/create"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-400"
          >
            <PlusCircle className="h-5 w-5" />
            Book Shipment Now
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Deliveries</h2>
            <p className="text-xs text-slate-500">Latest shipments registered under your account</p>
          </div>
          <Link
            to="/customer/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading shipments...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No shipments found</h3>
            <p className="mt-1 text-xs text-slate-500">Place your first delivery booking to see it here.</p>
            <Link
              to="/customer/orders/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500"
            >
              <PlusCircle className="h-4 w-4" /> Create First Booking
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Tracking #</th>
                  <th className="px-6 py-3">Pickup → Drop</th>
                  <th className="px-6 py-3">Type / Pay</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      <Link to={`/customer/orders/${order.id}/track`} className="hover:underline">
                        {order.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-900">
                        {order.pickupPincode} ({order.pickupAreaName || 'Zone A'}) → {order.dropPincode} ({order.dropAreaName || 'Zone B'})
                      </div>
                      <div className="text-[11px] text-slate-400">{order.routeType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {order.customerType}
                      </span>
                      <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {order.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹{Number(order.totalCharge).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/customer/orders/${order.id}/track`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600"
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
