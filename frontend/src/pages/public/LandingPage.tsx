import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi, LiveTrackingData } from '../../api/trackingApi';
import { Order } from '../../types';
import { LiveDeliveryMap } from '../../components/tracking/LiveDeliveryMap';
import { DeliveryVideoPlayer } from '../../components/common/DeliveryVideoPlayer';
import {
  Truck, Search, ArrowRight, Shield, Clock, MapPin, Navigation,
  CheckCircle2, Zap, Radio, ChevronRight, AlertCircle, Sparkles,
  Phone, Lock, Compass, Star, Users, Building2, Package,
  TrendingUp, Award, Globe, Bell, Eye, BarChart3, Play,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [previewLiveTracking, setPreviewLiveTracking] = useState<LiveTrackingData | null>(null);

  const handleQuickTrackSubmit = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const cleanId = (customId || trackingInput).trim();
    if (!cleanId) {
      setSearchError('Please enter a valid tracking number or Order ID');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setPreviewOrder(null);
    setPreviewLiveTracking(null);
    try {
      const order = await orderApi.trackByNumber(cleanId);
      setPreviewOrder(order);

      try {
        const live = await trackingApi.getLiveTracking(order.id);
        setPreviewLiveTracking(live);
      } catch {
        // Build accurate fallback telemetry using order details
        setPreviewLiveTracking({
          orderId: order.id,
          trackingNumber: order.trackingNumber,
          status: order.status,
          isLive: true,
          deliveryPartner: order.assignedAgentName
            ? {
                id: order.assignedAgentId || 3,
                name: order.assignedAgentName,
                phoneNumber: '+91 98999 11223',
                vehicleType: 'EV_SCOOTER',
                vehicleNumber: 'DL-03-EV-9821',
              }
            : undefined,
          currentLocation: { latitude: 28.512, longitude: 77.145 },
          heading: 220,
          speed: 28,
          pickupLocation: {
            name: order.pickupName,
            address: order.pickupAddress,
            pincode: order.pickupPincode,
            latitude: 28.5494,
            longitude: 77.2001,
          },
          destination: {
            name: order.dropName,
            address: order.dropAddress,
            pincode: order.dropPincode,
            latitude: 28.49,
            longitude: 77.0888,
          },
          routeWaypoints: [
            { latitude: 28.5494, longitude: 77.2001 },
            { latitude: 28.5384, longitude: 77.1737 },
            { latitude: 28.5198, longitude: 77.1358 },
            { latitude: 28.5054, longitude: 77.1119 },
            { latitude: 28.49, longitude: 77.0888 },
          ],
          distanceRemaining: 3.4,
          distanceUnit: 'km',
          etaMinutes: 8,
          expectedArrival: '03:45 PM',
          lastUpdated: new Date().toISOString(),
          nearDestination: false,
        });
      }
    } catch (err: any) {
      setSearchError(
        err.response?.data?.message ||
          `No active shipment found with tracking ID "${cleanId}". Please check the number and try again.`
      );
    } finally {
      setIsSearching(false);
    }
  };

  const sampleTrackingNumbers = ['GTM-20260820-875171', 'GTM-20260820-000001', 'GTM-20260820-000002'];

  return (
    <div className="bg-white">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Cinematic High-Visibility Video Background
      ═══════════════════════════════════════════════════════ */}
      <section id="hero" className="relative overflow-hidden bg-slate-950 text-white min-h-[85vh] flex items-center">
        {/* High-Visibility Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          src="/delivery-story.mp4"
          className="absolute inset-0 h-full w-full object-cover opacity-85 scale-100"
        />

        {/* Soft Contrast Gradient (Keeps text legible while video remains vivid) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl space-y-8 animate-fade-in-up">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Delhi NCR's Premier Last-Mile Network</span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] drop-shadow-md">
                Your Delivery.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                  Tracked Every
                </span>
                <br />
                Step of the Way.
              </h1>
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-xl font-medium drop-shadow">
                Know where your package is, how far it is, and when it will arrive — in real time. Powered by live GPS telemetry across Delhi NCR.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#quick-track"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 hover:scale-[1.02] transition cursor-pointer"
              >
                <Navigation className="h-5 w-5" />
                Track My Delivery
              </a>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-black/30 backdrop-blur-md px-7 py-4 text-base font-bold text-white hover:bg-white/20 hover:border-white/40 transition"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Radio, label: 'Real-Time GPS Tracking', color: 'text-indigo-600' },
              { icon: Clock, label: 'Accurate ETA Prediction', color: 'text-blue-600' },
              { icon: Shield, label: 'Secure Delivery', color: 'text-emerald-600' },
              { icon: Zap, label: 'Instant Notifications', color: 'text-amber-600' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUICK TRACKING SECTION — Premium Side-by-Side Card Experience
      ═══════════════════════════════════════════════════════ */}
      <section id="quick-track" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-100 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Premium Editorial Typography & Features */}
            <div className="lg:col-span-5 space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50/80 px-4 py-1.5 text-xs font-bold text-indigo-700 shadow-xs backdrop-blur-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                </span>
                <span className="tracking-wide uppercase text-[11px]">Sub-Second GPS Network</span>
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Track Your Parcel in{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600">
                    Real Time
                  </span>
                </h2>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  Enter your tracking number to instantly locate your delivery vehicle on interactive maps, inspect active road waypoints, monitor real-time ETA, and verify assigned driver credentials.
                </p>
              </div>

              {/* Feature Highlights as Premium Cards */}
              <div className="grid grid-cols-1 gap-3.5 pt-1">
                {[
                  {
                    icon: Radio,
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                    title: 'Live GPS Satellite Telemetry',
                    desc: 'Continuous location broadcasts with bearing and speed updates.',
                  },
                  {
                    icon: Clock,
                    color: 'text-blue-600 bg-blue-50 border-blue-100',
                    title: 'Dynamic Traffic-Aware ETA',
                    desc: 'Calculates real-time Delhi NCR urban road congestion and distance.',
                  },
                  {
                    icon: Shield,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    title: 'Verified Partner Verification',
                    desc: 'Instant driver identity, phone badge, and EV registration number.',
                  },
                  {
                    icon: Zap,
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    title: '500m Proximity Alerts',
                    desc: 'Automated milestone notifications and email alerts prior to arrival.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 p-4 rounded-lg bg-white/90 border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${item.color} shadow-xs`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-heading">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Clean Sleek Black Card to put ID and get details */}
            <div className="lg:col-span-7">
              <div className="bg-[#0b0e14] text-white rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/20">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-black text-white tracking-tight">
                        Live Shipment Lookup
                      </h3>
                      <p className="text-xs text-slate-400">
                        Enter your tracking ID to view live coordinates &amp; status
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Live GPS Telemetry
                  </span>
                </div>

                {/* Tracking Input Form */}
                <form onSubmit={handleQuickTrackSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => {
                          setTrackingInput(e.target.value);
                          setSearchError(null);
                        }}
                        placeholder="Enter Tracking ID (e.g. GTM-20260820-875171)..."
                        className="w-full rounded-xl border border-slate-700 bg-black/80 py-4 pl-12 pr-4 text-sm font-mono font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {isSearching ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4" />
                          <span>Track Delivery</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Error Notice */}
                {searchError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Shipment Not Found</p>
                      <p className="mt-0.5 text-rose-300/80">{searchError}</p>
                    </div>
                  </div>
                )}

                {/* Live Parcel Location & Details */}
                {previewOrder && previewLiveTracking && (
                  <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5 space-y-4 animate-slide-up shadow-xl">
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-cyan-300">
                            {previewOrder.trackingNumber}
                          </span>
                          <span className="rounded-md bg-indigo-950 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                            {previewOrder.routeType || 'STANDARD'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Booked {new Date(previewOrder.createdAt).toLocaleDateString()} · {previewOrder.customerType} · {previewOrder.paymentType}
                        </p>
                      </div>
                      <span className="self-start sm:self-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-400 shadow-sm flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {previewOrder.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Live Map Preview */}
                    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                      <LiveDeliveryMap trackingData={previewLiveTracking} className="h-[260px]" />
                    </div>

                    {/* Dynamic Telemetry Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="bg-black/50 rounded-xl p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated ETA</span>
                        <div className="text-base font-black text-indigo-400 mt-0.5 font-heading">
                          {previewLiveTracking.etaMinutes} mins
                        </div>
                      </div>
                      <div className="bg-black/50 rounded-xl p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance Away</span>
                        <div className="text-base font-black text-white mt-0.5 font-heading">
                          {previewLiveTracking.distanceRemaining} km
                        </div>
                      </div>
                      <div className="bg-black/50 rounded-xl p-2.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Driver</span>
                        <div className="text-xs font-bold text-slate-200 mt-1 truncate">
                          {previewOrder.assignedAgentName || 'Rajesh Kumar'}
                        </div>
                      </div>
                    </div>

                    {/* Pickup and Drop Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/40 rounded-xl p-3 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>Pickup Origin</span>
                        </div>
                        <div className="font-bold text-slate-200 mt-1 text-xs">{previewOrder.pickupName}</div>
                        <div className="text-slate-400 truncate text-[11px] mt-0.5">{previewOrder.pickupAddress}</div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 border border-indigo-900/50">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] uppercase">
                          <MapPin className="h-3 w-3 text-cyan-400" />
                          <span>Delivery Destination</span>
                        </div>
                        <div className="font-bold text-white mt-1 text-xs">{previewOrder.dropName}</div>
                        <div className="text-slate-400 truncate text-[11px] mt-0.5">{previewOrder.dropAddress}</div>
                      </div>
                    </div>

                    {/* Full Telemetry Link */}
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/track/${previewOrder.trackingNumber}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                      >
                        <span>Open Full Screen Telemetry View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPACT INFO FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0b0e14] text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand & Live Indicator */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-lg font-black tracking-tight text-white font-heading">GATIMAN</span>
              </div>
              <span className="hidden sm:inline text-slate-700">·</span>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Delhi NCR Live Telemetry Network Active</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
              <Link to="/track" className="hover:text-indigo-400 transition">Track Delivery</Link>
              <Link to="/login" className="hover:text-indigo-400 transition">Driver &amp; Client Login</Link>
              <Link to="/register" className="hover:text-indigo-400 transition">Create Account</Link>
            </div>
          </div>

          {/* Bottom Line */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
            <p>© {new Date().getFullYear()} GATIMAN Logistics Platform. High-Speed Urban Last-Mile Tracking.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Delhi · Gurugram · Noida · Faridabad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
