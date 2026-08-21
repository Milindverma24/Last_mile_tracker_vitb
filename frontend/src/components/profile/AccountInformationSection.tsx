import React from 'react';
import { ProfileData } from '../../api/profileApi';
import { ShieldCheck, Mail, Clock, KeyRound, CheckCircle2, UserCheck } from 'lucide-react';

interface Props {
  profile: ProfileData;
}

export const AccountInformationSection: React.FC<Props> = ({ profile }) => {
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          Account & Authentication Credentials
        </h2>
        <p className="text-xs text-slate-500">System identifier keys, verification flags, and lifecycle history</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System User ID</span>
          <p className="mt-1 font-mono font-bold text-slate-900">#UID-{profile.id}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Global UUID</span>
          <p className="mt-1 font-mono text-xs text-slate-600 truncate">{profile.uuid || 'N/A'}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Email</span>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-semibold text-slate-900">{profile.email}</p>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Platform Role</span>
          <p className="mt-1 font-bold text-indigo-600">{profile.role}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Status</span>
          <p className="mt-1 font-semibold text-emerald-600">● {profile.status || 'ACTIVE'}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Successful Login</span>
          <p className="mt-1 text-xs font-semibold text-slate-700">{formatDate(profile.lastLoginAt)}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Created</span>
          <p className="mt-1 text-xs text-slate-600">{formatDate(profile.createdAt)}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Profile Update</span>
          <p className="mt-1 text-xs text-slate-600">{formatDate(profile.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
};
