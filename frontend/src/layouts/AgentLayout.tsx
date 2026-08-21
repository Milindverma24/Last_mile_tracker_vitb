import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAgentProfile, useAgentMutations } from '../hooks/useAgents';
import {
  Truck,
  CheckCircle2,
  History,
  User,
  LogOut,
  Bell,
} from 'lucide-react';
import { NotificationBell } from '../components/common/NotificationBell';

export const AgentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: agentProfile } = useAgentProfile();
  const { toggleAvailability } = useAgentMutations();

  const isOnline = agentProfile?.isAvailable ?? true;

  const navigation = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: Truck },
    { name: 'Deliveries', href: '/agent/deliveries', icon: CheckCircle2 },
    { name: 'History', href: '/agent/history', icon: History },
    { name: 'Profile', href: '/agent/profile', icon: User },
    { name: 'Notifications', href: '/agent/notifications', icon: Bell },
  ];

  const handleToggleDuty = () => {
    toggleAvailability.mutate(!isOnline);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 md:pb-8">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-slate-900 text-white shadow">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/agent/dashboard" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="GATIMAN" className="h-8 w-8 object-contain" />
              <div>
                <span className="text-xl font-black tracking-tight text-white">GATIMAN</span>
                <span className="ml-2 rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                  Agent App
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-800 text-indigo-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleDuty}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {isOnline ? 'ON DUTY' : 'OFF DUTY'}
            </button>

            {/* Notification Bell */}
            <NotificationBell isDarkNav={true} />

            <div className="hidden items-center gap-3 border-l border-slate-700 pl-3 sm:flex">
              <Link to="/agent/profile" className="text-right group">
                <p className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400">Driver Partner</p>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Agent Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white py-2.5 md:hidden">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
