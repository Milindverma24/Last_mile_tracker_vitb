import React from 'react';
import { LiveTrackingData } from '../../api/trackingApi';
import { ConnectionState } from '../../hooks/useLiveTracking';
import {
  Truck,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  trackingData: LiveTrackingData;
  connectionState: ConnectionState;
}

export const LiveTrackingStatusCard: React.FC<Props> = ({ trackingData, connectionState }) => {
  const {
    status,
    deliveryPartner,
    distanceRemaining,
    etaMinutes,
    expectedArrival,
    nearDestination,
    lastUpdated,
  } = trackingData;

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', isDone: true },
    {
      key: 'PICKED_UP',
      label: 'Picked Up',
      isDone: status === 'PICKED_UP' || status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED',
    },
    {
      key: 'ON_THE_WAY',
      label: 'On The Way',
      isDone: status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED',
    },
    {
      key: 'NEAR_YOU',
      label: 'Near You',
      isDone: nearDestination || status === 'DELIVERED',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      isDone: status === 'DELIVERED',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header with Live Status & Connection Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  connectionState === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  connectionState === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {status === 'DELIVERED'
                ? 'Package Delivered Successfully'
                : nearDestination
                ? 'Delivery Partner is Near You!'
                : status === 'OUT_FOR_DELIVERY' || status === 'IN_TRANSIT'
                ? 'Delivery Partner is On The Way'
                : status === 'PICKED_UP'
                ? 'Package Picked Up'
                : 'Delivery Partner Assigned'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {status === 'DELIVERED'
              ? 'Handed over to recipient'
              : `Tracking shipment ${trackingData.trackingNumber}`}
          </p>
        </div>

        {/* Live WebSocket Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
              connectionState === 'CONNECTED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : connectionState === 'RECONNECTING'
                ? 'border-amber-200 bg-amber-50 text-amber-700 animate-pulse'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {connectionState === 'CONNECTED' ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span>
              {connectionState === 'CONNECTED'
                ? 'LIVE TELEMETRY'
                : connectionState === 'RECONNECTING'
                ? 'Reconnecting...'
                : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics: Distance & ETA */}
      {status !== 'DELIVERED' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Navigation className="h-3.5 w-3.5 text-indigo-600" />
              <span>Distance</span>
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900">{distanceRemaining} km</p>
            <p className="text-[11px] text-slate-500">Remaining to destination</p>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span>Estimated Time</span>
            </div>
            <p className="mt-1 text-2xl font-black text-indigo-900">{etaMinutes} mins</p>
            <p className="text-[11px] text-indigo-600 font-medium">Expected ~{expectedArrival}</p>
          </div>

          <div className="hidden sm:block rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Live Status</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900 truncate">
              {nearDestination ? 'Arriving Now' : status.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-slate-400">
              Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      )}

      {/* 5-Step Delivery Lifecycle Tracker */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Delivery Lifecycle Progress
        </h3>
        <div className="grid grid-cols-5 gap-1.5">
          {steps.map((s, idx) => (
            <div key={s.key} className="text-center space-y-1.5">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.isDone ? 'bg-emerald-500 shadow-sm' : 'bg-slate-200'
                }`}
              />
              <p
                className={`text-[11px] font-semibold truncate ${
                  s.isDone ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Partner Contact Card */}
      {deliveryPartner && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm shadow-sm">
              {deliveryPartner.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Partner</p>
              <h4 className="text-sm font-bold text-slate-900">{deliveryPartner.name}</h4>
              <p className="text-xs font-mono text-slate-500">
                {deliveryPartner.vehicleType} • {deliveryPartner.vehicleNumber}
              </p>
            </div>
          </div>

          {deliveryPartner.phoneNumber && (
            <a
              href={`tel:${deliveryPartner.phoneNumber}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call Partner</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
