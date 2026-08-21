import React from 'react';
import { Outlet } from 'react-router-dom';
import { Zap, ShieldCheck, MapPin, Gauge } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Branding Hero (Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-12 text-white lg:flex">
        {/* Glow Circles */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GATIMAN Logo" className="h-10 w-10 object-contain drop-shadow" />
            <div>
              <span className="text-2xl font-black tracking-tight text-white">GATIMAN</span>
              <span className="ml-2 rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                गति से गंतव्य तक
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Intelligent Last-Mile Delivery Management Platform
          </p>
        </div>

        {/* Value Prop Highlights */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-500/20 p-2.5 text-indigo-400">
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
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-400">
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
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
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
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <Outlet />
      </div>
    </div>
  );
};
