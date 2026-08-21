import React from 'react';
import { Settings, Shield, Server, Bell } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System & Dispatch Settings</h1>
        <p className="text-sm text-slate-500">Platform operational thresholds, CORS policies, and dispatch engine tuning</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Volumetric Divisor Constant</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard commercial divisor used for volumetric weight calculation: <strong>5000 cm³/kg</strong>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Maximum Driver Capacity Limit</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Default concurrent order ceiling per delivery agent: <strong>5 active parcels</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
