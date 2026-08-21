import React from 'react';
import { Users, Building, Mail, Phone, MapPin } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const customers = [
    {
      id: 1,
      name: 'Priya Sharma',
      email: 'customer@gatiman.local',
      phone: '+91 98111 22233',
      type: 'B2C',
      zone: 'South Delhi Express Zone (110016)',
      totalBookings: 12,
    },
    {
      id: 2,
      name: 'Apex Global Logistics Pvt Ltd',
      email: 'enterprise@apex.com',
      phone: '+91 98222 55667',
      type: 'B2B',
      zone: 'Gurugram Cyber Hub (122002)',
      totalBookings: 84,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer & Enterprise Accounts</h1>
        <p className="text-sm text-slate-500">Registered retail B2C consumers and enterprise B2B shippers</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Customer / Organization</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Primary Zone</th>
              <th className="px-6 py-3 text-right">Lifetime Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                <td className="px-6 py-4">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    {c.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  <div>{c.email}</div>
                  <div className="text-slate-400">{c.phone}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-700">{c.zone}</td>
                <td className="px-6 py-4 text-right font-black text-slate-900">{c.totalBookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
