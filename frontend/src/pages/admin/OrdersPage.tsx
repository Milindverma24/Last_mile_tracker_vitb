import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import { useAgents } from '../../hooks/useAgents';
import {
  Package,
  Search,
  Filter,
  Truck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: orders = [], isLoading } = useOrders();
  const { data: agents = [] } = useAgents();
  const { autoAssign, manualAssign } = useOrderMutations();

  const [selectedOrderForManual, setSelectedOrderForManual] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.dropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pickupPincode.includes(searchTerm) ||
      o.dropPincode.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAutoAssign = async (orderId: number) => {
    try {
      await autoAssign.mutateAsync(orderId);
      setSuccessToast(`Auto-assigned order #${orderId} to nearest eligible driver.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Auto-assignment failed');
    }
  };

  const handleManualAssignConfirm = async () => {
    if (!selectedOrderForManual || !selectedAgentId) return;
    try {
      await manualAssign.mutateAsync({
        id: selectedOrderForManual.id,
        agentId: Number(selectedAgentId),
      });
      setSuccessToast(`Dispatched order #${selectedOrderForManual.id} manually.`);
      setSelectedOrderForManual(null);
      setSelectedAgentId('');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Manual assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dispatch & Order Management
          </h1>
          <p className="text-sm text-slate-500">
            Monitor real-time lifecycle states, trigger auto-assignment algorithms, and manage manual dispatches
          </p>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Tracking #, Customer, Recipient, or PIN code..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created (Unassigned)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Orders Dispatch Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading system orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No orders match criteria</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Tracking #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Route (Origin → Dest)</th>
                  <th className="px-6 py-3">Weight</th>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-400">{order.customerType} • {order.paymentType}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      {order.pickupPincode} → {order.dropPincode}
                      <span className="ml-1 text-[11px] text-slate-400">({order.routeType})</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-900">
                      {order.billableWeightKg} kg
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {order.assignedAgentName ? (
                        <span className="font-semibold text-slate-800">{order.assignedAgentName}</span>
                      ) : (
                        <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'CREATED' && (
                          <>
                            <button
                              onClick={() => handleAutoAssign(order.id)}
                              className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-indigo-500"
                              title="Smart Auto-Assign"
                            >
                              <Zap className="h-3 w-3" /> Auto
                            </button>
                            <button
                              onClick={() => setSelectedOrderForManual(order)}
                              className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Manual
                            </button>
                          </>
                        )}
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Dispatch Modal */}
      {selectedOrderForManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">
                Manual Dispatch: {selectedOrderForManual.trackingNumber}
              </h3>
              <button
                onClick={() => setSelectedOrderForManual(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Select an active driver partner for pickup in{' '}
                <strong>{selectedOrderForManual.pickupZoneName || 'Pickup Zone'}</strong> ({selectedOrderForManual.pickupPincode}).
              </p>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Available Driver</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                >
                  <option value="">-- Choose active delivery driver --</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.vehicleNumber}) • {agent.currentActiveOrders}/{agent.maxActiveOrders} load
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrderForManual(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAssignConfirm}
                disabled={!selectedAgentId}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
              >
                Dispatch to Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
