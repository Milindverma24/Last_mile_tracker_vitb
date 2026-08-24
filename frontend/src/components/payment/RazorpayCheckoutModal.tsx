import React, { useState, useEffect } from 'react';
import { paymentApi, RazorpayOrderDetails, PaymentVerifyResult } from '../../api/paymentApi';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  ExternalLink,
  X,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  orderId: number;
  onSuccess: (result: PaymentVerifyResult) => void;
  onCancel: () => void;
}

export const RazorpayCheckoutModal: React.FC<Props> = ({ orderId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<RazorpayOrderDetails | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // 1. Load Razorpay script
    const loadScript = () => {
      if (window.Razorpay) {
        setSdkReady(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => {
        console.warn('Razorpay SDK failed to load from CDN. Sandbox fallback enabled.');
        setSdkReady(false);
      };
      document.body.appendChild(script);
    };

    loadScript();

    // 2. Fetch Razorpay order details from backend
    const initOrder = async () => {
      try {
        setLoading(true);
        const details = await paymentApi.createRazorpayOrder(orderId);
        setOrderDetails(details);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to initialize payment gateway.');
      } finally {
        setLoading(false);
      }
    };

    initOrder();
  }, [orderId]);

  const isDemoKey =
    !orderDetails?.keyId ||
    orderDetails?.keyId === 'YOUR_RAZORPAY_KEY_ID' ||
    orderDetails?.keyId === 'rzp_test_gatiman123' ||
    orderDetails?.keyId.includes('gatiman');

  const handleLaunchRazorpay = () => {
    if (!orderDetails) return;

    // If using simulated / placeholder key, trigger direct instant sandbox verification
    if (isDemoKey || !window.Razorpay) {
      handleSandboxDemoPay();
      return;
    }

    if (window.Razorpay) {
      const options = {
        key: orderDetails.keyId,
        amount: orderDetails.amountInPaise,
        currency: orderDetails.currency,
        name: orderDetails.companyName,
        description: orderDetails.description,
        image: '/logo.png',
        order_id: orderDetails.razorpayOrderId,
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.customerPhone,
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response: any) => {
          await handleVerifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay checkout window closed by user.');
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Error launching Razorpay modal:', err);
        handleSandboxDemoPay();
      }
    } else {
      handleSandboxDemoPay();
    }
  };

  const handleSandboxDemoPay = async () => {
    if (!orderDetails) return;
    const fakePaymentId = 'pay_sandbox_' + Math.random().toString(36).substring(2, 10);
    const sandboxSig = 'sandbox_verified_signature';
    await handleVerifyPayment(orderDetails.razorpayOrderId, fakePaymentId, sandboxSig);
  };

  const handleVerifyPayment = async (rzpOrderId: string, paymentId: string, signature: string) => {
    setVerifying(true);
    setErrorMsg(null);
    try {
      const result = await paymentApi.verifyPayment({
        orderId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });
      onSuccess(result);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Cryptographic verification failed. Please try again.');
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Razorpay Secure Checkout</h3>
              <p className="text-[11px] text-slate-500 font-medium">PCI-DSS 256-Bit SSL Encrypted Payment</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={verifying}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-slate-500 space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
            <p className="text-xs font-semibold">Initiating Razorpay payment order...</p>
          </div>
        ) : verifying ? (
          <div className="py-8 text-center text-slate-500 space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-xs font-bold text-emerald-700">Verifying cryptographic HMAC signature...</p>
          </div>
        ) : orderDetails ? (
          <div className="space-y-4">
            {/* Bill Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Shipment Reference:</span>
                <span className="font-mono font-bold text-slate-900">{orderDetails.trackingNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer Contact:</span>
                <span className="font-semibold text-slate-800">{orderDetails.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Razorpay Reference:</span>
                <span className="font-mono text-[11px] text-orange-600 font-semibold">{orderDetails.razorpayOrderId}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-800">Total Payable:</span>
                <span className="text-xl font-black text-slate-900">₹{Number(orderDetails.amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Supported Payment Channels */}
            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 text-[11px] text-orange-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                <span>UPI, Cards, NetBanking, Wallets</span>
              </div>
              <span className="font-bold text-orange-700">Instant Verification</span>
            </div>

            {/* Launch Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleLaunchRazorpay}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-bold text-white shadow hover:bg-orange-500 transition"
              >
                <Lock className="h-4 w-4" />
                Pay ₹{Number(orderDetails.amount).toFixed(2)} with Razorpay
              </button>

              <button
                type="button"
                onClick={handleSandboxDemoPay}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                1-Click Demo Sandbox Pay (Auto-Verify)
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
