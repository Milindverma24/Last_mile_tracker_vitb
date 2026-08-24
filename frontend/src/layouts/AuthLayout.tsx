import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Gauge, Radio, Zap } from 'lucide-react';
import { GatimanLogo } from '../components/common/GatimanLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. LEFT HERO SIDEBAR (Photorealistic Twilight Hub)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div 
        className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex overflow-hidden bg-cover bg-center border-r border-slate-800"
        style={{ backgroundImage: `url('/images/auth_logistics_hub.jpg')` }}
      >
        {/* Dark Film Grade Backdrop Overlays */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/70" />
        
        {/* Ambient Glows */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-orange-600/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10">
          <div className="inline-block bg-slate-900/85 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-xl">
            <GatimanLogo to="/" textColor="text-white" />
          </div>
        </div>

        {/* Center Hero Message */}
        <div className="relative z-10 space-y-3 my-auto">
          <h2 className="text-3xl lg:text-4xl font-black font-heading tracking-tight text-white leading-tight">
            Intelligent Logistics <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 bg-clip-text text-transparent">
              Built for Speed & Reliability.
            </span>
          </h2>
          <p className="text-sm text-slate-300/90 font-medium max-w-md leading-relaxed">
            Automated express dispatch, real-time GPS telemetry, and OTP-verified doorsteps for modern supply chains.
          </p>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>© 2026 GATIMAN Logistics Platform</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-400" /> Enterprise SLA Protected
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. RIGHT AUTH CONTENT AREA
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col justify-between px-6 py-8 sm:px-12 lg:w-1/2 lg:px-16 min-h-screen">
        
        {/* Top Mobile / Desktop Header with Back Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-orange-300 hover:text-orange-600 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-orange-600" />
            <span>Back to Home</span>
          </Link>

          <div className="lg:hidden">
            <GatimanLogo to="/" />
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

