import React, { useState } from 'react';
import { useZones, useZoneMutations } from '../../hooks/useZones';
import { Map, PlusCircle, MapPin, CheckCircle2, X } from 'lucide-react';
import { Zone } from '../../types';

export const AdminZonesPage: React.FC = () => {
  const { data: zones = [], isLoading } = useZones();
  const { createZone, addArea } = useZoneMutations();

  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [newZoneCode, setNewZoneCode] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCity, setNewZoneCity] = useState('');
  const [newZoneState, setNewZoneState] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  const [selectedZoneForArea, setSelectedZoneForArea] = useState<Zone | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPincode, setNewAreaPincode] = useState('');

  const uniqueStates = Array.from(new Set(zones.map((z) => z.state).filter(Boolean)));

  const filteredZones = zones.filter((z) => {
    if (selectedStateFilter === 'ALL') return true;
    return z.state === selectedStateFilter;
  });

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneCode || !newZoneName) return;
    await createZone.mutateAsync({
      code: newZoneCode.trim().toUpperCase(),
      name: newZoneName.trim(),
      city: newZoneCity.trim() || 'New Delhi',
      state: newZoneState.trim() || 'Delhi',
    } as any);
    setIsAddZoneOpen(false);
    setNewZoneCode('');
    setNewZoneName('');
    setNewZoneCity('');
    setNewZoneState('');
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneForArea || !newAreaName || !newAreaPincode) return;
    await addArea.mutateAsync({
      zoneId: selectedZoneForArea.id,
      payload: {
        name: newAreaName.trim(),
        pincode: newAreaPincode.trim(),
      },
    });
    setSelectedZoneForArea(null);
    setNewAreaName('');
    setNewAreaPincode('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Logistics Zones & PIN Coverage
          </h1>
          <p className="text-sm text-slate-500">
            Define Intra-City, Inter-City, and Inter-State regional logistics clusters and map geographic PIN serviceability
          </p>
        </div>
        <button
          onClick={() => setIsAddZoneOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-500 transition cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" /> Create New Zone
        </button>
      </div>

      {/* State Filter Bar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by State / Region:</span>
        </div>
        <select
          value={selectedStateFilter}
          onChange={(e) => setSelectedStateFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-orange-600 focus:outline-none"
        >
          <option value="ALL">All States (Cross Boundary)</option>
          {uniqueStates.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                    {zone.code}
                  </span>
                  <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {zone.state || 'Delhi NCR'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{zone.name}</h3>
                <p className="text-xs text-slate-500">{zone.city || 'NCR'}, {zone.state || 'India'}</p>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                Active Hub
              </span>
            </div>

            {/* Mapped Areas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Mapped PIN Codes ({zone.areas?.length || 0})
                </span>
                <button
                  onClick={() => setSelectedZoneForArea(zone)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-500 cursor-pointer"
                >
                  + Add PIN Code
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {zone.areas && zone.areas.length > 0 ? (
                  zone.areas.map((area) => (
                    <span
                      key={area.id}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                    >
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {area.pincode} — {area.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No areas assigned to this zone yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      {isAddZoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Define New Logistics Zone</h3>
              <button onClick={() => setIsAddZoneOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Zone Code</label>
                <input
                  type="text"
                  value={newZoneCode}
                  onChange={(e) => setNewZoneCode(e.target.value)}
                  placeholder="e.g. DL-WEST"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-orange-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Zone Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. West Delhi Logistics Hub"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-orange-600 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700">City</label>
                  <input
                    type="text"
                    value={newZoneCity}
                    onChange={(e) => setNewZoneCity(e.target.value)}
                    placeholder="e.g. Gurugram"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-orange-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700">State</label>
                  <input
                    type="text"
                    value={newZoneState}
                    onChange={(e) => setNewZoneState(e.target.value)}
                    placeholder="e.g. Haryana"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-orange-600 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddZoneOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-orange-500"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Area Modal */}
      {selectedZoneForArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">
                Map PIN Code to {selectedZoneForArea.name}
              </h3>
              <button onClick={() => setSelectedZoneForArea(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddArea} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Area Name</label>
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="e.g. Punjabi Bagh"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-orange-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">6-Digit PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newAreaPincode}
                  onChange={(e) => setNewAreaPincode(e.target.value)}
                  placeholder="e.g. 110026"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-orange-600 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedZoneForArea(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-orange-500"
                >
                  Map PIN Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
