import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Search,
  Menu,
  X,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  User,
  LogOut,
  LayoutDashboard,
  Zap,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DELIVERY_AGENT':
        return '/agent/dashboard';
      case 'CUSTOMER':
      default:
        return '/customer/dashboard';
    }
  };

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Track Delivery', href: '/track' },
    { name: 'Services', href: '/#services' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/#about' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Alert / Announcement */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 px-4 py-2 text-center text-xs font-semibold text-indigo-100 border-b border-indigo-500/20 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Delhi NCR Real-Time GPS Tracking Network is Live</span>
        <span className="hidden sm:inline text-indigo-300">•</span>
        <span className="hidden sm:inline text-indigo-200">Instant Telemetry & Razorpay Integrated</span>
      </div>

      {/* Sticky Glassmorphic Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-white">GATIMAN</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-indigo-400 border border-indigo-500/30">
                    Live
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
                  Last-Mile Delivery Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    location.pathname === link.href
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Desktop Right Actions (Auth State Dependent) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/track"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-indigo-500/50 hover:text-white hover:bg-slate-800 transition"
              >
                <Search className="h-3.5 w-3.5 text-indigo-400" />
                <span>Track ID</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                to="/track"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400"
              >
                <Search className="h-4 w-4" />
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800/80 pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard ({user?.role})</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-400"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Public Page Content Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Multi-Column Commercial Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 pt-16 pb-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {/* Column 1: Brand & Tagline */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">GATIMAN</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Next-generation intelligent last-mile logistics engine. Real-time GPS telemetry, dynamic AI-calculated ETAs, automated zone pricing, and Razorpay-powered instant payments.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>All Telemetry Systems & Dispatches Operational</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/track" className="hover:text-white transition">Track Delivery</Link></li>
                <li><Link to="/#features" className="hover:text-white transition">Live Telemetry</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-white transition">How It Works</Link></li>
                <li><Link to="/#services" className="hover:text-white transition">Express Delivery</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Driver Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/#about" className="hover:text-white transition">About GATIMAN</Link></li>
                <li><a href="#services" className="hover:text-white transition">Delhi NCR Hubs</a></li>
                <li><a href="#about" className="hover:text-white transition">Fleet Network</a></li>
                <li><a href="#about" className="hover:text-white transition">Sustainability</a></li>
                <li><Link to="/login" className="hover:text-white transition">Partner With Us</Link></li>
              </ul>
            </div>

            {/* Column 4: Support & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Support & Legal</h4>
              <ul className="space-y-2">
                <li><a href="#faq" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#faq" className="hover:text-white transition">Report Issue</a></li>
                <li><a href="#legal" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#legal" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#legal" className="hover:text-white transition">Security Audit</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright and Legal Bar */}
          <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} GATIMAN Logistics Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Delhi • Gurugram • Noida • Faridabad • Ghaziabad</span>
              <span>•</span>
              <span className="font-mono text-slate-400">v2.4.0-PROD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
