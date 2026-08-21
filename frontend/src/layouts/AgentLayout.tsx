import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAgentProfile, useAgentMutations } from '../hooks/useAgents';
import {
  Truck, CheckCircle2, History, User, LogOut, Bell,
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
            <Link to="/agent/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900">GATIMAN</span>
                  <span className="hidden rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700 sm:inline-block">
                    Driver App
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex md:items-center md:gap-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* On/Off Duty toggle */}
            <button
              onClick={() => toggleAvailability.mutate(!isOnline)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition border cursor-pointer ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
              {isOnline ? 'ON DUTY' : 'OFF DUTY'}
            </button>

            <NotificationBell />

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex">
              <Link to="/agent/profile" className="text-right group">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500">Driver Partner</p>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white py-2.5 md:hidden shadow-lg pb-safe">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition ${
                active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
