import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, LogOut, Trash2, X } from 'lucide-react';

export const DangerZoneSection: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeactivate = () => {
    if (confirmInput === 'DEACTIVATE') {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm sm:p-8 space-y-6">
      <div className="border-b border-rose-100 pb-4">
        <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          Account Lifecycle & Session Danger Zone
        </h2>
        <p className="text-xs text-rose-700">Irreversible actions and platform session termination</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900">Sign Out of Current Session</p>
          <p className="text-xs text-slate-500">Terminate your current browser session and invalidate local JWT tokens</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-rose-100">
        <div>
          <p className="text-sm font-bold text-rose-900">Deactivate Platform Account</p>
          <p className="text-xs text-rose-700">
            Pause your account credentials. Note: Historical deliveries, tracking entries, and audit logs will remain archived.
          </p>
        </div>
        <button
          onClick={() => setShowDeactivateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
        >
          <Trash2 className="h-4 w-4" /> Deactivate Account
        </button>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <AlertTriangle className="h-5 w-5" /> Confirm Account Deactivation
              </div>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate your account? Type <strong>DEACTIVATE</strong> in capital letters below to confirm.
            </p>

            <input
              type="text"
              placeholder="Type DEACTIVATE"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full rounded-xl border border-rose-300 px-3.5 py-2 text-sm text-slate-900 focus:border-rose-600 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={confirmInput !== 'DEACTIVATE'}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow hover:bg-rose-700 disabled:opacity-40 transition"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
