import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import {
  Package, Search, Filter, ExternalLink, PlusCircle, RefreshCw,
  Truck, Navigation, CheckCircle, AlertTriangle, RotateCcw,
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

const STATUS_GROUPS = [
  { key: 'ALL', label: 'All Orders', icon: Package },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  { key: 'FAILED', label: 'Failed', icon: AlertTriangle },
];

export const CustomerOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { data: orders = [], isLoading, refetch } = useOrders();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.dropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pickupPincode.includes(searchTerm) ||
      o.dropPincode.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Deliveries</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage all your historical and active bookings</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/customer/orders/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Book New Delivery</span>
          </Link>
        </div>
      </div>

      {/* Status Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_GROUPS.map((sg) => {
          const Icon = sg.icon;
          const count = sg.key === 'ALL' ? orders.length : orders.filter((o) => o.status === sg.key).length;
          const active = statusFilter === sg.key;
          return (
            <button
              key={sg.key}
              onClick={() => setStatusFilter(sg.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                active
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{sg.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Tracking #, Recipient, or PIN code..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-2xs font-mono"
        />
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-b-0">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-4 w-28 ml-auto rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">No shipments found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter.'
                  : 'Place your first delivery booking to see it here.'}
              </p>
            </div>
            {!searchTerm && statusFilter === 'ALL' && (
              <Link
                to="/customer/orders/create"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Book First Shipment</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Tracking #</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-left">Route</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Weight</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition group">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/customer/orders/${order.id}/track`}
                        className="font-mono text-xs font-bold text-slate-900 hover:text-orange-600 transition"
                      >
                        {order.trackingNumber}
                      </Link>
                      <div className="text-[10px] text-slate-400 mt-0.5">{order.customerType} · {order.paymentType}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-semibold text-slate-900">{order.pickupPincode} ➔ {order.dropPincode}</div>
                      <div className="text-[11px] text-slate-400">{order.routeType?.replace('_', ' ')}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs font-medium text-slate-600">
                      {order.billableWeightKg} kg
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell font-bold text-slate-900 text-xs">
                      ₹{Number(order.totalCharge).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'FAILED' && (
                          <Link
                            to={`/customer/reschedule?orderId=${order.id}`}
                            className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            <RotateCcw className="h-3 w-3 inline mr-1" />Reschedule
                          </Link>
                        )}
                        <Link
                          to={`/customer/orders/${order.id}/track`}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition shadow-2xs"
                        >
                          <span>Track</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer with count */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500 bg-slate-50">
            Showing {filteredOrders.length} of {orders.length} total shipments
          </div>
        )}
      </div>
    </div>
  );
};
