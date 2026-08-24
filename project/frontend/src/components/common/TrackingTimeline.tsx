import React from 'react';
import { TrackingEvent, OrderStatus } from '../../types';
import { STATUS_CONFIG, formatDate } from '../../utils/formatters';
import { CheckCircle2, Clock, Truck, Package, XCircle, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: OrderStatus;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events, currentStatus }) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime()
  );

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'CREATED':
        return <Package className="w-4 h-4" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4" />;
      case 'PICKED_UP':
        return <Package className="w-4 h-4" />;
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'RESCHEDULED':
        return <RefreshCw className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {sortedEvents.map((evt, idx) => {
        const isLatest = idx === sortedEvents.length - 1;
        const config = STATUS_CONFIG[evt.newStatus] || STATUS_CONFIG.CREATED;

        return (
          <div key={evt.id || idx} className="relative flex items-start gap-4 group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white transition-transform duration-200 group-hover:scale-125 shadow-sm ${
                isLatest
                  ? `${config.border} ring-4 ring-brand-100 ${config.text}`
                  : 'border-slate-300 text-slate-500'
              }`}
            >
              {getStatusIcon(evt.newStatus)}
            </div>

            {/* Event Content Card */}
            <div
              className={`flex-1 p-4 rounded-2xl border transition-all duration-200 ${
                isLatest
                  ? 'bg-white border-brand-200 shadow-md shadow-brand-500/5'
                  : 'bg-slate-50/70 border-slate-200/70 hover:bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{config.label}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {evt.actorRole}
                  </span>
                  {evt.deliveryAttemptId && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Attempt #{evt.deliveryAttemptId}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(evt.eventTimestamp)}
                </span>
              </div>

              {evt.remarks && (
                <p className="text-xs text-slate-600 leading-relaxed font-normal mt-1">
                  {evt.remarks}
                </p>
              )}

              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span>Recorded by:</span>
                <span className="font-semibold text-slate-600">{evt.actorName}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
