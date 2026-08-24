import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Map,
  CreditCard,
  BarChart3,
  CalendarClock,
  ShieldCheck,
  Activity,
  Bell,
  Mail,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { NotificationBell } from '../components/common/NotificationBell';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const navSections = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Orders Dispatch', href: '/admin/orders', icon: Package },
        { name: 'Fleet / Agents', href: '/admin/agents', icon: Truck },
        { name: 'Customers', href: '/admin/customers', icon: Users },
      ],
    },
    {
      title: 'Logistics Hub',
      items: [
        { name: 'Reschedule Queue', href: '/admin/reschedules', icon: CalendarClock },
        { name: 'Zones & Hubs', href: '/admin/zones', icon: Map },
        { name: 'Rate Cards', href: '/admin/rate-cards', icon: CreditCard },
        { name: 'Email Monitor', href: '/admin/emails', icon: Mail },
      ],
    },
    {
      title: 'System & Analytics',
      items: [
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
        { name: 'System Health', href: '/admin/system-health', icon: Activity },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="GATIMAN" className="h-8 w-8 object-contain" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">GATIMAN</span>
              <span className="ml-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                OPS HQ
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <nav className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-50 font-bold text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <Link to="/admin/profile" className="flex items-center gap-3 overflow-hidden group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white shadow-sm group-hover:ring-2 ring-indigo-500 transition">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600">GATIMAN Dispatch Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Navbar Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300 transition shadow-2xs cursor-pointer shrink-0"
              title="Refresh live data"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <NotificationBell />
          </div>
        </header>

        {/* Page Viewport */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
