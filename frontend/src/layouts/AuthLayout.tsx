import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Zap, ShieldCheck, MapPin, Gauge, ArrowLeft, Truck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Branding Hero (Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        {/* Background Image with Dark Gradient Overlay */}
        <img
          src="/auth-bg.jpg"
          alt="GATIMAN Last Mile Delivery Network"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-indigo-950/75 backdrop-blur-[1px]" />
        
        {/* Glow Circles */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">GATIMAN</span>
                <span className="ml-2 rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-400/30">
                  गति से गंतव्य तक
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400 font-medium">
              Intelligent Last-Mile Delivery Management Platform
            </p>
          </div>
        </div>

        {/* Value Prop Highlights */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-500/20 p-2.5 text-indigo-400 border border-indigo-500/30">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Volumetric Pricing Engine</h3>
              <p className="text-sm text-slate-400">
                Transparent billing based on (L × B × H) / 5000 cm³ formula with configurable slabs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-400 border border-blue-500/30">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Proximity Auto-Assignment</h3>
              <p className="text-sm text-slate-400">
                Deterministic driver allocation balancing live GPS coordinates and active capacity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Immutable Event Timeline</h3>
              <p className="text-sm text-slate-400">
                Append-only tracking logs ensuring absolute operational auditability and trust.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 GATIMAN Logistics Inc.</span>
          <span className="flex items-center gap-1.5 font-medium text-indigo-400">
            <Zap className="h-3.5 w-3.5" /> High Velocity Infrastructure
          </span>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex w-full flex-col justify-between px-6 py-8 sm:px-12 lg:w-1/2 lg:px-16 min-h-screen">
        {/* Top Mobile / Right Header with Back Button */}
        <div className="flex items-center justify-between pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-indigo-600" />
            <span>Back to Home</span>
          </Link>

          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Truck className="h-4 w-4" />
            </div>
            <span className="font-black text-slate-900 text-lg">GATIMAN</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="my-auto py-6">
          <Outlet />
        </div>

        {/* Right Footer */}
        <div className="pt-4 text-center text-xs text-slate-400">
          GATIMAN Logistics System · <Link to="/track" className="text-indigo-600 hover:underline font-semibold">Track a Package</Link>
        </div>
      </div>
    </div>
  );
};
