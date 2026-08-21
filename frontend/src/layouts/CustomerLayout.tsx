import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PackagePlus, Package, CalendarClock, User, LogOut, Menu, X, Truck,
} from 'lucide-react';
import { NotificationBell } from '../components/common/NotificationBell';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Book Delivery', href: '/customer/orders/create', icon: PackagePlus },
    { name: 'My Orders', href: '/customer/orders', icon: Package },
    { name: 'Reschedule', href: '/customer/reschedule', icon: CalendarClock },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ];

  const mobileNav = [
    { name: 'Home', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Book', href: '/customer/orders/create', icon: PackagePlus },
    { name: 'Orders', href: '/customer/orders', icon: Package },
    { name: 'Reschedule', href: '/customer/reschedule', icon: CalendarClock },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (href: string) => location.pathname === href || (href !== '/customer/dashboard' && location.pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/customer/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Truck className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">GATIMAN</span>
                <span className="hidden rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 sm:inline-block border border-indigo-100">
                  Customer
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex lg:items-center lg:gap-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/customer/orders/create"
              className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition shrink-0"
            >
              <PackagePlus className="h-4 w-4" />
              <span>New Order</span>
            </Link>

            <NotificationBell />

            <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <Link to="/customer/profile" className="flex items-center gap-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-sm group-hover:ring-2 ring-indigo-400 transition shrink-0">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="text-left hidden md:block max-w-[130px]">
                  <p className="truncate text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-[10px] text-slate-400 font-medium leading-tight">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/customer/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-30 bg-white border-t border-slate-200 shadow-lg pb-safe">
        <div className="flex items-center justify-around py-2">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition ${
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
    </div>
  );
};
