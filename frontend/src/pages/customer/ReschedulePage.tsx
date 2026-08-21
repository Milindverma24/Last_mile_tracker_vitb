import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rescheduleSchema, RescheduleFormData } from '../../schemas/rescheduleSchema';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const CustomerReschedulePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdParam = searchParams.get('orderId');

  const { data: orders = [], isLoading } = useOrders();
  const { reschedule } = useOrderMutations();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orderIdParam || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eligibleOrders = orders.filter((o) => o.status === 'FAILED' || o.status === 'CREATED');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      requestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      preferredTimeSlot: '10:00 AM - 01:00 PM (Morning Slot)',
      reason: 'Customer was away during previous delivery attempt',
      rescheduleNotes: 'Please ring the doorbell twice or leave with security.',
    },
  });

  const onSubmit = async (data: RescheduleFormData) => {
    if (!selectedOrderId) {
      setErrorMessage('Please select a shipment to reschedule');
      return;
    }

    setErrorMessage(null);
    try {
      await reschedule.mutateAsync({
        id: selectedOrderId,
        payload: {
          requestedDate: data.requestedDate,
          preferredTimeSlot: data.preferredTimeSlot,
          reason: data.reason,
          rescheduleNotes: data.rescheduleNotes,
        },
      });

      setSuccessMessage('Delivery successfully rescheduled! A new driver has been reassigned.');
      setTimeout(() => {
        navigate(`/customer/orders/${selectedOrderId}/track`);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to reschedule delivery.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reschedule Delivery Slot
        </h1>
        <p className="text-sm text-slate-500">
          Choose a new delivery date and preferred arrival window for failed or pending shipments
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Select Order */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Shipment
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
            >
              <option value="">-- Select shipment to reschedule --</option>
              {eligibleOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.trackingNumber} — {o.dropName} ({o.status})
                </option>
              ))}
            </select>
          </div>

          {/* Reschedule Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              New Preferred Date
            </label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('requestedDate')}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
            {errors.requestedDate && <p className="mt-1 text-xs text-rose-600">{errors.requestedDate.message}</p>}
          </div>

          {/* Preferred Slot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Preferred Delivery Time Window
            </label>
            <div className="relative mt-1.5">
              <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                {...register('preferredTimeSlot')}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
              >
                <option value="09:00 AM - 12:00 PM (Morning Slot)">09:00 AM - 12:00 PM (Morning Slot)</option>
                <option value="12:00 PM - 03:00 PM (Afternoon Slot)">12:00 PM - 03:00 PM (Afternoon Slot)</option>
                <option value="03:00 PM - 06:00 PM (Evening Slot)">03:00 PM - 06:00 PM (Evening Slot)</option>
                <option value="06:00 PM - 09:00 PM (Night Express)">06:00 PM - 09:00 PM (Night Express)</option>
              </select>
            </div>
            {errors.preferredTimeSlot && (
              <p className="mt-1 text-xs text-rose-600">{errors.preferredTimeSlot.message}</p>
            )}
          </div>

          {/* Reason & Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reschedule Reason & Delivery Instructions
            </label>
            <textarea
              rows={3}
              {...register('rescheduleNotes')}
              placeholder="e.g. Please deliver after 5 PM or leave with reception..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              to="/customer/orders"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || reschedule.isPending}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting || reschedule.isPending ? 'Rescheduling...' : 'Confirm New Delivery Slot'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
