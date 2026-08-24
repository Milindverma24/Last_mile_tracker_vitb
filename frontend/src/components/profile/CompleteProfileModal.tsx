import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import {
  MapPin,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const CompleteProfileModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });

  useEffect(() => {
    if (user) {
      const userKey = user.email || 'user';
      const isCompleted = localStorage.getItem(`gatiman_profile_completed_${userKey}`) === 'true';
      const isSessionSkipped = sessionStorage.getItem(`gatiman_profile_skipped_${userKey}`) === 'true';

      // Check if essential personal info is missing
      const isMissingInfo =
        !user.phoneNumber ||
        user.phoneNumber.trim() === '' ||
        !user.address ||
        user.address.trim() === '';

      if (isMissingInfo && !isCompleted && !isSessionSkipped) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          city: user.city || 'New Delhi',
          state: user.state || 'Delhi',
          pinCode: user.pinCode || '110016',
        });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Primary street address is required.');
      return;
    }
    if (!formData.pinCode.trim() || formData.pinCode.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const userKey = user?.email || 'user';

    try {
      const updated = await profileApi.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || 'New Delhi',
        state: formData.state.trim() || 'Delhi',
        pinCode: formData.pinCode.trim(),
      });

      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phoneNumber: updated.phoneNumber,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        pinCode: updated.pinCode,
      });

      // Mark permanently completed & dismissed in storage
      localStorage.setItem(`gatiman_profile_completed_${userKey}`, 'true');
      localStorage.setItem(`gatiman_profile_dismissed_${userKey}`, 'true');
      sessionStorage.setItem('gatiman_profile_dismissed', 'true');

      setIsOpen(false);
    } catch (err: any) {
      // In case offline or mock fallback, save to local user state and storage
      updateUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || 'New Delhi',
        state: formData.state.trim() || 'Delhi',
        pinCode: formData.pinCode.trim(),
      });
      localStorage.setItem(`gatiman_profile_completed_${userKey}`, 'true');
      localStorage.setItem(`gatiman_profile_dismissed_${userKey}`, 'true');
      sessionStorage.setItem('gatiman_profile_dismissed', 'true');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    const userKey = user?.email || 'user';
    sessionStorage.setItem(`gatiman_profile_skipped_${userKey}`, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Dismiss for now"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Complete Your Personal Details
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Please provide your contact number and primary address coordinates to enable automatic pickup and doorstep delivery.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                First Name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 98111 22233"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
              />
            </div>
          </div>

          {/* Primary Street Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Street Address
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Flat 402, Greenfield Apartments, Ring Road"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
              />
            </div>
          </div>

          {/* City / State / PIN Code */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New Delhi"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Delhi"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Postal PIN
              </label>
              <input
                type="text"
                maxLength={6}
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="110016"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  Save Details <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
