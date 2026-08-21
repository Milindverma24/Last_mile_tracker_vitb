import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  emailApi,
  EmailLogItem,
  EmailStats,
  EmailEventType,
  EmailStatus,
} from '../../api/emailApi';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Search,
  ExternalLink,
  Eye,
  Filter,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
  Code,
  Smartphone,
  Monitor,
  Radio,
  Check,
  Copy,
} from 'lucide-react';

const EVENT_TYPE_CONFIG: Record<
  EmailEventType,
  { label: string; badgeColor: string; icon: string }
> = {
  ORDER_CREATED: { label: 'Order Created', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '📝' },
  ORDER_CONFIRMED: { label: 'Order Confirmed', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  AGENT_ASSIGNED: { label: 'Partner Assigned', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', icon: '👤' },
  ORDER_PREPARING: { label: 'Preparing', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', icon: '📦' },
  ORDER_READY: { label: 'Ready for Pickup', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', icon: '📦' },
  PICKED_UP: { label: 'Picked Up', badgeColor: 'bg-violet-50 text-violet-700 border-violet-200', icon: '📦' },
  ON_THE_WAY: { label: 'On The Way', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🚚' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🚚' },
  NEAR_DESTINATION: { label: 'Near Destination', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📍' },
  DELIVERED: { label: 'Delivered', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🎉' },
  DELIVERY_CANCELLED: { label: 'Cancelled', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200', icon: '❌' },
  DELIVERY_DELAYED: { label: 'Delayed', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', icon: '⏱️' },
  DELIVERY_FAILED: { label: 'Attempt Failed', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', icon: '⚠️' },
  RESCHEDULE_APPROVED: { label: 'Rescheduled', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200', icon: '📅' },
  RESCHEDULE_REJECTED: { label: 'Reschedule Rejected', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', icon: '⚠️' },
};

const ALL_EVENT_TYPES: EmailEventType[] = [
  'ORDER_CREATED',
  'ORDER_CONFIRMED',
  'AGENT_ASSIGNED',
  'ORDER_PREPARING',
  'ORDER_READY',
  'PICKED_UP',
  'ON_THE_WAY',
  'NEAR_DESTINATION',
  'DELIVERED',
  'DELIVERY_DELAYED',
  'DELIVERY_FAILED',
  'DELIVERY_CANCELLED',
  'RESCHEDULE_APPROVED',
  'RESCHEDULE_REJECTED',
];

export const EmailMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'gallery' | 'test'>('logs');
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Preview Modal state
  const [previewLog, setPreviewLog] = useState<EmailLogItem | null>(null);

  // Gallery state
  const [galleryEventType, setGalleryEventType] = useState<EmailEventType>('ON_THE_WAY');
  const [galleryHtml, setGalleryHtml] = useState<string>('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Test send form
  const [testEmail, setTestEmail] = useState('admin@gatiman.local');
  const [testEventType, setTestEventType] = useState<EmailEventType>('ON_THE_WAY');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchStats = async () => {
    try {
      const data = await emailApi.getEmailStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load email stats', e);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, size: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (eventTypeFilter !== 'ALL') params.eventType = eventTypeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await emailApi.getEmailLogs(params);
      setLogs(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error('Failed to load email logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, eventTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const handleRetry = async (logId: number) => {
    try {
      await emailApi.retryEmail(logId);
      fetchLogs();
      fetchStats();
    } catch (e) {
      console.error('Failed to retry email', e);
    }
  };

  const loadGalleryTemplate = async (type: EmailEventType) => {
    setGalleryEventType(type);
    setGalleryLoading(true);
    try {
      const html = await emailApi.previewEmailTemplate(type);
      setGalleryHtml(html);
    } catch (e) {
      console.error('Failed to preview template', e);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadGalleryTemplate(galleryEventType);
    }
  }, [activeTab]);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const msg = await emailApi.sendTestEmail({
        toEmail: testEmail,
        eventType: testEventType,
      });
      setTestResult({ success: true, msg });
      fetchStats();
      fetchLogs();
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.response?.data?.message || 'Failed to dispatch test email',
      });
    } finally {
      setTestSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Email Notification Hub</h1>
              <p className="text-xs text-slate-500">
                Centralized monitoring, automated delivery milestone dispatches, and template inspector
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-600" /> Refresh
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" /> Send Test Email
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Dispatched</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats ? stats.totalEmails : '...'}
          </div>
          <div className="mt-1 text-xs text-slate-500">Across 14 automated milestone events</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Successfully Sent</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {stats ? stats.sentCount : '...'}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-semibold">
            {stats ? `${stats.successRate}% Success Rate` : '...'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Failed / Retrying</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {stats ? stats.failedCount : '...'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats && stats.retryingCount > 0 ? `${stats.retryingCount} retrying now` : 'Zero pending errors'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Deduplication</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">100% Active</div>
          <div className="mt-1 text-xs text-slate-500">Idempotency protection enabled</div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Radio className="h-4 w-4" /> Live Dispatch Audit Trail
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Template Gallery &amp; Inspector
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'test'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Send className="h-4 w-4" /> Dispatch Test Console
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: LIVE DISPATCH AUDIT LOGS
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Tracking #, Recipient Email, Subject..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
                />
              </form>

              {/* Status filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {['ALL', 'SENT', 'PENDING', 'FAILED', 'RETRYING'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(0);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Event type dropdown filter */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-500">Event Milestone:</span>
              <select
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Event Milestones</option>
                {ALL_EVENT_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {EVENT_TYPE_CONFIG[et]?.label || et}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-3" />
                Querying email dispatch audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Mail className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No email logs found</p>
                <p className="text-xs">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'Try broadening your search criteria.'
                    : 'Emails will be logged automatically as orders progress through delivery milestones.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Event Milestone</th>
                      <th className="px-5 py-3.5">Order Tracking #</th>
                      <th className="px-5 py-3.5">Recipient</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Sent Timestamp</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((logItem) => {
                      const eventCfg = EVENT_TYPE_CONFIG[logItem.eventType] || {
                        label: logItem.eventType,
                        badgeColor: 'bg-slate-100 text-slate-700',
                        icon: '✉️',
                      };
                      return (
                        <tr key={logItem.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                logItem.status === 'SENT'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : logItem.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : logItem.status === 'RETRYING'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {logItem.status === 'SENT' && <CheckCircle2 className="h-3 w-3" />}
                              {logItem.status === 'FAILED' && <AlertCircle className="h-3 w-3" />}
                              {logItem.status === 'RETRYING' && <RotateCw className="h-3 w-3 animate-spin" />}
                              {logItem.status}
                            </span>
                            {logItem.retryCount > 0 && (
                              <span className="block text-[9px] text-slate-400 mt-0.5 font-mono">
                                Retry #{logItem.retryCount}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${eventCfg.badgeColor}`}
                            >
                              <span>{eventCfg.icon}</span>
                              <span>{eventCfg.label}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">
                            <Link to={`/track/${logItem.trackingNumber}`} target="_blank" className="hover:underline flex items-center gap-1">
                              {logItem.trackingNumber}
                              <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                            </Link>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900">{logItem.recipientName || 'Customer'}</div>
                            <div className="text-slate-500 font-mono text-[10px]">{logItem.recipientEmail}</div>
                          </td>
                          <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-700 font-medium">
                            {logItem.subject}
                            {logItem.failureReason && (
                              <div className="text-rose-600 text-[10px] truncate mt-0.5" title={logItem.failureReason}>
                                Err: {logItem.failureReason}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {logItem.sentAt ? new Date(logItem.sentAt).toLocaleString() : 'Pending'}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {logItem.status === 'FAILED' && (
                                <button
                                  onClick={() => handleRetry(logItem.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                >
                                  <RotateCw className="h-3 w-3" /> Retry
                                </button>
                              )}
                              <button
                                onClick={() => setPreviewLog(logItem)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition cursor-pointer"
                              >
                                <Eye className="h-3 w-3" /> Preview
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50 text-xs">
                <span className="text-slate-500">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: TEMPLATE GALLERY & LIVE INSPECTOR
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left: Template Selector */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Select Milestone Event Template
            </h3>
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {ALL_EVENT_TYPES.map((type) => {
                const cfg = EVENT_TYPE_CONFIG[type];
                const active = galleryEventType === type;
                return (
                  <button
                    key={type}
                    onClick={() => loadGalleryTemplate(type)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition cursor-pointer text-left ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Live Preview Frame */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  {EVENT_TYPE_CONFIG[galleryEventType]?.label} Preview
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Production HTML
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(galleryHtml)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  {copiedHtml ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedHtml ? 'Copied HTML' : 'Copy HTML'}
                </button>
                <button
                  onClick={() => {
                    setTestEventType(galleryEventType);
                    setActiveTab('test');
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  <Send className="h-3 w-3" /> Test Send
                </button>
              </div>
            </div>

            {/* Iframe Viewport */}
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm flex justify-center">
              {galleryLoading ? (
                <div className="h-96 flex items-center justify-center text-xs text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mr-2" />
                  Generating HTML template...
                </div>
              ) : (
                <iframe
                  title="Email Template Preview"
                  srcDoc={galleryHtml}
                  className="w-full max-w-[620px] h-[700px] rounded-xl border border-slate-200 shadow-md bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 3: DISPATCH TEST CONSOLE
      ═════════════════════════════════════════════════════════ */}
      {activeTab === 'test' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Dispatch Test Email</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Send a test delivery milestone notification to any target inbox using live rendered order telemetry.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="e.g. yourname@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Milestone Event Type
              </label>
              <select
                value={testEventType}
                onChange={(e) => setTestEventType(e.target.value as EmailEventType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-semibold"
              >
                {ALL_EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_CONFIG[type]?.icon} {EVENT_TYPE_CONFIG[type]?.label} ({type})
                  </option>
                ))}
              </select>
            </div>

            {testResult && (
              <div
                className={`rounded-xl border p-4 text-xs font-semibold flex items-start gap-2 ${
                  testResult.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.success ? 'Dispatch Success' : 'Dispatch Error'}</p>
                  <p className="mt-0.5 font-normal">{testResult.msg}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={testSending}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
              >
                {testSending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          PREVIEW MODAL (FOR AUDIT LOG ROWS)
      ═════════════════════════════════════════════════════════ */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{previewLog.subject}</span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {previewLog.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  To: <strong className="text-slate-700">{previewLog.recipientEmail}</strong> · Order #{previewLog.trackingNumber}
                </p>
              </div>
              <button
                onClick={() => setPreviewLog(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Iframe) */}
            <div className="flex-1 p-4 bg-slate-100 overflow-y-auto flex justify-center">
              <iframe
                title="Rendered Email Log"
                srcDoc={previewLog.htmlContent || '<p>No content</p>'}
                className="w-full max-w-[600px] h-[600px] rounded-xl border border-slate-200 shadow-md bg-white"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Log ID: {previewLog.id} · Idempotency: {previewLog.idempotencyKey}
              </span>
              <div className="flex gap-2">
                {previewLog.status === 'FAILED' && (
                  <button
                    onClick={() => {
                      handleRetry(previewLog.id);
                      setPreviewLog(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Retry Dispatch
                  </button>
                )}
                <button
                  onClick={() => setPreviewLog(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
