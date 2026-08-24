import React, { useState } from 'react';
import { useReschedules } from '../../hooks/useReschedules';
import { useAgents } from '../../hooks/useAgents';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Truck,
  User,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
} from 'lucide-react';

export const AdminRescheduleRequestsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reviewModalMode, setReviewModalMode] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [overrideAgentId, setOverrideAgentId] = useState<number | undefined>(undefined);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, approveAsync, rejectAsync, isApproving, isRejecting, refetch } =
    useReschedules(statusFilter);

  const { data: agents = [] } = useAgents();

  const requests = data?.content || [];

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dropZoneName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionError(null);
    try {
      await approveAsync({ id: selectedRequest.id, overrideAgentId });
      setActionSuccess(`Reschedule request for ${selectedRequest.trackingNumber} approved successfully.`);
      setReviewModalMode(null);
      setSelectedRequest(null);
      setOverrideAgentId(undefined);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to approve reschedule request.');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      setActionError('Please specify a valid rejection reason.');
      return;
    }
    setActionError(null);
    try {
      await rejectAsync({ id: selectedRequest.id, reason: rejectionReason });
      setActionSuccess(`Reschedule request for ${selectedRequest.trackingNumber} rejected.`);
      setReviewModalMode(null);
      setSelectedRequest(null);
      setRejectionReason('');
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to reject reschedule request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarClock className="h-7 w-7 text-orange-600" />
            Customer Reschedule Queue
          </h1>
          <p className="text-sm text-slate-500">
            Review, approve, and automatically reassign delivery drivers for failed shipment reschedules
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-orange-600 text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by tracking number, customer name, destination zone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-orange-600 focus:outline-none"
        />
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading reschedule requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CalendarClock className="h-10 w-10 mx-auto mb-3 text-slate-400" />
            <p className="font-semibold">No reschedule requests found</p>
            <p className="text-xs text-slate-400 mt-1">There are no pending customer requests for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Shipment</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Requested Date & Slot</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-orange-700">{req.trackingNumber}</span>
                      <p className="text-xs text-slate-500">{req.dropZoneName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{req.customerName}</p>
                      <p className="text-xs text-slate-400">{req.dropAddress}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <CalendarClock className="h-4 w-4 text-orange-600" />
                        {req.requestedDate}
                      </div>
                      <p className="text-xs text-slate-500">{req.preferredTimeSlot || 'Standard Delivery Window'}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-xs font-medium text-slate-700">{req.reason || 'Customer preference'}</p>
                      {req.rescheduleNotes && (
                        <p className="text-xs text-slate-400 truncate">{req.rescheduleNotes}</p>
                      )}
                      {req.rejectionReason && (
                        <p className="text-xs text-rose-600 font-medium mt-0.5">Rejected: {req.rejectionReason}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setReviewModalMode('APPROVE');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow hover:bg-emerald-500 transition"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setReviewModalMode('REJECT');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs hover:bg-rose-100 transition"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Reviewed by {req.reviewedByName || 'Admin'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalMode && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {reviewModalMode === 'APPROVE' ? 'Approve Reschedule Request' : 'Reject Reschedule Request'}
              </h2>
              <button
                onClick={() => {
                  setReviewModalMode(null);
                  setSelectedRequest(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 text-xs space-y-1 text-slate-600 border border-slate-200">
              <p><strong className="text-slate-800">Order:</strong> {selectedRequest.trackingNumber}</p>
              <p><strong className="text-slate-800">Customer:</strong> {selectedRequest.customerName}</p>
              <p><strong className="text-slate-800">Destination:</strong> {selectedRequest.dropAddress} ({selectedRequest.dropZoneName})</p>
              <p><strong className="text-slate-800">Requested Delivery Date:</strong> {selectedRequest.requestedDate}</p>
              <p><strong className="text-slate-800">Customer Reason:</strong> {selectedRequest.reason || 'None specified'}</p>
            </div>

            {reviewModalMode === 'APPROVE' ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assign Delivery Partner (Optional Override)
                </label>
                <select
                  value={overrideAgentId || ''}
                  onChange={(e) => setOverrideAgentId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
                >
                  <option value="">⚡ Auto-assign nearest available driver in zone (Recommended)</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id} disabled={!a.isAvailable || a.currentActiveOrders >= a.maxActiveOrders}>
                      {a.name} ({a.vehicleNumber}) — Load: {a.currentActiveOrders}/{a.maxActiveOrders} {a.isAvailable ? '✓ Available' : '✕ Offline'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  On approval, a new delivery attempt (#2) will be created, and the order will advance to <strong>ASSIGNED</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rejection Reason (Required)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Schedule capacity full on requested date. Please select another slot..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setReviewModalMode(null);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              {reviewModalMode === 'APPROVE' ? (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isApproving ? 'Approving...' : 'Confirm Approval & Assign'}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm shadow hover:bg-rose-500 disabled:opacity-50"
                >
                  {isRejecting ? 'Rejecting...' : 'Reject Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
