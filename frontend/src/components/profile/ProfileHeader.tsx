import React, { useState } from 'react';
import { ProfileData } from '../../api/profileApi';
import {
  User,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Key,
} from 'lucide-react';

interface Props {
  profile: ProfileData;
  onUpdateImage: (url: string) => void;
}

export const ProfileHeader: React.FC<Props> = ({ profile, onUpdateImage }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Operations HQ Admin',
          bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
        };
      case 'DELIVERY_AGENT':
        return {
          label: 'Verified Driver Partner',
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          label: 'Customer Account',
          bg: 'bg-blue-500/10 text-blue-700 border-blue-200',
        };
    }
  };

  const badge = getRoleBadge(profile.role);

  const handleSavePhoto = () => {
    if (photoUrlInput.trim()) {
      onUpdateImage(photoUrlInput.trim());
      setShowPhotoModal(false);
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = () => {
    onUpdateImage('');
    setShowPhotoModal(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar Container with Upload overlay */}
          <div className="relative group">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.fullName}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-2xl font-black text-white shadow-md">
                {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg hover:bg-indigo-600 transition"
              title="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{profile.fullName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                {badge.label}
              </span>
            </div>

            <p className="text-sm text-slate-500 font-medium">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Email Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                Status: <strong className="text-emerald-600">{profile.status}</strong>
              </span>
              {profile.city && (
                <>
                  <span>•</span>
                  <span>{profile.city}, {profile.state || 'India'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action / ID Badge */}
        <div className="flex flex-col items-center sm:items-end justify-center rounded-xl bg-slate-50 p-4 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account ID</span>
          <span className="font-mono text-sm font-bold text-slate-800">#UID-{profile.id}</span>
          <span className="text-[11px] text-slate-400 mt-1">
            Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Photo URL Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Update Profile Avatar</h3>
            <p className="text-xs text-slate-500">
              Enter a direct image URL (PNG, JPG, WEBP) to update your profile photo across all GATIMAN portals.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {profile.profileImageUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  Remove Picture
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePhoto}
                  disabled={!photoUrlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-500 disabled:opacity-50"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
