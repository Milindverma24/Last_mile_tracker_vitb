import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  Package, PlusCircle, Search, ArrowRight,
  ExternalLink, Navigation, Zap, RefreshCw,
  Truck, CheckCircle, RotateCcw, MapPin, Calculator,
} from 'lucide-react';
import { OrderStatus } from '../../types';

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'DELIVERED':
      return { label: 'Delivered', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', style: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' };
    case 'IN_TRANSIT':
      return { label: 'In Transit', style: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'PICKED_UP':
      return { label: 'Picked Up', style: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'ASSIGNED':
      return { label: 'Driver Assigned', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'FAILED':
      return { label: 'Delivery Attempt Failed', style: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'RESCHEDULED':
      return { label: 'Rescheduled', style: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: 'Order Placed', style: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, refetch } = useOrders();
  const [quickTrackNumber, setQuickTrackNumber] = useState('');

  const activeOrders = orders.filter((o) =>
    ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const liveDeliveries = activeOrders.filter((o) =>
    ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const recentOrders = orders.slice(0, 4);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackNumber.trim()) {
      navigate(`/customer/orders/${quickTrackNumber.trim()}/track`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Friendly Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hello, {user?.firstName || 'there'}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          What would you like to send or track today?
        </p>
      </div>

      {/* Live En-Route Shipment Alert (Shown when packages are active) */}
      {!isLoading && liveDeliveries.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-5 sm:p-6 text-white shadow-lg shadow-indigo-500/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 border border-white/30 shadow-inner">
                <Navigation className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Live Delivery in Progress</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {liveDeliveries[0].trackingNumber}
                  {liveDeliveries.length > 1 && ` (+${liveDeliveries.length - 1} more)`}
                </h2>
                <p className="text-sm text-indigo-100 mt-0.5">
                  Status: <span className="font-semibold text-white">{liveDeliveries[0].status.replace('_', ' ')}</span>
                  {liveDeliveries[0].assignedAgentName && ` · Driver: ${liveDeliveries[0].assignedAgentName}`}
                  {` · ${liveDeliveries[0].pickupPincode} → ${liveDeliveries[0].dropPincode}`}
                </p>
              </div>
            </div>
            <Link
              to={`/customer/orders/${liveDeliveries[0].id}/track`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition shadow-sm whitespace-nowrap self-start sm:self-center"
            >
              Track Live on Map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Easy-to-use Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Action 1: Book / Send Package */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition group">
          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Instant Doorstep Pickup
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-4">Send a Package</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Book doorstep pickup with live volumetric pricing, payment options (Online / COD), and automated driver dispatch.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/customer/orders/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" /> Book New Shipment
            </Link>
            <Link
              to="/customer/orders/create"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hidden sm:inline-flex items-center gap-1"
            >
              Calculate Fare <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Action 2: Quick Track Shipment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition group">
          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live GPS Updates
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-4">Track Any Package</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Enter your tracking number to check real-time GPS location, estimated delivery time, and status milestones.
            </p>
          </div>
          <form onSubmit={handleQuickTrack} className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={quickTrackNumber}
                  onChange={(e) => setQuickTrackNumber(e.target.value)}
                  placeholder="e.g. GTM-20260820-001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 transition font-mono"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                Track
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Deliveries - Clean Easy Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Deliveries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick overview of your latest shipments</p>
          </div>
          <Link
            to="/customer/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3.5 py-1.5 rounded-xl transition"
          >
            View All Deliveries <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-3 w-48 rounded" />
                <div className="skeleton h-8 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">No shipments yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ready to send a package? Book your first delivery in less than 2 minutes.
              </p>
            </div>
            <Link
              to="/customer/orders/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> Book First Shipment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {recentOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {order.trackingNumber}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} · ₹{Number(order.totalCharge).toFixed(2)}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {order.pickupPincode} → {order.dropPincode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'FAILED' && (
                        <Link
                          to={`/customer/reschedule?orderId=${order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition"
                        >
                          <RotateCcw className="h-3 w-3" /> Reschedule
                        </Link>
                      )}
                      <Link
                        to={`/customer/orders/${order.id}/track`}
                        className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition shadow-2xs"
                      >
                        Track <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
