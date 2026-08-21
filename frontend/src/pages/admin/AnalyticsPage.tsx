import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  Truck,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const AdminAnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<string>('7d');
  const {
    dashboard,
    orderAnalytics,
    zoneAnalytics,
    agentPerformance,
    failureAnalytics,
    revenueAnalytics,
    isOrderAnalyticsLoading,
    refetchAll,
  } = useAnalytics(range);

  const statusData = orderAnalytics?.statusDistribution
    ? Object.entries(orderAnalytics.statusDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const failureData = failureAnalytics?.failureByReason
    ? Object.entries(failureAnalytics.failureByReason).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Operations Intelligence & SLA Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Real-time delivery performance, SLA completion metrics, failure clustering, and zone analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {[
              { label: 'Today', value: 'today' },
              { label: '7 Days', value: '7d' },
              { label: '30 Days', value: '30d' },
              { label: '90 Days', value: '90d' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRange(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  range === tab.value
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetchAll()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            title="Refresh All Analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <Package className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {orderAnalytics?.totalOrders ?? dashboard?.totalOrders ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Platform Volume</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {orderAnalytics?.deliveredOrders ?? dashboard?.deliveredOrders ?? 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Success: {orderAnalytics?.successRate ?? 100}%
          </span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Failed</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">
            {orderAnalytics?.failedOrders ?? dashboard?.failedOrders ?? 0}
          </p>
          <span className="text-[11px] text-rose-600 font-semibold">
            Failure: {orderAnalytics?.failureRate ?? 0}%
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Rescheduled</span>
            <CalendarClock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">
            {orderAnalytics?.rescheduledOrders ?? dashboard?.rescheduledOrders ?? 0}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold">
            Rate: {orderAnalytics?.rescheduleRate ?? 0}%
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Active</span>
            <Truck className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {dashboard?.availableAgents ?? 0}/{dashboard?.totalAgents ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Available Drivers</span>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Charges</span>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2">
            ₹{revenueAnalytics?.totalDeliveryCharges ?? dashboard?.totalRevenue ?? 0}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold">Realized Logistics</span>
        </div>
      </div>

      {/* Chart Row 1: Daily Trend & Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend Area Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Order Booking & Delivery Velocity</h3>
              <p className="text-xs text-slate-500">Chronological distribution of total created vs successfully delivered shipments</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {range.toUpperCase()} Range
            </span>
          </div>

          <div className="h-72 w-full">
            {orderAnalytics?.dailyTrends && orderAnalytics.dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderAnalytics.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalCount"
                    name="Total Orders"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="deliveredCount"
                    name="Delivered"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDelivered)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No trend points recorded for selected interval
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Current fleet order state machine breakdown</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={80} />
                <Tooltip />
                <Bar dataKey="value" name="Orders" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Failure Analytics & Revenue Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Failure Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Delivery Failure Root-Cause Analysis</h3>
              <p className="text-xs text-slate-500">Distribution of exceptions preventing successful first-attempt drops</p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {failureAnalytics?.totalFailures || 0} Total Failures
            </span>
          </div>

          <div className="h-64 w-full">
            {failureData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Zero delivery failure incidents recorded!
              </div>
            )}
          </div>
        </div>

        {/* Realized Delivery Charges */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Delivery Charges Composition</h3>
              <p className="text-xs text-slate-500">Base weight charge vs COD surcharges & Route categories</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              ₹{revenueAnalytics?.totalDeliveryCharges || 0} Realized
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase">Base Transport Charges</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{revenueAnalytics?.baseCharges || 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase">COD Cash Handling</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{revenueAnalytics?.codSurcharges || 0}</p>
            </div>
            <div className="rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-100">
              <span className="text-xs text-indigo-700 font-semibold uppercase">B2B Volume Charges</span>
              <p className="text-lg font-bold text-indigo-900 mt-1">₹{revenueAnalytics?.b2bCharges || 0}</p>
            </div>
            <div className="rounded-xl bg-emerald-50/50 p-3.5 border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold uppercase">B2C Retail Charges</span>
              <p className="text-lg font-bold text-emerald-900 mt-1">₹{revenueAnalytics?.b2cCharges || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Zone Performance & Agent Fleet Matrix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Zone Logistics Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Zone Logistics & SLA Fulfillment</h3>
          <p className="text-xs text-slate-500 mb-4">Volume, delivery count, and revenue realization by logistics cluster</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase">
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Pickups</th>
                  <th className="py-2.5 px-3">Drops</th>
                  <th className="py-2.5 px-3">Delivered</th>
                  <th className="py-2.5 px-3 text-right">Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zoneAnalytics.map((z) => (
                  <tr key={z.zoneId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{z.zoneName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{z.zoneCode}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{z.pickupCount}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{z.dropCount}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">{z.deliveredCount}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{z.totalCharges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet & Agent Performance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Delivery Agent Fleet Efficiency</h3>
          <p className="text-xs text-slate-500 mb-4">Driver partner active quota, total completed drops, and SLA score</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase">
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Active Load</th>
                  <th className="py-2.5 px-3">Completed</th>
                  <th className="py-2.5 px-3">Success Rate</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentPerformance.map((a) => (
                  <tr key={a.agentId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{a.agentName}</span>
                      <span className="text-[10px] text-slate-400 block">{a.vehicleNumber} ({a.vehicleType})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-800">
                        {a.currentWorkload}/{a.maxActiveOrders}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">{a.completedTotal}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-emerald-600">{a.successRate}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {a.isAvailable ? 'ON DUTY' : 'OFFLINE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
