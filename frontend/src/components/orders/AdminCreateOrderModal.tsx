import React, { useState, useEffect } from 'react';
import { adminApi, CustomerAccount } from '../../api/adminApi';
import { orderApi } from '../../api/orderApi';
import { ChargePreviewResult } from '../../types';
import {
  X,
  Package,
  User,
  MapPin,
  Calculator,
  AlertCircle,
  Zap,
  Car,
  Truck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface AdminCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (trackingNumber: string) => void;
}

export const AdminCreateOrderModal: React.FC<AdminCreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [customerType, setCustomerType] = useState<'B2C' | 'B2B'>('B2C');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');

  const [pickupName, setPickupName] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPincode, setPickupPincode] = useState('110016');

  const [dropName, setDropName] = useState('');
  const [dropPhone, setDropPhone] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [dropPincode, setDropPincode] = useState('122002');

  const [actualWeightKg, setActualWeightKg] = useState<number>(2.5);
  const [lengthCm, setLengthCm] = useState<number>(25);
  const [breadthCm, setBreadthCm] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<number>(15);
  const [packageDescription, setPackageDescription] = useState('Express Logistics Box');

  const [chargePreview, setChargePreview] = useState<ChargePreviewResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      adminApi.getCustomers().then((data) => {
        setCustomers(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedCustomerId(first.id);
          setPickupName(first.name);
          setPickupPhone(first.phone);
          setPickupAddress(first.address || 'Hauz Khas Village');
          setPickupPincode(first.pinCode || '110016');
          setCustomerType(first.type === 'B2B' ? 'B2B' : 'B2C');
        }
      });
    }
  }, [isOpen]);

  const handleCustomerChange = (cId: number) => {
    setSelectedCustomerId(cId);
    const found = customers.find((c) => c.id === cId);
    if (found) {
      setPickupName(found.name);
      setPickupPhone(found.phone);
      if (found.address) setPickupAddress(found.address);
      if (found.pinCode) setPickupPincode(found.pinCode);
      setCustomerType(found.type === 'B2B' ? 'B2B' : 'B2C');
    }
  };

  const calculateCharge = async () => {
    if (!pickupPincode || !dropPincode) return;
    setIsCalculating(true);
    setError(null);
    try {
      const preview = await orderApi.calculateCharge({
        customerType,
        paymentType,
        pickupPincode,
        dropPincode,
        lengthCm,
        breadthCm,
        heightCm,
        actualWeightKg,
      });
      setChargePreview(preview);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Price calculation failed. Verify pin codes.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (isOpen && pickupPincode && dropPincode && actualWeightKg > 0) {
      calculateCharge();
    }
  }, [customerType, paymentType, pickupPincode, dropPincode, actualWeightKg, lengthCm, breadthCm, heightCm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupName || !dropName || !pickupAddress || !dropAddress) {
      setError('Please fill in all pickup and recipient contact fields.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await orderApi.createOrder({
        customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        customerType,
        paymentType,
        pickupName,
        pickupPhone,
        pickupAddress,
        pickupPincode,
        dropName,
        dropPhone,
        dropAddress,
        dropPincode,
        actualWeightKg,
        lengthCm,
        breadthCm,
        heightCm,
        packageDescription,
      });
      onOrderCreated(res.trackingNumber);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create order on behalf of customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create Dispatch on Behalf of Customer</h2>
              <p className="text-xs text-slate-500">Autonomous driver pairing and volumetric rate card pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Customer Selection */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2">
            <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-600" /> Select Customer Account
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) — [{c.type}]
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as any)}
                  className="w-1/2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-1/2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pickup and Drop Address Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Origin / Pickup
              </span>
              <input
                type="text"
                placeholder="Sender Name"
                value={pickupName}
                onChange={(e) => setPickupName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                type="text"
                placeholder="Sender Phone (+91 ...)"
                value={pickupPhone}
                onChange={(e) => setPickupPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                type="text"
                placeholder="Full Street Address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                type="text"
                placeholder="PIN Code (e.g. 110016)"
                value={pickupPincode}
                onChange={(e) => setPickupPincode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
                required
              />
            </div>

            {/* Drop */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-600" /> Destination / Recipient
              </span>
              <input
                type="text"
                placeholder="Recipient Name"
                value={dropName}
                onChange={(e) => setDropName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                type="text"
                placeholder="Recipient Phone (+91 ...)"
                value={dropPhone}
                onChange={(e) => setDropPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                type="text"
                placeholder="Full Street Address"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                type="text"
                placeholder="PIN Code (e.g. 122002)"
                value={dropPincode}
                onChange={(e) => setDropPincode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Package Weight & Dimensions */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-indigo-600" /> Package Specifications
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={actualWeightKg}
                  onChange={(e) => setActualWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">L (cm)</label>
                <input
                  type="number"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">B (cm)</label>
                <input
                  type="number"
                  value={breadthCm}
                  onChange={(e) => setBreadthCm(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">H (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Package Content Description"
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
            />
          </div>

          {/* Real-time Rate Card Calculation Preview */}
          {chargePreview && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-950">Auto-Calculated Dispatch Charge:</span>
                    <span className="text-lg font-black text-emerald-700">₹{chargePreview.totalCharge}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-medium">
                    Route: <span className="font-bold">{chargePreview.routeType}</span> | Billable Weight:{' '}
                    <span className="font-bold">{chargePreview.billableWeightKg} kg</span> (Volumetric:{' '}
                    {chargePreview.volumetricWeightKg} kg)
                    {chargePreview.codSurcharge && Number(chargePreview.codSurcharge) > 0 && ` | COD Surcharge: ₹${chargePreview.codSurcharge}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Rate Card Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCalculating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? 'Creating Dispatch...' : 'Confirm & Auto-Dispatch'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
