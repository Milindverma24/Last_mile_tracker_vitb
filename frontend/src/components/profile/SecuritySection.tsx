import React, { useState } from 'react';
import { ChangePasswordPayload } from '../../api/profileApi';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  onChangePassword: (payload: ChangePasswordPayload) => Promise<any>;
  isLoading: boolean;
}

export const SecuritySection: React.FC<Props> = ({ onChangePassword, isLoading }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMsg('Current password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('New password must be different from current password.');
      return;
    }

    setErrorMsg(null);
    try {
      await onChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Password updated successfully. All security audit logs updated.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-orange-600" />
          Security Credentials & Password Management
        </h2>
        <p className="text-xs text-slate-500">Update account password and review authentication policies</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 pr-10 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            New Password
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Confirm New Password
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
            required
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            <li>Minimum 6 characters in length</li>
            <li>Different from your previous password</li>
            <li>Encrypted with BCrypt hashing before database persistence</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow hover:bg-orange-500 disabled:opacity-50 transition"
          >
            <Lock className="h-3.5 w-3.5" />
            {isLoading ? 'Updating Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};
