import { OrderStatus } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export interface StatusMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  description: string;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusMeta> = {
  CREATED: {
    label: 'Created',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
    description: 'Order placed, awaiting agent assignment',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    description: 'Delivery agent assigned, ready for pickup',
  },
  PICKED_UP: {
    label: 'Picked Up',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    description: 'Package picked up from sender',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    description: 'Package in transit between distribution hubs',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    description: 'Agent is on the way to recipient address',
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Package successfully delivered and signed',
  },
  FAILED: {
    label: 'Delivery Failed',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    description: 'Delivery attempt failed — reschedule available',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    description: 'New delivery date requested by customer',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
    dot: 'bg-gray-400',
    description: 'Order cancelled by customer or admin',
  },
};
