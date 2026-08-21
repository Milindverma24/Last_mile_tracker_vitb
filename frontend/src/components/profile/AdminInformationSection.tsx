import React from 'react';
import { Link } from 'react-router-dom';
import { AdminProfileInfo } from '../../api/profileApi';
import { ShieldCheck, Server, Activity, Key, ExternalLink, CheckCircle2 } from 'lucide-react';

interface Props {
  adminInfo?: AdminProfileInfo;
}

export const AdminInformationSection: React.FC<Props> = ({ adminInfo }) => {
  if (!adminInfo) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          Administrative Privileges & Operations Authority
        </h2>
        <p className="text-xs text-slate-500">
          Executive control rights, node access grants, and authoritative dispatch permissions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
          <p className="mt-1 font-bold text-slate-900">{adminInfo.department}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authority Level</span>
          <p className="mt-1 font-bold text-indigo-600">● SuperAdmin Master Role</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total System Audits</span>
          <p className="mt-1 text-xl font-black text-slate-900">{adminInfo.totalSystemAudits} Records</p>
          <Link
            to="/admin/audit-logs"
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Open Audit Trail <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Health Node</span>
          <p className="mt-1 font-bold text-emerald-600">● Healthy (PostgreSQL 15)</p>
          <Link
            to="/admin/system-health"
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View Observability Cockpit <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Granted Security Permissions
        </h3>
        <div className="flex flex-wrap gap-2">
          {adminInfo.permissions?.map((perm) => (
            <span
              key={perm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
