import React from 'react';
import { useAgents } from '../../hooks/useAgents';
import { Truck, ShieldCheck, Phone, MapPin, Gauge } from 'lucide-react';

export const AdminAgentsPage: React.FC = () => {
  const { data: agents = [], isLoading } = useAgents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fleet & Delivery Partners</h1>
        <p className="text-sm text-slate-500">Active fleet driver capacity, live telemetry, and zone assignments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{agent.name}</h3>
                  <p className="text-xs text-slate-400">{agent.email}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  agent.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {agent.isAvailable ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-semibold text-slate-900">{agent.vehicleNumber} ({agent.vehicleType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Hub:</span>
                <span className="font-semibold text-slate-900">{agent.assignedZoneName || 'South Delhi'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Load Quota:</span>
                <span className="font-bold text-indigo-600">{agent.currentActiveOrders} / {agent.maxActiveOrders} active</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
