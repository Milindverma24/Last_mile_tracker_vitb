import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, CustomerAccount } from '../../api/adminApi';
import {
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Search,
  RefreshCw,
  Calendar,
  Sparkles,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'B2C' | 'B2B'>('ALL');

  const {
    data: customers = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<CustomerAccount[]>({
    queryKey: ['admin-customers'],
    queryFn: adminApi.getCustomers,
    refetchInterval: 10000,
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesType = filterType === 'ALL' || c.type === filterType;
    const matchesSearch =
      searchTerm.trim() === '' ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pinCode?.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  const b2cCount = customers.filter((c) => c.type === 'B2C').length;
  const b2bCount = customers.filter((c) => c.type === 'B2B').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-600" />
            Customer & Enterprise Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live directory of registered retail B2C consumers and verified enterprise B2B shippers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
            <span>{customers.length} Total Users</span>
            <span className="text-indigo-300">•</span>
            <span>{b2cCount} B2C</span>
            <span className="text-indigo-300">•</span>
            <span>{b2bCount} B2B</span>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, city or PIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'B2C', 'B2B'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Customers' : type === 'B2C' ? 'Personal (B2C)' : 'Business (B2B)'}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <span className="text-xs font-medium">Loading live customer records...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No customer accounts found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? 'No registered customers match your search criteria.' : 'No customer accounts registered yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Customer / Organization</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Address & Zone</th>
                  <th className="px-6 py-3.5 text-right">Lifetime Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id || c.userId} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 uppercase">
                          {c.name ? c.name.slice(0, 2) : 'CU'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {c.name}
                            {c.companyName && (
                              <span className="text-xs font-semibold text-slate-500">
                                ({c.companyName})
                              </span>
                            )}
                          </div>
                          {c.gstNumber && (
                            <div className="text-[11px] font-mono text-slate-500">
                              GST: {c.gstNumber}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            Joined {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                          c.type === 'B2B'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {c.type === 'B2B' ? <Building className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                        {c.type || 'B2C'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {c.phone && c.phone !== '—' ? c.phone : <span className="italic text-slate-400">No phone yet</span>}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-700">
                      <div className="flex items-start gap-1.5 max-w-xs">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {c.address ? c.address : <span className="italic text-slate-400 font-normal">Address pending onboarding</span>}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {c.zone || 'Delhi NCR Region'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-900">
                        <Package className="h-3.5 w-3.5 text-slate-500" />
                        {c.totalBookings || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
