import React, { useState } from 'react';
import { NotificationPreferences } from '../../api/profileApi';
import { Bell, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  preferences?: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => Promise<any>;
  isLoading: boolean;
}

export const NotificationPreferencesSection: React.FC<Props> = ({ preferences, onSave, isLoading }) => {
  const [formData, setFormData] = useState<NotificationPreferences>({
    orderUpdates: preferences?.orderUpdates ?? true,
    deliveryUpdates: preferences?.deliveryUpdates ?? true,
    rescheduleUpdates: preferences?.rescheduleUpdates ?? true,
    securityAlerts: true,
    marketing: preferences?.marketing ?? false,
    language: preferences?.language ?? 'en',
    timezone: preferences?.timezone ?? 'Asia/Kolkata',
    dateFormat: preferences?.dateFormat ?? 'DD/MM/YYYY',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (key === 'securityAlerts') return; // Mandatory
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
      setSuccessMsg('Notification preferences updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update preferences.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600" />
          Notification Channels & Alert Rules
        </h2>
        <p className="text-xs text-slate-500">Configure email and in-app alerts for shipments and critical events</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {/* Order Updates */}
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Order Creation & Booking Confirmations</p>
            <p className="text-xs text-slate-500">Receive alerts when new deliveries are booked or registered</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('orderUpdates')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.orderUpdates ? 'bg-orange-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.orderUpdates ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Delivery Updates */}
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Live Delivery State Milestones</p>
            <p className="text-xs text-slate-500">Real-time alerts for PICKED_UP, IN_TRANSIT, and DELIVERED states</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('deliveryUpdates')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.deliveryUpdates ? 'bg-orange-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.deliveryUpdates ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reschedule Updates */}
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Rescheduling & Slot Confirmations</p>
            <p className="text-xs text-slate-500">Alerts when a delivery attempt fails and new delivery date is scheduled</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('rescheduleUpdates')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.rescheduleUpdates ? 'bg-orange-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.rescheduleUpdates ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Security Alerts - Mandatory */}
        <div className="flex items-center justify-between py-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">Security & Authentication Alerts</p>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                Mandatory
              </span>
            </div>
            <p className="text-xs text-slate-500">Password changes, new logins, and critical system policy updates</p>
          </div>
          <div className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-orange-600 opacity-60 cursor-not-allowed">
            <span className="inline-block h-5 w-5 transform translate-x-5 rounded-full bg-white shadow" />
          </div>
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Promotions & Network Announcements</p>
            <p className="text-xs text-slate-500">Service route updates, discount rate cards, and product announcements</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('marketing')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.marketing ? 'bg-orange-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.marketing ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow hover:bg-orange-500 disabled:opacity-50 transition"
        >
          {isLoading ? 'Saving Preferences...' : 'Save Notification Preferences'}
        </button>
      </div>
    </div>
  );
};
