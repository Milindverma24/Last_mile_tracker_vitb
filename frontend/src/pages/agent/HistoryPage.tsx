import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import { Package, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

export const AgentHistoryPage: React.FC = () => {
  const { data: orders = [], isLoading } = useOrders();
  const pastOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'FAILED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Run History</h1>
        <p className="text-sm text-slate-500">Historical performance logs and completed tasks</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-slate-500 text-center py-8">Loading history...</p>
        ) : pastOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No completed tasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600">{order.trackingNumber}</span>
                  <p className="text-sm font-bold text-slate-900">{order.dropName} ({order.dropPincode})</p>
                  <p className="text-xs text-slate-400">{new Date(order.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
