import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import { useAgentProfile, useAgentMutations } from '../../hooks/useAgents';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Order, OrderStatus, FailureReason } from '../../types';
import { AgentGpsBroadcaster } from '../../components/tracking/AgentGpsBroadcaster';

export const AgentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrders();
  const { updateStatus, markFailed } = useOrderMutations();

  const [selectedFailOrder, setSelectedFailOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState<FailureReason>('CUSTOMER_UNAVAILABLE');
  const [failureNotes, setFailureNotes] = useState('');

  const activeDeliveries = orders.filter(
    (o) =>
      o.status === 'ASSIGNED' ||
      o.status === 'PICKED_UP' ||
      o.status === 'IN_TRANSIT' ||
      o.status === 'OUT_FOR_DELIVERY'
  );

  const completedToday = orders.filter((o) => o.status === 'DELIVERED').length;
  const failedToday = orders.filter((o) => o.status === 'FAILED').length;

  const handleAdvanceStatus = async (order: Order, nextStatus: OrderStatus) => {
    await updateStatus.mutateAsync({
      id: order.id,
      payload: {
        status: nextStatus,
        remarks: `Updated to ${nextStatus} by driver partner`,
      },
    });
  };

  const handleConfirmFailed = async () => {
    if (!selectedFailOrder) return;
    await markFailed.mutateAsync({
      id: selectedFailOrder.id,
      payload: {
        failureReason,
        failureNotes,
      },
    });
    setSelectedFailOrder(null);
    setFailureNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Driver KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Active Tasks</p>
          <p className="text-2xl font-black text-indigo-600">{isLoading ? '...' : activeDeliveries.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Delivered Today</p>
          <p className="text-2xl font-black text-emerald-600">{isLoading ? '...' : completedToday}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Failed / Rescheduled</p>
          <p className="text-2xl font-black text-rose-600">{isLoading ? '...' : failedToday}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Total Assigned</p>
          <p className="text-2xl font-black text-slate-900">{isLoading ? '...' : orders.length}</p>
        </div>
      </div>

      {/* Active Run Sheet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Current Assigned Shipments</h2>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
            {activeDeliveries.length} Pending Actions
          </span>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white p-12 text-center text-sm text-slate-500">
            Loading assigned delivery run sheet...
          </div>
        ) : activeDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Truck className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No Active Deliveries</h3>
            <p className="mt-1 text-xs text-slate-500">
              You are all caught up! New dispatch requests will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
              >
                {/* Header & Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-sm font-black text-indigo-600">
                      {order.trackingNumber}
                    </span>
                    <p className="text-xs text-slate-500">
                      {order.customerType} • {order.paymentType} • ₹{Number(order.totalCharge).toFixed(2)}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    {order.status}
                  </span>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="font-bold text-slate-500 uppercase">Pickup</p>
                    <p className="font-bold text-slate-900">{order.pickupName}</p>
                    <p className="text-slate-600">{order.pickupAddress}</p>
                    <p className="mt-1 font-mono text-slate-500">{order.pickupPhone} • {order.pickupPincode}</p>
                  </div>

                  <div className="rounded-xl bg-indigo-50/50 p-3 border border-indigo-100">
                    <p className="font-bold text-indigo-600 uppercase">Drop / Recipient</p>
                    <p className="font-bold text-slate-900">{order.dropName}</p>
                    <p className="text-slate-600">{order.dropAddress}</p>
                    <p className="mt-1 font-mono text-slate-500">{order.dropPhone} • {order.dropPincode}</p>
                  </div>
                </div>

                {/* Live GPS Telemetry Broadcaster for Active Deliveries */}
                {(order.status === 'PICKED_UP' || order.status === 'IN_TRANSIT' || order.status === 'OUT_FOR_DELIVERY') && (
                  <AgentGpsBroadcaster order={order} />
                )}

                {/* Touch-Friendly Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {order.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleAdvanceStatus(order, 'PICKED_UP')}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                    >
                      ✓ Mark Picked Up
                    </button>
                  )}

                  {order.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleAdvanceStatus(order, 'IN_TRANSIT')}
                      className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500"
                    >
                      🚚 Mark In Transit
                    </button>
                  )}

                  {order.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleAdvanceStatus(order, 'OUT_FOR_DELIVERY')}
                      className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-500"
                    >
                      📍 Mark Out for Delivery
                    </button>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <>
                      <button
                        onClick={() => handleAdvanceStatus(order, 'DELIVERED')}
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
                      >
                        ✓ Mark Delivered Successfully
                      </button>

                      <button
                        onClick={() => setSelectedFailOrder(order)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                      >
                        ✕ Mark Failed
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failure Reason Dialog Modal */}
      {selectedFailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-bold text-slate-900">Record Delivery Failure</h3>
              </div>
              <button
                onClick={() => setSelectedFailOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please specify the authoritative failure reason for tracking audit records.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Failure Reason</label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value as FailureReason)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                >
                  <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable / Phone Unreachable</option>
                  <option value="INCORRECT_ADDRESS">Incorrect / Incomplete Address</option>
                  <option value="CUSTOMER_REJECTED">Customer Refused Delivery / COD Rejected</option>
                  <option value="SECURITY_ACCESS_DENIED">Security / Gated Society Access Denied</option>
                  <option value="WEATHER_DISRUPTION">Extreme Weather / Route Inaccessible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Additional Remarks</label>
                <textarea
                  rows={3}
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  placeholder="e.g. Called customer 3 times, door locked..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFailOrder(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFailed}
                disabled={markFailed.isPending}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-500 disabled:opacity-50"
              >
                {markFailed.isPending ? 'Submitting...' : 'Confirm Delivery Failure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
