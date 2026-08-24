import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Package,
  Calendar,
  Check,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';

export const AgentNotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading, refetch } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="h-7 w-7 text-orange-600" />
            Dispatch Tasks & Driver Alerts
          </h1>
          <p className="text-sm text-slate-500">Assignments, route reassignments, and system updates</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <CheckCheck className="h-4 w-4 text-orange-600" /> Mark all read
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-orange-600 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'UNREAD'
              ? 'bg-orange-600 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading alerts...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Bell className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="font-semibold">No driver alerts in this view</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-xl p-4 transition border ${
                !n.isRead
                  ? 'bg-orange-50/50 border-orange-200 shadow-sm'
                  : 'bg-white border-slate-100 hover:bg-slate-50/60'
              }`}
            >
              <div className="rounded-xl bg-white border border-slate-200 p-2.5 shrink-0">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-white rounded-lg transition"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
