import React, { useState, useRef } from 'react';
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
  Upload,
  Link as LinkIcon,
  Laptop,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
} from 'lucide-react';

interface Props {
  profile: ProfileData;
  onUpdateImage: (url: string) => void;
}

export const ProfileHeader: React.FC<Props> = ({ profile, onUpdateImage }) => {
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeUploadMode, setActiveUploadMode] = useState<'device' | 'url'>('device');
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileSizeInfo, setFileSizeInfo] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File is too large (max 8MB). Please choose a smaller image.');
      return;
    }

    setUploadError(null);
    setSelectedFileName(file.name);
    setFileSizeInfo((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      // Optimize image via Canvas to max 512x512 for instant fast loading
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedData = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedFilePreview(optimizedData);
        } else {
          setSelectedFilePreview(rawDataUrl);
        }
      };
      img.onerror = () => {
        setSelectedFilePreview(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSavePhoto = async () => {
    setIsSaving(true);
    try {
      if (activeUploadMode === 'device' && selectedFilePreview) {
        await onUpdateImage(selectedFilePreview);
        handleCloseModal();
      } else if (activeUploadMode === 'url' && photoUrlInput.trim()) {
        await onUpdateImage(photoUrlInput.trim());
        handleCloseModal();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsSaving(true);
    try {
      await onUpdateImage('');
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowPhotoModal(false);
    setSelectedFilePreview(null);
    setSelectedFileName('');
    setFileSizeInfo('');
    setUploadError(null);
    setPhotoUrlInput('');
    setIsDragging(false);
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
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg hover:bg-indigo-600 transition cursor-pointer"
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

      {/* Avatar Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Profile Avatar</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a photo from your laptop or paste an image URL.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveUploadMode('device')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeUploadMode === 'device'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="h-4 w-4" />
                Upload from Laptop
              </button>
              <button
                type="button"
                onClick={() => setActiveUploadMode('url')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeUploadMode === 'url'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                Image URL
              </button>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* Mode 1: Device / Laptop Upload */}
            {activeUploadMode === 'device' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  className="hidden"
                />

                {selectedFilePreview ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
                    <img
                      src={selectedFilePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-xl object-cover border-2 border-indigo-600 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{selectedFileName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{fileSizeInfo} · Ready to save</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-1 cursor-pointer"
                      >
                        Choose different photo
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFilePreview(null);
                        setSelectedFileName('');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-rose-600 transition"
                      title="Clear selection"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition cursor-pointer ${
                      isDragging
                        ? 'border-indigo-600 bg-indigo-50/60'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 mb-3 text-indigo-600">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 text-center">
                      Click to choose image or drag & drop here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 text-center">
                      Supports PNG, JPG, WEBP or GIF (up to 8MB)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Direct Image URL */}
            {activeUploadMode === 'url' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Direct Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition font-mono"
                  />
                </div>

                {photoUrlInput.trim() && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={photoUrlInput}
                      alt="URL Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-300 bg-white"
                    />
                    <div className="text-xs text-slate-600 truncate">
                      <span className="font-bold text-slate-800 block">Preview</span>
                      {photoUrlInput}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {profile.profileImageUrl ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Current Photo
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={
                    isSaving ||
                    (activeUploadMode === 'device' && !selectedFilePreview) ||
                    (activeUploadMode === 'url' && !photoUrlInput.trim())
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-500 disabled:opacity-40 transition cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Avatar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
