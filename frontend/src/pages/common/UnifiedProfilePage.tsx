import React, { useState } from 'react';
import { useProfile, useProfileMutations } from '../../hooks/useProfile';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { PersonalInformationSection } from '../../components/profile/PersonalInformationSection';
import { AccountInformationSection } from '../../components/profile/AccountInformationSection';
import { SecuritySection } from '../../components/profile/SecuritySection';
import { NotificationPreferencesSection } from '../../components/profile/NotificationPreferencesSection';
import { UserPreferencesSection } from '../../components/profile/UserPreferencesSection';
import { AgentProfessionalSection } from '../../components/profile/AgentProfessionalSection';
import { AdminInformationSection } from '../../components/profile/AdminInformationSection';
import { DangerZoneSection } from '../../components/profile/DangerZoneSection';
import {
  User,
  ShieldCheck,
  KeyRound,
  Bell,
  Globe,
  Truck,
  Building,
  RefreshCw,
} from 'lucide-react';

export const UnifiedProfilePage: React.FC = () => {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const {
    updateProfileAsync,
    isUpdatingProfile,
    changePasswordAsync,
    isChangingPassword,
    updatePreferencesAsync,
    isUpdatingPreferences,
    toggleAvailabilityAsync,
    isTogglingAvailability,
  } = useProfileMutations();

  const [activeTab, setActiveTab] = useState<string>('personal');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-32 w-full rounded-2xl bg-slate-200 animate-pulse" />
        <div className="h-64 w-full rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-800">Failed to load user profile.</p>
        <p className="text-xs text-slate-500 mt-1">Please ensure you are authenticated and retry.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-500"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', name: 'Personal Details', icon: User },
    ...(profile.role === 'DELIVERY_AGENT'
      ? [{ id: 'professional', name: 'Professional Fleet', icon: Truck }]
      : []),
    ...(profile.role === 'ADMIN'
      ? [{ id: 'administrative', name: 'Administrative Privileges', icon: ShieldCheck }]
      : []),
    { id: 'account', name: 'Account Info', icon: ShieldCheck },
    { id: 'security', name: 'Security & Password', icon: KeyRound },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

  const handleUpdateImage = async (url: string) => {
    await updateProfileAsync({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pinCode: profile.pinCode,
      profileImageUrl: url,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header Card */}
      <ProfileHeader profile={profile} onUpdateImage={handleUpdateImage} />

      {/* Tabs Navigation Bar */}
      <div className="flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Active Tab Viewport */}
      <div className="space-y-6">
        {activeTab === 'personal' && (
          <PersonalInformationSection
            profile={profile}
            onSave={updateProfileAsync}
            isLoading={isUpdatingProfile}
          />
        )}

        {activeTab === 'professional' && profile.role === 'DELIVERY_AGENT' && (
          <AgentProfessionalSection
            agentInfo={profile.agentInfo}
            onToggleAvailability={toggleAvailabilityAsync}
            isLoading={isTogglingAvailability}
          />
        )}

        {activeTab === 'administrative' && profile.role === 'ADMIN' && (
          <AdminInformationSection adminInfo={profile.adminInfo} />
        )}

        {activeTab === 'account' && <AccountInformationSection profile={profile} />}

        {activeTab === 'security' && (
          <SecuritySection
            onChangePassword={changePasswordAsync}
            isLoading={isChangingPassword}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationPreferencesSection
            preferences={profile.preferences}
            onSave={updatePreferencesAsync}
            isLoading={isUpdatingPreferences}
          />
        )}

        {activeTab === 'preferences' && (
          <UserPreferencesSection
            preferences={profile.preferences}
            onSave={updatePreferencesAsync}
            isLoading={isUpdatingPreferences}
          />
        )}

        {/* Global Danger Zone at bottom */}
        <DangerZoneSection />
      </div>
    </div>
  );
};
