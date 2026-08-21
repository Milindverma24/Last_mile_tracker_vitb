import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi, LiveTrackingData } from '../../api/trackingApi';
import { Order } from '../../types';
import { LiveDeliveryMap } from '../../components/tracking/LiveDeliveryMap';
import {
  Truck,
  Search,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  Zap,
  Radio,
  Layers,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Phone,
  Lock,
  Compass,
  Star,
  Users,
  Building2,
  Package,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  // Mock initial demo tracking state for the interactive hero preview map
  const demoHeroTrackingData: LiveTrackingData = {
    orderId: 4,
    trackingNumber: 'GTM-20260820-875171',
    status: 'IN_TRANSIT',
    isLive: true,
    deliveryPartner: {
      id: 3,
      name: 'Rajesh Kumar',
      phoneNumber: '+91 98999 11223',
      vehicleType: 'EV_SCOOTER',
      vehicleNumber: 'DL-03-EV-9821',
    },
    currentLocation: { latitude: 28.512, longitude: 77.145 },
    heading: 220,
    speed: 32,
    pickupLocation: {
      name: 'Priya Sharma (Hauz Khas Hub)',
      address: '42, Hauz Khas Village, South Delhi',
      pincode: '110016',
      latitude: 28.5494,
      longitude: 77.2001,
    },
    destination: {
      name: 'Cyber City Hub Drop',
      address: '101, Cyber City, Phase 3, Gurugram',
      pincode: '122002',
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
  };

  const handleQuickTrackSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = trackingInput.trim();
    if (!cleanId) {
      setSearchError('Please enter a valid tracking number or Order ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setPreviewOrder(null);

    try {
      const order = await orderApi.trackByNumber(cleanId);
      setPreviewOrder(order);
    } catch (err: any) {
      setSearchError(
        err.response?.data?.message ||
          `No active shipment found with tracking ID "${cleanId}". Please check the number and try again.`
      );
    } finally {
      setIsSearching(false);
    }
  };

  const sampleTrackingNumbers = [
    'GTM-20260820-875171',
    'GTM-20260820-000001',
    'GTM-20260820-000002',
  ];

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading, Subtext, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Delhi NCR's Fastest Last-Mile Delivery Engine</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Your Delivery.{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-blue-400 bg-clip-text text-transparent">
                  Tracked Every Step
                </span>{' '}
                of the Way.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Track your delivery in real time, know exactly where your package is, and get accurate arrival estimates — all from one high-precision platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#quick-track"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Track My Delivery</span>
                </a>

                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Key Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-lg font-black text-white">&lt; 28 min</div>
                  <p className="text-[11px] text-slate-400">Avg. Urban Dispatch</p>
                </div>
                <div>
                  <div className="text-lg font-black text-emerald-400">100% Live</div>
                  <p className="text-[11px] text-slate-400">GPS Telemetry Stream</p>
                </div>
                <div>
                  <div className="text-lg font-black text-indigo-400">Razorpay</div>
                  <p className="text-[11px] text-slate-400">Instant Online Pay</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Delivery Map Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/70 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                {/* Floating Driver Status Pill */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-xl bg-slate-950/90 px-3.5 py-2 text-white shadow-2xl backdrop-blur border border-slate-800 text-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-400 uppercase text-[10px]">Active In Transit</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-semibold text-slate-200">3.4 km</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-indigo-400">8 min ETA</span>
                </div>

                {/* Leaflet Map Visual */}
                <div className="overflow-hidden rounded-2xl">
                  <LiveDeliveryMap trackingData={demoHeroTrackingData} className="h-[340px]" />
                </div>

                {/* Bottom Floating Delivery Details Banner */}
                <div className="mt-3 rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                      RK
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Rajesh Kumar</h4>
                      <p className="text-[11px] font-mono text-slate-400">EV Scooter • DL-03-EV-9821</p>
                    </div>
                  </div>
                  <Link
                    to="/track/GTM-20260820-875171"
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition"
                  >
                    <span>Full Track</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK TRACKING SECTION */}
      <section id="quick-track" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Track Your Delivery</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your authoritative tracking number to instantly view live coordinates, driver info, and arrival time.
            </p>
          </div>

          {/* Search Box Form */}
          <form onSubmit={handleQuickTrackSubmit} className="max-w-2xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. GTM-20260820-875171)"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    <span>Track Delivery</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Click Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
              <span>Sample Shipments:</span>
              {sampleTrackingNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setTrackingInput(num);
                    setSearchError(null);
                  }}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[11px] text-indigo-300 hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer"
                >
                  {num}
                </button>
              ))}
            </div>
          </form>

          {/* Search Error Alert */}
          {searchError && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-bold">Shipment Lookup Notice</p>
                <p className="mt-0.5 text-rose-200">{searchError}</p>
              </div>
            </div>
          )}

          {/* Live Preview Card Result */}
          {previewOrder && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-indigo-500/30 bg-slate-950 p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-sm font-black text-indigo-400">
                    {previewOrder.trackingNumber}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {previewOrder.customerType} • {previewOrder.paymentType} • ₹{Number(previewOrder.totalCharge).toFixed(2)}
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                  {previewOrder.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Pickup Origin</p>
                  <p className="font-bold text-white">{previewOrder.pickupName}</p>
                  <p className="text-slate-400 truncate">{previewOrder.pickupAddress}</p>
                </div>

                <div className="rounded-xl bg-indigo-950/40 p-3 border border-indigo-900/50">
                  <p className="text-indigo-400 font-bold uppercase text-[10px]">Drop Destination</p>
                  <p className="font-bold text-white">{previewOrder.dropName}</p>
                  <p className="text-slate-400 truncate">{previewOrder.dropAddress}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-400">
                  Driver:{' '}
                  <span className="font-bold text-slate-200">
                    {previewOrder.assignedAgentName || 'Auto-assigning...'}
                  </span>
                </div>

                <Link
                  to={`/track/${previewOrder.trackingNumber}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
                >
                  <span>Open Live Map</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. HOW IT WORKS (4-STEP PIPELINE) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-indigo-400">
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            How GATIMAN Delivery Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From booking confirmation to doorstep handover in 4 intelligent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01',
              title: 'Place Your Order',
              desc: 'Book pickup online with instant volumetric weight calculation and dynamic rate preview.',
              icon: Package,
            },
            {
              step: '02',
              title: 'Delivery Assigned',
              desc: 'Intelligent dispatch algorithm auto-assigns the nearest active verified fleet partner.',
              icon: Users,
            },
            {
              step: '03',
              title: 'Track in Real Time',
              desc: 'Follow your parcel live on Leaflet maps with dynamic ETA and road distance reduction.',
              icon: Compass,
            },
            {
              step: '04',
              title: 'Receive Package',
              desc: 'Proximity alerts trigger when driver is within 500m for seamless, secure delivery handover.',
              icon: CheckCircle2,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg backdrop-blur hover:border-indigo-500/50 hover:bg-slate-900 transition duration-300 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-black text-slate-700 group-hover:text-indigo-400 transition">
                  {item.step}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>

              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CORE FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-indigo-400">
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Built for Precision & Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enterprise-grade last-mile infrastructure optimized for high-density urban deliveries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Real-Time GPS Tracking',
              desc: 'High-frequency live telemetry broadcasts driver location, bearing angle, and route progress without page reloads.',
              icon: Radio,
              badge: 'Live WebSocket',
            },
            {
              title: 'Accurate AI-Powered ETA',
              desc: 'Dynamic arrival prediction computes real-time road curvature and urban traffic speed matrices.',
              icon: Clock,
              badge: 'Dynamic',
            },
            {
              title: 'Distance Telemetry',
              desc: 'Haversine geodesic distance calculation updated continuously as the delivery partner travels.',
              icon: Navigation,
              badge: 'Kilometric',
            },
            {
              title: 'Instant Notifications',
              desc: 'Real-time in-app alerts and SMS updates for parcel dispatch, transit milestones, and arrival.',
              icon: Zap,
              badge: 'Automated',
            },
            {
              title: 'Razorpay & COD Security',
              desc: 'Seamless prepaid digital transactions with HMAC-SHA256 signature verification and cash on delivery.',
              icon: Lock,
              badge: 'Bank-Grade',
            },
            {
              title: 'Immutable Audit Timeline',
              desc: 'Every milestone, dispatch, status transition, and reschedule request is logged immutably.',
              icon: Shield,
              badge: 'Tamper-Proof',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-md hover:border-slate-700 hover:bg-slate-900/80 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <feat.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                  {feat.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SERVICES & SOLUTIONS SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-indigo-400">
            <span>Logistics Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Tailored for Businesses & Individuals
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Whether booking an express single document or dispatching thousands of B2B parcels.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Solution 1: B2B Enterprise */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-xl space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Enterprise & B2B Logistics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated rate card structures, bulk dispatch scheduling, automated SLA tracking, and priority driver allocation across all Delhi NCR industrial hubs.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Custom B2B tiered volumetric pricing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Dedicated fleet management dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Custom webhook & telemetry APIs</span>
              </li>
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              <span>Explore B2B Solutions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Solution 2: B2C On-Demand */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-xl space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Truck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">On-Demand Express B2C Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant doorstep courier pickup and drop with live driver location tracking, flexible rescheduling, and cash-on-delivery or online payments.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <span>Doorstep pickup in under 30 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <span>Live interactive Leaflet map tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <span>1-Click reschedule window selection</span>
              </li>
            </ul>
            <Link
              to="/customer/orders/create"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              <span>Book Instant Shipment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. STATISTICS & METRICS SECTION */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 font-mono">100%</div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Real-Time GPS Telemetry
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">99.4%</div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                On-Time Delivery Rate
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">&lt; 28 min</div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Avg. Urban Dispatch
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-blue-400 font-mono">15+</div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Delhi NCR Service Zones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT & TRUST SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-indigo-400">
            <span>Verified Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Trusted Across Delhi NCR
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            See what customers and delivery fleet partners say about the GATIMAN experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              quote:
                'The live map tracking and razorpay integration make dispatching high-value documents between Hauz Khas and DLF Cyber City completely painless.',
              author: 'Priya Sharma',
              role: 'Verified Customer',
              rating: 5,
            },
            {
              quote:
                'As a fleet driver, the run sheet and automatic GPS transmission give me clear navigation and stop tracking the moment I mark parcels delivered.',
              author: 'Rajesh Kumar',
              role: 'EV Fleet Partner',
              rating: 5,
            },
            {
              quote:
                'Automated zone detection, billable volumetric calculation, and real-time dispatch analytics have saved our operations team hours every day.',
              author: 'Vikram Seth',
              role: 'Logistics Operations Lead',
              rating: 5,
            },
          ].map((t) => (
            <div
              key={t.author}
              className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="font-bold text-white text-xs">{t.author}</h4>
                <p className="text-[11px] text-indigo-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-900 p-8 sm:p-14 text-center shadow-2xl space-y-6">
          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Track Your Delivery?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Experience real-time delivery telemetry, accurate arrival estimates, and high-speed dispatch across Delhi NCR.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-indigo-900 shadow-xl hover:bg-slate-100 transition"
              >
                <Navigation className="h-4 w-4" />
                <span>Track Delivery Now</span>
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-950/60 px-6 py-3.5 text-xs font-bold text-white hover:bg-indigo-950 transition"
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
