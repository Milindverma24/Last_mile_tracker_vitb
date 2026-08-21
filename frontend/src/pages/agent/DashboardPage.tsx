import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import { useAgentProfile, useAgentMutations } from '../../hooks/useAgents';
import {
  Truck, CheckCircle2, AlertTriangle, Clock, MapPin, Phone,
  ShieldAlert, X, Navigation, Package, ArrowRight, Zap, RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, FailureReason } from '../../types';
import { AgentGpsBroadcaster } from '../../components/tracking/AgentGpsBroadcaster';

const STATUS_ACTIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; color: string }>> = {
  ASSIGNED: { next: 'PICKED_UP', label: '✓ Mark Picked Up', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  PICKED_UP: { next: 'IN_TRANSIT', label: '🚚 Start Transit', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  IN_TRANSIT: { next: 'OUT_FOR_DELIVERY', label: '📍 Out for Delivery', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
};

const getStatusBadge = (status: OrderStatus) => {
  const map: Partial<Record<OrderStatus, string>> = {
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    PICKED_UP: 'bg-violet-50 text-violet-700 border-violet-200',
    IN_TRANSIT: 'bg-amber-50 text-amber-700 border-amber-200',
    OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border-orange-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

export const AgentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading, refetch } = useOrders();
  const { updateStatus, markFailed } = useOrderMutations();
  const { data: agentProfile } = useAgentProfile();

  const [selectedFailOrder, setSelectedFailOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState<FailureReason>('CUSTOMER_UNAVAILABLE');
  const [failureNotes, setFailureNotes] = useState('');

  const activeDeliveries = orders.filter((o) =>
    ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const completedToday = orders.filter((o) => o.status === 'DELIVERED').length;
  const failedToday = orders.filter((o) => o.status === 'FAILED').length;

  const handleAdvanceStatus = async (order: Order, nextStatus: OrderStatus) => {
    await updateStatus.mutateAsync({ id: order.id, payload: { status: nextStatus, remarks: `Updated to ${nextStatus} by driver partner` } });
  };

  const handleConfirmFailed = async () => {
    if (!selectedFailOrder) return;
    await markFailed.mutateAsync({ id: selectedFailOrder.id, payload: { failureReason, failureNotes } });
    setSelectedFailOrder(null); setFailureNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Driver Run Sheet
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.firstName} {user?.lastName}
            {agentProfile && (
              <span> · {agentProfile.vehicleType} {agentProfile.vehicleNumber}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Active Tasks', value: isLoading ? '—' : activeDeliveries.length, icon: Truck, bg: 'bg-indigo-50', color: 'text-indigo-600', val: 'text-indigo-700' },
          { label: 'Delivered Today', value: isLoading ? '—' : completedToday, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', val: 'text-emerald-700' },
          { label: 'Failed / Missed', value: isLoading ? '—' : failedToday, icon: AlertTriangle, bg: 'bg-rose-50', color: 'text-rose-600', val: 'text-rose-700' },
          { label: 'Total Assigned', value: isLoading ? '—' : orders.length, icon: Package, bg: 'bg-slate-100', color: 'text-slate-600', val: 'text-slate-900' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg} ${card.color} mb-3`}>
              <card.icon className="h-4.5 w-4.5 h-5 w-5" />
            </div>
            <p className={`text-2xl font-black ${card.val}`}>{card.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5 leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Active deliveries section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Current Assigned Shipments</h2>
          {activeDeliveries.length > 0 && (
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {activeDeliveries.length} Pending Actions
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Loading assigned delivery run sheet...
          </div>
        ) : activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-slate-100">
              <Truck className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900">No Active Deliveries</h3>
            <p className="text-sm text-slate-500">You are all caught up! New dispatch requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((order) => {
              const action = STATUS_ACTIONS[order.status];
              const isLiveGps = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status);

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-indigo-600">{order.trackingNumber}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.customerType} · {order.paymentType} · ₹{Number(order.totalCharge).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pickup</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{order.pickupName}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{order.pickupAddress}</p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <a href={`tel:${order.pickupPhone}`} className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700">
                          <Phone className="h-3 w-3" />{order.pickupPhone}
                        </a>
                        <span className="font-mono text-[11px] text-slate-500">{order.pickupPincode}</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="h-3 w-3 text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Drop / Recipient</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{order.dropName}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{order.dropAddress}</p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <a href={`tel:${order.dropPhone}`} className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700">
                          <Phone className="h-3 w-3" />{order.dropPhone}
                        </a>
                        <span className="font-mono text-[11px] text-slate-500">{order.dropPincode}</span>
                      </div>
                    </div>
                  </div>

                  {/* GPS Broadcaster for active deliveries */}
                  {isLiveGps && (
                    <div className="px-5 pb-3">
                      <AgentGpsBroadcaster order={order} />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="px-5 pb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {action && (
                      <button
                        onClick={() => handleAdvanceStatus(order, action.next)}
                        disabled={updateStatus.isPending}
                        className={`flex-1 rounded-xl py-3.5 text-sm font-bold shadow-sm transition disabled:opacity-50 cursor-pointer ${action.color}`}
                      >
                        {updateStatus.isPending ? 'Updating...' : action.label}
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <>
                        <button
                          onClick={() => handleAdvanceStatus(order, 'DELIVERED')}
                          disabled={updateStatus.isPending}
                          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
                        >
                          ✓ Mark Delivered
                        </button>
                        <button
                          onClick={() => setSelectedFailOrder(order)}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        >
                          ✕ Mark Failed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Failure Modal */}
      {selectedFailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-bold text-slate-900">Record Delivery Failure</h3>
              </div>
              <button onClick={() => setSelectedFailOrder(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500">Please specify the authoritative failure reason for tracking audit records.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Failure Reason</label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value as FailureReason)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 transition"
                >
                  <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable / Phone Unreachable</option>
                  <option value="WRONG_ADDRESS">Incorrect / Incomplete Address</option>
                  <option value="CUSTOMER_REFUSED">Customer Refused Delivery / COD Rejected</option>
                  <option value="SECURITY_ACCESS_DENIED">Security / Gated Society Access Denied</option>
                  <option value="WEATHER_DISRUPTION">Extreme Weather / Route Inaccessible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Additional Remarks</label>
                <textarea
                  rows={3}
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  placeholder="e.g. Called customer 3 times, door locked..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 transition resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setSelectedFailOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFailed}
                disabled={markFailed.isPending}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50 transition cursor-pointer"
              >
                {markFailed.isPending ? 'Submitting...' : 'Confirm Failure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
