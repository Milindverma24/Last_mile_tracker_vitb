import React from 'react';
import { useRateCards } from '../../hooks/useRateCards';
import { CreditCard, PlusCircle, CheckCircle2, Layers } from 'lucide-react';

export const AdminRateCardsPage: React.FC = () => {
  const { data: rateCards = [], isLoading } = useRateCards();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dynamic Rate Cards & Weight Slabs
          </h1>
          <p className="text-sm text-slate-500">
            Configure volumetric pricing formulas, weight slab tiers, and COD handling fees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {rateCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    {card.customerType}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {card.routeType}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{card.name}</h3>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                Active
              </span>
            </div>

            {/* Surcharge details */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="text-slate-500">COD Surcharge Fee:</span>
              <span className="font-bold text-slate-900">
                ₹{card.codSurchargeFlat} + {card.codSurchargePercentage}% of base price
              </span>
            </div>

            {/* Weight Slab Rules Table */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Weight Slabs & Base Pricing
              </p>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="p-2.5">Weight Range</th>
                      <th className="p-2.5">Base Rate</th>
                      <th className="p-2.5">Extra / kg Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {card.rules?.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-semibold text-slate-900">
                          {r.minWeightKg} kg – {r.maxWeightKg} kg
                        </td>
                        <td className="p-2.5 text-slate-700 font-bold">₹{r.basePrice}</td>
                        <td className="p-2.5 text-slate-500">
                          {Number(r.perKgRateAboveMin) > 0 ? `+₹${r.perKgRateAboveMin}/kg` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
