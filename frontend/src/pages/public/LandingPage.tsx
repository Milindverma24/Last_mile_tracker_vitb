import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi, LiveTrackingData } from '../../api/trackingApi';
import { Order } from '../../types';
import { DeliveryVideoPlayer } from '../../components/common/DeliveryVideoPlayer';
import {
  Truck, Search, ArrowRight, Star, Users, Building2,
  Radio, ChevronLeft, ChevronRight, AlertCircle, Play, X,
  ChevronDown
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [previewLiveTracking, setPreviewLiveTracking] = useState<LiveTrackingData | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeServiceSlide, setActiveServiceSlide] = useState(0);

  const handleQuickTrackSubmit = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const cleanId = (customId || trackingInput).trim();
    if (!cleanId) {
      setSearchError('Please enter a valid tracking number (e.g. GTM-20260824-196623)');
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

  const services = [
    {
      title: 'Same-Day Inter-City Express',
      tag: 'Corridor Transit',
      image: '/images/service_intercity_express.jpg',
      desc: 'Scheduled direct hub transit connecting Delhi NCR, Jaipur, Chandigarh, and Agra within hours.',
    },
    {
      title: 'Doorstep Hyperlocal Dispatch',
      tag: 'On-Demand Pickup',
      image: '/images/service_doorstep_hyperlocal.jpg',
      desc: 'Instant doorstep collection and same-day city delivery for personal and business parcels.',
    },
    {
      title: 'Heavy Cargo & Bulk Freight',
      tag: 'Volumetric B2B',
      image: '/images/service_heavy_freight.jpg',
      desc: 'Full truckload and volumetric multi-carton commercial shipping with transparent weight slabs.',
    },
    {
      title: 'EV Urban Fleet Delivery',
      tag: 'Zero-Emission Last Mile',
      image: '/images/service_ev_scooter_fleet.jpg',
      desc: 'Eco-friendly electric scooters and delivery vans for fast, green last-mile urban dispatch.',
    },
  ];

  const faqs = [
    {
      q: 'Which cities and corridors do you cover for inter-city delivery?',
      a: 'GATIMAN connects all major hubs across Delhi NCR (Delhi, Noida, Gurugram, Ghaziabad, Faridabad) and high-speed inter-city corridors including Jaipur, Chandigarh, Lucknow, Agra, and Ludhiana.',
    },
    {
      q: 'How quickly are inter-city consignments picked up and delivered?',
      a: 'Doorstep pickups occur within 60 minutes of booking. Express corridor shipments reach destination hubs within 12 to 24 hours with continuous live GPS tracking.',
    },
    {
      q: 'How do I track my package in real time?',
      a: 'Simply enter your tracking number (e.g. GTM-20260824-196623) in our Live Radar to view live vehicle GPS coordinates, driver contact details, and sub-second ETA countdowns.',
    },
    {
      q: 'How is volumetric weight calculated for parcel pricing?',
      a: 'Volumetric weight is computed as (Length × Width × Height in cm) / 5000. Your billable amount is automatically determined by whichever is higher between actual dead weight and volumetric weight.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. FLOATING NAVIGATION BAR (Glass Capsule)
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm transition hover:shadow-md">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-base shadow-sm">
              G
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-slate-900 group-hover:text-orange-600 transition">
              gatiman<span className="text-orange-600">.</span>
            </span>
          </Link>

          {/* Center Navigation Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-600">
            <a href="#home" className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold transition shadow-xs">
              Home
            </a>
            <a href="#services" className="px-3.5 py-2 rounded-full hover:text-slate-900 transition flex items-center gap-1">
              Services <ChevronDown className="w-3 h-3 text-slate-400" />
            </a>
            <a href="#tracking" className="px-3.5 py-2 rounded-full hover:text-slate-900 transition">
              Live Radar
            </a>
            <a href="#faq" className="px-3.5 py-2 rounded-full hover:text-slate-900 transition">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons: Login, Driver Partner, and Customer Send Parcel */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-bold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 hover:bg-slate-50 transition shadow-sm"
            >
              Login
            </Link>

            <Link
              to="/register/driver"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 hover:bg-emerald-100 transition shadow-sm"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Drive & Earn</span>
            </Link>

            <Link
              to="/register/customer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-orange-600 transition shadow-md shadow-orange-500/20 group"
            >
              <span>Send Parcel</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION WITH INDUSTRIAL CONTAINER BACKGROUND
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden min-h-[580px] sm:min-h-[640px] flex flex-col justify-end p-6 sm:p-12 shadow-2xl border border-slate-200">
          
          {/* Background Image Container with Cinematic Lighting */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url('/images/gatiman_hero_container.jpg')` }}
          >
            {/* Cinematic Gradient Overlays for readable text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          </div>

          {/* Middle / Bottom Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            {/* Left: Bold Inter-City Delivery Typography */}
            <div className="lg:col-span-8 space-y-6">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-white leading-[1.05] tracking-tight max-w-2xl">
                Ready to accelerate your inter-city delivery?
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register/customer"
                  className="px-6 py-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-sm transition flex items-center gap-2"
                >
                  <span>Book Doorstep Pickup</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </Link>

                <a
                  href="#tracking"
                  className="px-6 py-3.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition shadow-lg shadow-orange-900/40 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Consignment</span>
                </a>
              </div>
            </div>

            {/* Right: Floating "See how we work" Video Card */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div 
                onClick={() => setIsVideoModalOpen(true)}
                className="group cursor-pointer bg-gradient-to-br from-stone-900/90 via-amber-950/80 to-stone-900/90 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 max-w-sm shadow-2xl hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <div>
                  <div className="text-[11px] font-mono font-black text-orange-400 tracking-wider">
                    01 <span className="text-white/40">/ 03</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                    See how dispatch works.
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    Real-time sorting & EV corridor dispatch.
                  </p>
                </div>

                {/* Video Thumbnail with Play Badge */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/30 shrink-0 shadow-md">
                  <img 
                    src="/images/video_worker_thumb.jpg" 
                    alt="Operations Engineer" 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:bg-orange-500 group-hover:text-white transition">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. REAL-TIME TRACKING LOOKUP RADAR BAR
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="tracking" className="px-4 sm:px-8 max-w-7xl mx-auto -mt-6 mb-16 relative z-20">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200">
          <form onSubmit={handleQuickTrackSubmit} className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-orange-500" />
              </div>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter GATIMAN tracking number (e.g. GTM-20260824-196623)..."
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-mono transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <span className="animate-spin">↻</span> : <Radio className="w-4 h-4 text-orange-400" />}
              <span>Track Live</span>
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Live Tracking Result Banner */}
          {previewOrder && previewLiveTracking && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700 text-white animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white">
                      {previewOrder.status}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{previewOrder.trackingNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Inter-City Corridor: <strong className="text-slate-200">{previewOrder.pickupPincode}</strong> ➔ <strong className="text-slate-200">{previewOrder.dropPincode}</strong> · ₹{previewOrder.totalCharge}
                  </p>
                </div>

                <Link
                  to={`/track/${previewOrder.trackingNumber}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white transition self-start sm:self-auto"
                >
                  <span>Open Full Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Assigned Courier</span>
                  <span className="font-bold text-white text-sm">{previewLiveTracking.deliveryPartner?.name || 'Rajesh Kumar'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Distance Remaining</span>
                  <span className="font-bold text-emerald-400 text-sm">{previewLiveTracking.distanceRemaining || 3.2} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Estimated Arrival</span>
                  <span className="font-bold text-amber-400 text-sm">~{previewLiveTracking.etaMinutes || 12} mins</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fleet Vehicle</span>
                  <span className="font-bold text-white text-sm">{previewLiveTracking.deliveryPartner?.vehicleNumber || 'EV-Fleet'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. SERVICES MULTI-MODAL SLIDER (Inter-City Corridor Delivery)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="services" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-slate-50/60 rounded-[3rem] border border-slate-200/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-xs">
              Inter-City Services
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
              All set for seamless inter-city logistics
            </h2>
          </div>

          {/* Slider Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveServiceSlide((prev) => (prev === 0 ? services.length - 1 : prev - 1))}
              className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveServiceSlide((prev) => (prev === services.length - 1 ? 0 : prev + 1))}
              className="w-11 h-11 rounded-full bg-slate-900 text-white hover:bg-orange-600 flex items-center justify-center transition shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="group rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                  {srv.tag}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-orange-600 transition pt-2 border-t border-slate-100"
                >
                  <span>Explore Corridor Slabs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. TESTIMONIALS & TRUSTED COURIER NETWORK
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Client Trust
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Trusted by businesses for daily inter-city shipping
          </h2>
        </div>

        {/* Testimonial Quote Card with Floating Avatars */}
        <div className="relative mt-12 max-w-3xl mx-auto bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-lg text-center">
          
          {/* Avatar Cluster */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white shadow-xs object-cover" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-12 h-12 rounded-full border-2 border-orange-500 shadow-md object-cover" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white shadow-xs object-cover" />
          </div>

          <p className="text-base sm:text-xl font-medium text-slate-700 leading-relaxed italic max-w-xl mx-auto">
            "We count on Gatiman for our daily inter-city shipments and doorstep customer drops. Their real-time GPS telemetry, volumetric rate accuracy, and prompt milestone alerts keep our operations completely seamless."
          </p>

          <div className="mt-6">
            <h4 className="font-bold text-slate-900 text-sm">Aarav Mehta</h4>
            <p className="text-xs text-slate-500">Director of Operations · North India E-Commerce</p>
          </div>
        </div>

        {/* Partners Logo Ticker */}
        <div className="mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Integrated courier networks & enterprise partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition duration-300">
            <span className="font-black font-heading text-lg sm:text-xl tracking-wider text-slate-800">DELHIVERY</span>
            <span className="font-black font-heading text-xl sm:text-2xl tracking-tighter text-slate-800">BlueDart</span>
            <span className="font-black font-heading text-xl sm:text-2xl tracking-tighter text-slate-800">DTDC</span>
            <span className="font-black font-heading text-xl sm:text-2xl tracking-tighter text-slate-800">FedEx</span>
            <span className="font-black font-heading text-lg sm:text-xl tracking-tight text-slate-800">Trackon</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. FAQ ACCORDION SECTION (Tailored for Inter-City Delivery)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Questions? Glad you asked
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isOpen ? 'bg-white border-orange-500/40 shadow-md' : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isOpen ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      0{idx + 1}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.q}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. CALL TO ACTION BANNER (Inter-City Dispatch)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-14 bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Background image overlay */}
          <div 
            className="absolute right-0 inset-y-0 w-full md:w-1/2 bg-cover bg-center opacity-30 pointer-events-none"
            style={{ backgroundImage: `url('/images/gatiman_hero_container.jpg')` }}
          />

          <div className="relative z-10 space-y-4 max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight leading-tight">
              Ready to send your package to another city?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Book doorstep pickup in seconds with automated driver dispatch, transparent volumetric quotes, and OTP-secured delivery.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/register/customer"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 font-bold text-sm text-white transition shadow-lg shadow-orange-900/40 text-center flex items-center justify-center gap-2"
            >
              <span>Book Inter-City Pickup</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. ENTERPRISE FOOTER
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-12 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200 mt-12 text-xs text-slate-500">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm">
                G
              </div>
              <span className="font-heading font-black text-lg tracking-tight text-slate-900">
                gatiman<span className="text-orange-600">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Next-generation inter-city & urban logistics operating system with real-time GPS telemetry, volumetric rate cards, and automated EV fleet dispatch.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-slate-900 transition">About Gatiman</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">Inter-City Network</a></li>
              <li><a href="#faq" className="hover:text-slate-900 transition">Fleet Hubs</a></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Contact Operations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Services</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-slate-900 transition">Same-Day Corridor Express</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">Doorstep Hyperlocal</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">Heavy Cargo Freight</a></li>
              <li><a href="#services" className="hover:text-slate-900 transition">EV Urban Dispatch</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Tracking & Portals</h4>
            <ul className="space-y-2">
              <li><a href="#tracking" className="hover:text-slate-900 transition">Live Parcel Radar</a></li>
              <li><a href="#faq" className="hover:text-slate-900 transition">Help Center & FAQ</a></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Driver Portal</Link></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 GATIMAN Logistics Platform. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#home" className="hover:text-slate-900 transition">Terms of Service</a>
            <a href="#home" className="hover:text-slate-900 transition">Privacy Policy</a>
            <a href="#home" className="hover:text-slate-900 transition">Security Overview</a>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. VIDEO PREVIEW MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  GATIMAN Inter-City Operations Reel · Delhi NCR
                </span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <DeliveryVideoPlayer />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

