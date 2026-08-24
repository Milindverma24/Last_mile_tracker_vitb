import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Zap, ShieldCheck, MapPin, Gauge, ArrowLeft, Radio, Package, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. LEFT BRANDING HERO (Cinematic Logistics Hub on Desktop)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex border-r border-slate-800">
        
        {/* Cinematic Background Image */}
        <img
          src="/images/auth_logistics_hub.jpg"
          alt="GATIMAN Inter-City Freight Operations Hub"
          className="absolute inset-0 h-full w-full object-cover scale-105 transition duration-1000"
        />
        
        {/* High-tech Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        
        {/* Ambient Glows */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              G
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-white group-hover:text-orange-400 transition">
              gatiman<span className="text-orange-500">.</span>
            </span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Inter-City Freight Network</span>
            </div>
            <p className="text-sm text-slate-300 font-medium max-w-md leading-relaxed">
              Next-generation logistics operating system with real-time GPS telemetry, volumetric rate cards, and automated EV fleet dispatch.
            </p>
          </div>
        </div>

        {/* Value Prop Highlights (Frosted Glass Cards) */}
        <div className="relative z-10 space-y-4 my-auto py-8">
          
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/40 transition">
            <div className="rounded-xl bg-orange-500/20 p-2.5 text-orange-400 border border-orange-500/30 shrink-0">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Volumetric Rate Engine</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Automated formula billing with transparent rate slabs for parcel and cargo shipping.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/40 transition">
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Sub-Second GPS Radar</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Live driver telemetry, route corridor coordinates, and instant countdown ETAs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/40 transition">
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">OTP-Secured Handover</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Immutable audit timeline and secure 4-digit verification for safe doorstep deliveries.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>© 2026 GATIMAN Logistics Platform</span>
          <span className="flex items-center gap-1.5 font-bold text-orange-400">
            <Zap className="h-3.5 w-3.5" /> Express Corridor Transit
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. RIGHT AUTH CONTENT AREA
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col justify-between px-6 py-8 sm:px-12 lg:w-1/2 lg:px-16 min-h-screen">
        
        {/* Top Mobile / Desktop Header with Back Button */}
        <div className="flex items-center justify-between pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-orange-600" />
            <span>Back to Home</span>
          </Link>

          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm">
              G
            </div>
            <span className="font-heading font-black text-lg tracking-tight text-slate-900">
              gatiman<span className="text-orange-600">.</span>
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="my-auto py-6">
          <Outlet />
        </div>

        {/* Right Footer */}
        <div className="pt-4 text-center text-xs text-slate-400">
          GATIMAN Logistics Platform · <Link to="/track" className="text-orange-600 hover:underline font-semibold">Track Live Shipment</Link>
        </div>
      </div>

    </div>
  );
};

