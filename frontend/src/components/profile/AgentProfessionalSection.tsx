import React, { useState } from 'react';
import { AgentProfileInfo } from '../../api/profileApi';
import {
  Truck,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  Activity,
} from 'lucide-react';

interface Props {
  agentInfo?: AgentProfileInfo;
  onToggleAvailability: (available: boolean) => Promise<any>;
  isLoading: boolean;
}

export const AgentProfessionalSection: React.FC<Props> = ({
  agentInfo,
  onToggleAvailability,
  isLoading,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!agentInfo) return null;

  const handleAvailabilityToggle = async () => {
    try {
      await onToggleAvailability(!agentInfo.isAvailable);
      setSuccessMsg(
        `Duty status updated to: ${!agentInfo.isAvailable ? 'ON DUTY (Accepting Dispatches)' : 'OFF DUTY (Paused)'}`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            Professional Fleet Credentials & Duty Status
          </h2>
          <p className="text-xs text-slate-500">Vehicle telemetry, assigned cluster zone, and real-time SLA metrics</p>
        </div>

        {/* On Duty / Off Duty Live Switch */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <span className="text-xs font-bold text-slate-700">Driver Duty:</span>
          <button
            type="button"
            onClick={handleAvailabilityToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              agentInfo.isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                agentInfo.isAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-xs font-black ${
              agentInfo.isAvailable ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {agentInfo.isAvailable ? 'ON DUTY' : 'OFF DUTY'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Driver Performance Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Total Assigned</span>
          <p className="mt-1 text-2xl font-black text-indigo-900">{agentInfo.totalDeliveries}</p>
          <span className="text-[10px] text-slate-400">All-time parcels</span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Delivered</span>
          <p className="mt-1 text-2xl font-black text-emerald-900">{agentInfo.completedDeliveries}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">OTP Confirmed</span>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Failed / Rescheduled</span>
          <p className="mt-1 text-2xl font-black text-rose-900">{agentInfo.failedDeliveries}</p>
          <span className="text-[10px] text-slate-400">Attempt logged</span>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">SLA Success Rate</span>
          <p className="mt-1 text-2xl font-black text-amber-900">{agentInfo.successRate}%</p>
          <span className="text-[10px] text-amber-700 font-semibold">Quality Index</span>
        </div>
      </div>

      {/* Vehicle & Dispatch Specifications */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle Type</span>
          <p className="mt-1 font-bold text-slate-900">{agentInfo.vehicleType}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Vehicle Registration Number
          </span>
          <p className="mt-1 font-mono font-bold text-slate-900">{agentInfo.vehicleNumber}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Hub / Cluster Zone
          </span>
          <p className="mt-1 font-semibold text-slate-900">{agentInfo.assignedZoneName}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Load / Capacity Ceiling
          </span>
          <p className="mt-1 font-semibold text-slate-900">
            <span className="font-bold text-indigo-600">{agentInfo.currentActiveOrders}</span> /{' '}
            {agentInfo.maxActiveOrders} concurrent parcels
          </p>
        </div>
      </div>
    </div>
  );
};
