import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GatimanLogo } from '../components/common/GatimanLogo';
import {
  Truck,
  Search,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Navigation,
  Shield,
  Zap,
  Phone,
  Mail,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'DELIVERY_AGENT': return '/agent/dashboard';
      default: return '/customer/dashboard';
    }
  };

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Services', href: '/#services' },
    { name: 'Live Radar', href: '/#tracking' },
    { name: 'Network Stats', href: '/#stats' },
    { name: 'FAQ', href: '/#faq' },
  ];

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(elementId);
        if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }
    }
    navigate(href);
  };

  // If on landing page, let LandingPage render its full standalone hero & header without double navbar
  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 flex flex-col font-sans">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sticky Navbar for Sub-Pages */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'bg-white border-b border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <GatimanLogo to="/" />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="px-3.5 py-2 rounded-full hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/track"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition"
              >
                <Search className="h-3.5 w-3.5 text-orange-500" />
                <span>Track Radar</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-orange-400" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition">
                    Login
                  </Link>
                  <Link
                    to="/register/driver"
                    className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <span>Drive & Earn</span>
                  </Link>
                  <Link
                    to="/register/customer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-orange-700 hover:to-orange-600 transition"
                  >
                    <span>Send Parcel</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <Link to="/track" className="p-2 rounded-full border border-slate-200 text-slate-600 hover:text-orange-600 transition">
                <Navigation className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition text-left"
                >
                  <span>{link.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 text-orange-400" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-2 text-xs font-bold text-slate-600"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="flex items-center justify-center rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center justify-center gap-1.5 rounded-full bg-orange-600 py-2.5 text-xs font-bold text-white">
                    Book Dispatch <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};


