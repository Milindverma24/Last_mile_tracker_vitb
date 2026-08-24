import React, { useState } from 'react';
import { ProfileData, UpdateProfilePayload } from '../../api/profileApi';
import {
  User,
  Phone,
  MapPin,
  Building,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  profile: ProfileData;
  onSave: (payload: UpdateProfilePayload) => Promise<any>;
  isLoading: boolean;
}

export const PersonalInformationSection: React.FC<Props> = ({ profile, onSave, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phoneNumber: profile.phoneNumber || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    pinCode: profile.pinCode || '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEditClick = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      pinCode: profile.pinCode || '',
    });
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }

    if (formData.phoneNumber && !/^[0-9+ -]{8,15}$/.test(formData.phoneNumber)) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    if (formData.pinCode && !/^[0-9]{6}$/.test(formData.pinCode)) {
      setErrorMsg('PIN code must be a 6-digit number.');
      return;
    }

    setErrorMsg(null);
    try {
      await onSave({
        ...formData,
        profileImageUrl: profile.profileImageUrl,
      });
      setIsEditing(false);
      setSuccessMsg('Profile information updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile information.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-orange-600" />
            Personal Information
          </h2>
          <p className="text-xs text-slate-500">Contact coordinates and primary delivery address</p>
        </div>

        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500" /> Edit Profile
          </button>
        )}
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

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98111 22233"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              placeholder="e.g. 42, Hauz Khas Village, Near Deer Park"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. New Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                placeholder="e.g. 110016"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow hover:bg-orange-500 disabled:opacity-50 transition"
            >
              <Check className="h-3.5 w-3.5" />
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
            <p className="mt-1 font-semibold text-slate-900">{profile.fullName || 'Not specified'}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
            <p className="mt-1 font-semibold text-slate-900">{profile.phoneNumber || '+91 Not configured'}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Street Address</span>
            <p className="mt-1 font-medium text-slate-800">
              {profile.address || 'No street address on file. Click Edit to add address details.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City / State</span>
            <p className="mt-1 font-semibold text-slate-900">
              {profile.city ? `${profile.city}, ${profile.state || 'India'}` : 'Not configured'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logistics Postal PIN</span>
            <p className="mt-1 font-mono font-bold text-slate-900">{profile.pinCode || '110016'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
