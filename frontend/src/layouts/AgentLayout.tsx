import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useAgentProfile, useAgentMutations } from '../hooks/useAgents';
import { GatimanLogo } from '../components/common/GatimanLogo';
import {
  Truck, CheckCircle2, History, User, LogOut, Bell, RefreshCw,
} from 'lucide-react';
import { NotificationBell } from '../components/common/NotificationBell';
import { CompleteProfileModal } from '../components/profile/CompleteProfileModal';

export const AgentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
  };
  const { data: agentProfile } = useAgentProfile();
  const { toggleAvailability } = useAgentMutations();

  const isOnline = agentProfile?.isAvailable ?? true;

  const navigation = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: Truck },
    { name: 'Deliveries', href: '/agent/deliveries', icon: CheckCircle2 },
    { name: 'History', href: '/agent/history', icon: History },
    { name: 'Profile', href: '/agent/profile', icon: User },
    { name: 'Alerts', href: '/agent/notifications', icon: Bell },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <GatimanLogo to="/agent/dashboard" />
              <span className="hidden rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:inline-block">
                Fleet Driver App
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* On/Off Duty toggle */}
            <button
              onClick={() => toggleAvailability.mutate(!isOnline)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition border cursor-pointer ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isOnline ? 'ON DUTY' : 'OFF DUTY'}</span>
            </button>

            {/* Navbar Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition shadow-2xs cursor-pointer shrink-0"
              title="Refresh live data"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Universal Logout Button */}
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs cursor-pointer shrink-0"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white shadow-lg md:hidden">
        <div className="grid grid-cols-5 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 py-1 text-[10px] font-semibold transition ${
                  active ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile Completion Onboarding Modal */}
      <CompleteProfileModal />
    </div>
  );
};
