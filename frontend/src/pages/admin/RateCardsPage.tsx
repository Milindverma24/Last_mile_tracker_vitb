import React, { useState } from 'react';
import { useRateCards } from '../../hooks/useRateCards';
import {
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Layers,
  Truck,
  Car,
  Bike,
  Zap,
  Filter,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Percent,
  Banknote,
  Scale,
  RefreshCw,
} from 'lucide-react';

export const AdminRateCardsPage: React.FC = () => {
  const { data: rateCards = [], isLoading, refetch } = useRateCards();
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');

  // Interactive Live Rate Sandbox Calculator
  const [calcWeight, setCalcWeight] = useState<number>(3.5);
  const [calcRoute, setCalcRoute] = useState<'INTRA_ZONE' | 'INTER_ZONE' | 'INTER_STATE'>('INTRA_ZONE');
  const [calcCustomer, setCalcCustomer] = useState<'B2C' | 'B2B'>('B2C');

  const filteredCards = rateCards.filter((c) => {
    const matchesRoute =
      routeFilter === 'ALL' ||
      (routeFilter === 'INTRA' && (c.routeType === 'INTRA_ZONE' || c.routeType === 'INTRA_CITY')) ||
      (routeFilter === 'INTER_CITY' && (c.routeType === 'INTER_ZONE' || c.routeType === 'INTER_CITY')) ||
      (routeFilter === 'INTER_STATE' && c.routeType === 'INTER_STATE');

    const matchesCustomer = customerTypeFilter === 'ALL' || c.customerType === customerTypeFilter;
    return matchesRoute && matchesCustomer;
  });

  const getRouteMeta = (routeType: string) => {
    switch (routeType) {
      case 'INTER_STATE':
        return { label: 'Inter-State National', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'INTER_ZONE':
      case 'INTER_CITY':
        return { label: 'Inter-City Regional', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'INTRA_ZONE':
      case 'INTRA_CITY':
      default:
        return { label: 'Intra-City Local', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getVehicleTier = (maxWeightKg: number) => {
    if (maxWeightKg <= 5) {
      return {
        label: 'Two-Wheeler',
        Icon: Zap,
        color: 'text-emerald-600',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (maxWeightKg <= 25) {
      return {
        label: 'Four-Wheeler Van',
        Icon: Car,
        color: 'text-blue-600',
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    return {
      label: 'Cargo Tempo / Truck',
      Icon: Truck,
      color: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  };

  // Estimate simulated cost from active rate cards
  const calculateSimulatedCost = () => {
    const matchedCard = rateCards.find(
      (c) => (c.routeType === calcRoute || (calcRoute === 'INTER_ZONE' && c.routeType === 'INTER_CITY')) && c.customerType === calcCustomer
    );
    if (!matchedCard || !matchedCard.rules || matchedCard.rules.length === 0) {
      return 50.0;
    }

    const matchedRule = matchedCard.rules.find(
      (r) => calcWeight >= Number(r.minWeightKg) && calcWeight <= Number(r.maxWeightKg)
    ) || matchedCard.rules[matchedCard.rules.length - 1];

    let base = Number(matchedRule.basePrice) || 50;
    let extra = 0;
    if (Number(matchedRule.perKgRateAboveMin) > 0 && calcWeight > Number(matchedRule.minWeightKg)) {
      extra = (calcWeight - Number(matchedRule.minWeightKg)) * Number(matchedRule.perKgRateAboveMin);
    }
    return (base + extra).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-orange-600" />
            Dynamic Rate Cards & Weight Slabs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Volumetric pricing formulas, weight slab ladders, and vehicle tier billing for Local, Inter-Zone, and Inter-State dispatches
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-orange-600" /> Refresh Rates
        </button>
      </div>

      {/* 2. Live Pricing Simulator Sandbox */}
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-slate-50 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-wider">
              <Calculator className="h-4 w-4 text-orange-600" />
              <span>Live Rate Calculation Simulator</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulate customer billing and driver compensation by testing weight and route parameters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Weight Input */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Scale className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">Weight:</span>
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="500"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Math.max(0.1, Number(e.target.value)))}
                className="w-14 text-xs font-bold text-slate-900 focus:outline-none text-right font-mono"
              />
              <span className="text-[11px] font-bold text-slate-400">kg</span>
            </div>

            {/* Route Select */}
            <select
              value={calcRoute}
              onChange={(e) => setCalcRoute(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:border-orange-600 focus:outline-none cursor-pointer"
            >
              <option value="INTRA_ZONE">Intra-City (Local)</option>
              <option value="INTER_ZONE">Inter-City (Same State)</option>
              <option value="INTER_STATE">Inter-State (National)</option>
            </select>

            {/* Segment Select */}
            <select
              value={calcCustomer}
              onChange={(e) => setCalcCustomer(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:border-orange-600 focus:outline-none cursor-pointer"
            >
              <option value="B2C">B2C Retail</option>
              <option value="B2B">B2B Enterprise</option>
            </select>

            {/* Calculated Pill */}
            <div className="rounded-xl bg-orange-600 px-4 py-1.5 text-white shadow-xs">
              <span className="text-[10px] uppercase font-bold text-orange-200 block">Est. Billable</span>
              <span className="text-sm font-black tracking-tight">₹{calculateSimulatedCost()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 text-slate-400 mr-1" />
          {[
            { id: 'ALL', label: 'All Routes' },
            { id: 'INTRA', label: 'Intra-City (Local)' },
            { id: 'INTER_CITY', label: 'Inter-City Regional' },
            { id: 'INTER_STATE', label: 'Inter-State National' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRouteFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                routeFilter === tab.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Segment:</span>
          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-orange-600 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Segments (B2C & B2B)</option>
            <option value="B2C">Retail B2C</option>
            <option value="B2B">Enterprise B2B</option>
          </select>
        </div>
      </div>

      {/* 4. Rate Cards Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-xs font-semibold text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-orange-600 mb-2" />
          Loading dynamic rate matrices...
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <CreditCard className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No rate cards found</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different route or customer tier filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredCards.map((card) => {
            const routeBadge = getRouteMeta(card.routeType);

            return (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Top Card Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                        {card.customerType}
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${routeBadge.bg}`}>
                        {routeBadge.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{card.name}</h3>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Rate
                  </span>
                </div>

                {/* Surcharge & Pricing Parameters Strip */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50/70 border border-slate-100 p-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      COD Processing Fee
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      ₹{card.codSurchargeFlat} + {card.codSurchargePercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pricing Model
                    </span>
                    <span className="font-bold text-orange-700 text-xs">
                      Volumetric Slab (L×W×H / 5000)
                    </span>
                  </div>
                </div>

                {/* Weight Slabs Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Weight Slab Ladders & Vehicle Matching
                  </span>

                  <div className="overflow-hidden rounded-xl border border-slate-200/70">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-bold uppercase text-slate-500 text-[10px]">
                        <tr>
                          <th className="px-3.5 py-2.5">Weight Bracket</th>
                          <th className="px-3.5 py-2.5">Assigned Tier</th>
                          <th className="px-3.5 py-2.5">Base Fare</th>
                          <th className="px-3.5 py-2.5 text-right">Incremental</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {card.rules?.map((r, i) => {
                          const tier = getVehicleTier(Number(r.maxWeightKg));
                          const { Icon: TierIcon } = tier;

                          return (
                            <tr key={i} className="hover:bg-slate-50/60 transition">
                              <td className="px-3.5 py-2.5 font-bold text-slate-900 font-mono text-[11px]">
                                {r.minWeightKg} kg – {r.maxWeightKg} kg
                              </td>
                              <td className="px-3.5 py-2.5">
                                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold border ${tier.badge}`}>
                                  <TierIcon className={`h-3 w-3 ${tier.color}`} />
                                  <span>{tier.label}</span>
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 font-bold text-orange-700">
                                ₹{r.basePrice}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-medium text-slate-600">
                                {Number(r.perKgRateAboveMin) > 0 ? (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                                    +₹{r.perKgRateAboveMin}/kg
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
