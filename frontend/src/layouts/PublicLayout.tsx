import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    { name: 'Home', href: '/#hero' },
    { name: 'Track Delivery', href: '/track' },
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

  const isLinkActive = (href: string) => href === '/track' && location.pathname === '/track';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm group-hover:bg-indigo-700 transition">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900">GATIMAN</span>
                  <span className="hidden sm:inline-block rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">LIVE</span>
                </div>
                <div className="hidden sm:block text-[10px] text-slate-500 font-medium leading-none">Last-Mile Delivery</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    isLinkActive(link.href)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/track"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                <Search className="h-4 w-4" />
                <span>Track</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <Link to="/track" className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 transition">
                <Navigation className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 transition"
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
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition text-left"
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="flex items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
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

