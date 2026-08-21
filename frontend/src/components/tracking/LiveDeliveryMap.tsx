import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LiveTrackingData } from '../../api/trackingApi';
import { Navigation, Compass, Layers, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  trackingData: LiveTrackingData;
  className?: string;
}

export const LiveDeliveryMap: React.FC<Props> = ({ trackingData, className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followDriver, setFollowDriver] = useState(true);

  // Initialize Leaflet Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Guard against React StrictMode double initialization
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = trackingData?.currentLocation?.latitude || 28.5494;
    const initialLng = trackingData?.currentLocation?.longitude || 77.2001;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Map initialization notice:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers, Route Polyline, and Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !trackingData) return;

    try {
      const currentLat = trackingData.currentLocation?.latitude || 28.5494;
      const currentLng = trackingData.currentLocation?.longitude || 77.2001;
      const pickupLat = trackingData.pickupLocation?.latitude || 28.5494;
      const pickupLng = trackingData.pickupLocation?.longitude || 77.2001;
      const destLat = trackingData.destination?.latitude || 28.4900;
      const destLng = trackingData.destination?.longitude || 77.0888;
      const heading = trackingData.heading || 0;

      // 1. Destination Marker
      const destIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-9 w-9 rounded-full bg-rose-500/20 animate-ping"></div>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg border-2 border-white ring-2 ring-rose-500/30">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
        </div>
      `;
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: destIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destination</b><br/>${trackingData.destination?.name || 'Recipient'}<br/>${trackingData.destination?.address || ''}`);
      } else {
        destMarkerRef.current.setLatLng([destLat, destLng]);
      }

      // 2. Pickup Origin Marker
      const pickupIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white shadow-md border-2 border-white">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>
      `;
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: pickupIconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([pickupLat, pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup Point</b><br/>${trackingData.pickupLocation?.name || 'Pickup'}<br/>${trackingData.pickupLocation?.address || ''}`);
      } else {
        pickupMarkerRef.current.setLatLng([pickupLat, pickupLng]);
      }

      // 3. Driver Vehicle Marker
      const driverIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-11 w-11 rounded-full bg-indigo-500/30 animate-pulse"></div>
          <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease;" class="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl border-2 border-white ring-4 ring-indigo-500/40">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
      `;
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: driverIconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker([currentLat, currentLng], { icon: driverIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`<b>Delivery Partner</b><br/>${trackingData.deliveryPartner?.name || 'Driver'}<br/>${trackingData.deliveryPartner?.vehicleNumber || ''}`);
      } else {
        driverMarkerRef.current.setIcon(driverIcon);
        driverMarkerRef.current.setLatLng([currentLat, currentLng]);
      }

      // 4. Draw Route Polyline
      const waypoints: [number, number][] = (trackingData.routeWaypoints || []).map((w) => [
        w.latitude,
        w.longitude,
      ]);

      if (waypoints.length === 0) {
        waypoints.push([currentLat, currentLng], [destLat, destLng]);
      }

      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(waypoints, {
          color: '#4f46e5',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: '8, 8',
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(waypoints);
      }

      // 5. Center and auto-fit bounds
      if (followDriver) {
        const bounds = L.latLngBounds([[currentLat, currentLng], [destLat, destLng], [pickupLat, pickupLng]]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } catch (err) {
      console.warn('Map update render notice:', err);
    }
  }, [trackingData, followDriver]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map || !trackingData?.currentLocation) return;
    setFollowDriver(true);
    map.flyTo([trackingData.currentLocation.latitude, trackingData.currentLocation.longitude], 15, {
      duration: 1.2,
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'h-[380px] sm:h-[460px]'
      } ${className}`}
    >
      {/* Map Container Viewport */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Floating Control Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleRecenter}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-md backdrop-blur border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
          title="Recenter on Delivery Partner"
        >
          <Navigation className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-md backdrop-blur border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Floating Live Telemetry Badge Overlay */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-slate-900/90 px-3.5 py-2 text-white shadow-xl backdrop-blur border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">Live GPS</span>
        </div>
        <span className="text-slate-600">•</span>
        <span className="font-semibold text-slate-200">{trackingData?.distanceRemaining ?? 0} km away</span>
        <span className="text-slate-600">•</span>
        <span className="font-bold text-indigo-400">{trackingData?.etaMinutes ?? 0} min ETA</span>
      </div>
    </div>
  );
};
