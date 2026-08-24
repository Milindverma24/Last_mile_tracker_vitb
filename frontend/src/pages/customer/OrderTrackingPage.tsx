import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { useTracking } from '../../hooks/useTracking';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { useAuth } from '../../context/AuthContext';
import { LiveTrackingStatusCard } from '../../components/tracking/LiveTrackingStatusCard';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';
import {
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Phone,
  CreditCard,
  Lock,
  Navigation,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const CustomerOrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: order, isLoading: orderLoading, refetch: refetchOrder } = useOrder(id);
  const { data: trackingEvents = [], isLoading: trackingLoading, refetch: refetchTracking } = useTracking(order?.id || id);
  const { data: liveTracking, connectionState, refetch: refetchLive } = useLiveTracking(order?.id || id);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getBackPath = () => {
    if (location.pathname.startsWith('/admin') || user?.role === 'ADMIN') {
      return '/admin/orders';
    }
    if (location.pathname.startsWith('/agent') || user?.role === 'DELIVERY_AGENT') {
      return '/agent/deliveries';
    }
    return '/customer/orders';
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(getBackPath());
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

  if (orderLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-600">Retrieving live tracking telemetry...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-3 text-lg font-bold text-slate-900">Shipment Not Found</h3>
        <p className="mt-1 text-xs text-slate-500">
          The requested tracking number does not exist or you do not have permission to view it.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Tracking ID */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              title="Go back to orders"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-mono text-xl font-black tracking-tight text-orange-600">
              {order.trackingNumber}
            </span>
            <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">
              {order.routeType}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Booked on {new Date(order.createdAt).toLocaleString()} • {order.customerType} • {order.paymentType}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Automated Email Alerts Active</span>
          </div>

          <button
            onClick={() => {
              refetchOrder();
              refetchTracking();
              refetchLive();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Failed Delivery Alert Card */}
      {order.status === 'FAILED' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-100 p-2.5 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900">Delivery Attempt Failed</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Our delivery partner was unable to complete the delivery. You can reschedule a convenient time window.
                </p>
              </div>
            </div>
            <Link
              to={`/customer/reschedule?orderId=${order.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-500"
            >
              Choose Reschedule Slot
            </Link>
          </div>
        </div>
      )}

      {/* Real-Time Live Status & Telemetry Dashboard (Map Removed) */}
      {liveTracking && (
        <div className="w-full">
          <LiveTrackingStatusCard trackingData={liveTracking} connectionState={connectionState} />
        </div>
      )}

      {/* Visual Milestone Progression Track */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 sm:mb-6">
          Delivery Progress Milestones
        </h2>

        {/* Mobile Vertical Stepper (< 640px) */}
        <div className="sm:hidden space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div key={step.status} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition shrink-0 ${
                    isCompleted
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-100 text-slate-400'
                  } ${isCurrent ? 'ring-2 ring-orange-200' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop / Tablet Horizontal Track (>= 640px) */}
        <div className="hidden sm:flex relative items-center justify-between">
          {/* Background Bar */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-100" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-600 transition-all duration-500"
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
                      ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                      : 'border-slate-300 bg-white text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-center text-xs font-semibold max-w-[80px] ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid: Route Info & Billing Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Route Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Route & Addresses
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Pickup Location</p>
                <p className="text-sm font-bold text-slate-900">{order.pickupName}</p>
                <p className="text-xs text-slate-600">{order.pickupAddress}</p>
                <p className="text-xs font-mono text-slate-500">PIN: {order.pickupPincode} ({order.pickupZoneName || 'South Delhi'})</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Drop Destination</p>
                <p className="text-sm font-bold text-slate-900">{order.dropName}</p>
                <p className="text-xs text-slate-600">{order.dropAddress}</p>
                <p className="text-xs font-mono text-slate-500">PIN: {order.dropPincode} ({order.dropZoneName || 'Gurugram'})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Payment Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Billing & Payment
            </h3>
            {order.paymentType === 'PREPAID' ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}
              >
                <Lock className="h-3 w-3" />
                {order.paymentStatus === 'PAID' ? 'PAID (Razorpay)' : 'PAYMENT PENDING'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                Cash on Delivery
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Actual Weight:</span>
              <span className="font-semibold text-slate-900">{order.actualWeightKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span>Volumetric Weight:</span>
              <span className="font-semibold text-slate-900">{order.volumetricWeightKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span>Billable Weight:</span>
              <span className="font-bold text-orange-600">{order.billableWeightKg} kg</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span>Base Delivery Charge:</span>
              <span className="font-semibold text-slate-900">₹{Number(order.baseCharge).toFixed(2)}</span>
            </div>
            {Number(order.codSurcharge) > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>COD Handling Surcharge:</span>
                <span className="font-semibold">₹{Number(order.codSurcharge).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Total Charge:</span>
              <span className="text-orange-600">₹{Number(order.totalCharge).toFixed(2)}</span>
            </div>

            {order.razorpayPaymentId && (
              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Razorpay Txn:</span>
                <span className="text-emerald-700 font-semibold">{order.razorpayPaymentId}</span>
              </div>
            )}

            {order.paymentType === 'PREPAID' && order.paymentStatus !== 'PAID' && (
              <div className="pt-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow hover:bg-orange-500 transition"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{Number(order.totalCharge).toFixed(2)} with Razorpay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Immutable Tracking Events Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
          Immutable Audit Log Timeline
        </h3>

        {trackingLoading ? (
          <p className="text-xs text-slate-500">Loading tracking history...</p>
        ) : trackingEvents.length === 0 ? (
          <p className="text-xs text-slate-500">No events recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {trackingEvents.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-orange-600 shadow" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {event.newStatus}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{event.remarks || 'Shipment update'}</h4>
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

      {/* Razorpay Checkout Modal */}
      {showPaymentModal && order && (
        <RazorpayCheckoutModal
          orderId={order.id}
          onSuccess={() => {
            setShowPaymentModal(false);
            refetchOrder();
            refetchTracking();
            refetchLive();
          }}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};
