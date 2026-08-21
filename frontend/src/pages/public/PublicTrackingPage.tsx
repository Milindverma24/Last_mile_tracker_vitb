import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { trackingApi } from '../../api/trackingApi';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { LiveDeliveryMap } from '../../components/tracking/LiveDeliveryMap';
import { LiveTrackingStatusCard } from '../../components/tracking/LiveTrackingStatusCard';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';
import { Order, TrackingEvent, OrderStatus } from '../../types';
import {
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Phone,
  CreditCard,
  Lock,
  Navigation,
  Sparkles,
} from 'lucide-react';

export const PublicTrackingPage: React.FC = () => {
  const { trackingNumber: routeTrackingNumber } = useParams<{ trackingNumber?: string }>();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(routeTrackingNumber || '');
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(routeTrackingNumber || null);
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Live WebSocket Telemetry hook
  const { data: liveTracking, connectionState, refetch: refetchLive } = useLiveTracking(order?.id);

  const sampleTrackingNumbers = [
    'GTM-20260820-875171',
    'GTM-20260820-000001',
    'GTM-20260820-000002',
  ];

  const fetchTrackingDetails = async (num: string) => {
    const cleanNum = num.trim();
    if (!cleanNum) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const fetchedOrder = await orderApi.trackByNumber(cleanNum);
      setOrder(fetchedOrder);
      setActiveTrackingNumber(cleanNum);

      // Fetch tracking events
      try {
        const events = await orderApi.getTrackingTimeline(fetchedOrder.id);
        setTrackingEvents(events);
      } catch (e) {
        setTrackingEvents([]);
      }
    } catch (err: any) {
      setOrder(null);
      setTrackingEvents([]);
      setErrorMsg(
        err.response?.data?.message ||
          `No shipment found with tracking number "${cleanNum}". Please verify and try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeTrackingNumber) {
      setInputVal(routeTrackingNumber);
      fetchTrackingDetails(routeTrackingNumber);
    } else {
      // Default to standard active demo tracking number if opened without param
      fetchTrackingDetails('GTM-20260820-875171');
    }
  }, [routeTrackingNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      navigate(`/track/${inputVal.trim()}`);
    }
  };

  const steps: { status: OrderStatus; label: string }[] = [
    { status: 'CREATED', label: 'Order Created' },
    { status: 'ASSIGNED', label: 'Driver Assigned' },
    { status: 'PICKED_UP', label: 'Picked Up' },
    { status: 'IN_TRANSIT', label: 'In Transit' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery' },
    { status: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status?: OrderStatus) => {
    switch (status) {
      case 'CREATED':
        return 0;
      case 'ASSIGNED':
        return 1;
      case 'PICKED_UP':
        return 2;
      case 'IN_TRANSIT':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      case 'FAILED':
      case 'RESCHEDULED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order?.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-400" />
              <span>Public Live Tracking Portal</span>
            </h1>
            <p className="text-xs text-slate-400">
              Track any shipment across the GATIMAN logistics network with real-time GPS telemetry.
            </p>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter Tracking ID..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Quick Sample Links */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
          <span>Popular Track IDs:</span>
          {sampleTrackingNumbers.map((num) => (
            <button
              key={num}
              onClick={() => {
                setInputVal(num);
                navigate(`/track/${num}`);
              }}
              className={`rounded-lg border px-2.5 py-0.5 font-mono text-[10px] transition cursor-pointer ${
                activeTrackingNumber === num
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 flex items-start gap-4 shadow-lg">
          <AlertCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-200">Shipment Lookup Notice</h3>
            <p className="text-xs text-rose-300 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Querying live telemetry coordinates...</p>
        </div>
      )}

      {/* Main Order Tracking Body */}
      {!isLoading && order && (
        <div className="space-y-6">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black text-indigo-400">
                  {order.trackingNumber}
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/20">
                  {order.routeType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Booked on {new Date(order.createdAt).toLocaleString()} • {order.customerType} • {order.paymentType}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchTrackingDetails(order.trackingNumber);
                  refetchLive();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-300 shadow hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                <span>Refresh Telemetry</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live Map & Telemetry Dashboard */}
          {liveTracking && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
              <div className="lg:col-span-7">
                <LiveDeliveryMap trackingData={liveTracking} />
              </div>
              <div className="lg:col-span-5">
                <LiveTrackingStatusCard trackingData={liveTracking} connectionState={connectionState} />
              </div>
            </div>
          )}

          {/* Visual Milestone Progression Track */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Delivery Progress Milestones
            </h2>

            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-800" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, idx) => {
                const isCompleted = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.status} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                        isCompleted
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                          : 'border-slate-700 bg-slate-900 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-indigo-500/30' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-center text-xs font-semibold max-w-[80px] ${
                        isCompleted ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Grid: Route & Billing */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Route Addresses */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Route & Addresses
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Origin</p>
                    <p className="text-sm font-bold text-white">{order.pickupName}</p>
                    <p className="text-slate-300">{order.pickupAddress}</p>
                    <p className="font-mono text-slate-500">PIN: {order.pickupPincode} ({order.pickupZoneName || 'South Delhi'})</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Drop Destination</p>
                    <p className="text-sm font-bold text-white">{order.dropName}</p>
                    <p className="text-slate-300">{order.dropAddress}</p>
                    <p className="font-mono text-slate-500">PIN: {order.dropPincode} ({order.dropZoneName || 'Gurugram'})</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Billing & Payment
                </h3>
                {order.paymentType === 'PREPAID' ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    {order.paymentStatus === 'PAID' ? 'PAID (Razorpay)' : 'PAYMENT PENDING'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                    Cash on Delivery
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Actual Weight:</span>
                  <span className="font-semibold text-white">{order.actualWeightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billable Weight:</span>
                  <span className="font-bold text-indigo-400">{order.billableWeightKg} kg</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between">
                  <span className="text-slate-400">Delivery Charge:</span>
                  <span className="font-semibold text-white">₹{Number(order.baseCharge).toFixed(2)}</span>
                </div>
                {Number(order.codSurcharge) > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>COD Surcharge:</span>
                    <span className="font-semibold">₹{Number(order.codSurcharge).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-white">
                  <span>Total Amount:</span>
                  <span className="text-indigo-400">₹{Number(order.totalCharge).toFixed(2)}</span>
                </div>

                {order.paymentType === 'PREPAID' && order.paymentStatus !== 'PAID' && (
                  <div className="pt-3">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay ₹{Number(order.totalCharge).toFixed(2)} with Razorpay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Immutable Audit Log Timeline */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Immutable Delivery Audit Timeline
            </h3>

            {trackingEvents.length === 0 ? (
              <p className="text-xs text-slate-500">No events logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {trackingEvents.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-indigo-500 shadow" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          {event.newStatus}
                        </span>
                        <h4 className="text-sm font-bold text-white">{event.remarks || 'Shipment update'}</h4>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(event.eventTimestamp).toLocaleString()} • {event.actorName} ({event.actorRole})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      {showPaymentModal && order && (
        <RazorpayCheckoutModal
          orderId={order.id}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchTrackingDetails(order.trackingNumber);
            refetchLive();
          }}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};
