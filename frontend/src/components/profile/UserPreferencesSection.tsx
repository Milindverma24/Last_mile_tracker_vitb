import React, { useState } from 'react';
import { NotificationPreferences } from '../../api/profileApi';
import { Globe, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  preferences?: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => Promise<any>;
  isLoading: boolean;
}

export const UserPreferencesSection: React.FC<Props> = ({ preferences, onSave, isLoading }) => {
  const [formData, setFormData] = useState<NotificationPreferences>({
    language: preferences?.language ?? 'en',
    timezone: preferences?.timezone ?? 'Asia/Kolkata',
    dateFormat: preferences?.dateFormat ?? 'DD/MM/YYYY',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        ...preferences,
        ...formData,
      });
      setSuccessMsg('Localization & display preferences saved.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save preferences.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-600" />
          Localization & Display Preferences
        </h2>
        <p className="text-xs text-slate-500">Configure language, time standard, and date formats</p>
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

      <form onSubmit={handleSave} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Display Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
          >
            <option value="en">English (Default)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Operational Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
          >
            <option value="Asia/Kolkata">India Standard Time (IST - UTC+05:30)</option>
            <option value="UTC">Coordinated Universal Time (UTC)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Date Format
          </label>
          <select
            value={formData.dateFormat}
            onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 20/08/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-20)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/20/2026)</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow hover:bg-orange-500 disabled:opacity-50 transition"
          >
            {isLoading ? 'Saving Preferences...' : 'Save Display Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
