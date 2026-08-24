import React, { useState, useEffect, useRef } from 'react';
import { trackingApi } from '../../api/trackingApi';
import { Order } from '../../types';
import {
  Radio,
  Navigation,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Zap,
  MapPin,
} from 'lucide-react';

interface Props {
  order: Order;
  onLocationSent?: () => void;
}

export const AgentGpsBroadcaster: React.FC<Props> = ({ order, onLocationSent }) => {
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSentCoords, setLastSentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSentTime, setLastSentTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simStep, setSimStep] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);

  // Delhi NCR coordinates for default origin and destination
  const pickupLat = 28.5494;
  const pickupLng = 77.2001;
  const dropLat = 28.4900;
  const dropLng = 77.0888;

  // 1. Real Device GPS Watcher
  useEffect(() => {
    if (isGpsActive && !isSimulating) {
      if (!('geolocation' in navigator)) {
        setErrorMsg('Geolocation is not supported by this device/browser.');
        setIsGpsActive(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude, speed, heading } = position.coords;
            await trackingApi.updateDriverLocation(order.id, {
              orderId: order.id,
              latitude,
              longitude,
              speed: speed ? speed * 3.6 : 30, // convert m/s to km/h
              heading: heading || 0,
            });
            setLastSentCoords({ lat: latitude, lng: longitude });
            setLastSentTime(new Date().toLocaleTimeString());
            setErrorMsg(null);
            onLocationSent?.();
          } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to transmit GPS coordinates.');
          }
        },
        (err) => {
          console.warn('GPS Watch error:', err);
          setErrorMsg(err.message || 'GPS location permission denied or weak signal.');
          setIsGpsActive(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000,
        }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isGpsActive, isSimulating, order.id]);

  // 2. Interactive Route Movement Simulator
  useEffect(() => {
    if (isSimulating) {
      const totalSteps = 12;
      let current = simStep;

      simIntervalRef.current = setInterval(async () => {
        current = (current + 1) % (totalSteps + 1);
        setSimStep(current);

        const fraction = current / totalSteps;
        const currentLat = pickupLat + fraction * (dropLat - pickupLat) + Math.sin(fraction * Math.PI) * 0.003;
        const currentLng = pickupLng + fraction * (dropLng - pickupLng) - Math.sin(fraction * Math.PI) * 0.002;

        try {
          await trackingApi.updateDriverLocation(order.id, {
            orderId: order.id,
            latitude: currentLat,
            longitude: currentLng,
            speed: 32,
            heading: 215,
          });
          setLastSentCoords({ lat: currentLat, lng: currentLng });
          setLastSentTime(new Date().toLocaleTimeString());
          onLocationSent?.();
        } catch (e) {
          console.error('Simulation transmit error:', e);
        }

        if (current === totalSteps) {
          setIsSimulating(false);
        }
      }, 2500);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    }

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [isSimulating, order.id, simStep]);

  // Automatically turn off tracking when order is DELIVERED
  useEffect(() => {
    if (order.status === 'DELIVERED' || order.status === 'FAILED' || order.status === 'CANCELLED') {
      setIsGpsActive(false);
      setIsSimulating(false);
    }
  }, [order.status]);

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`h-4 w-4 ${isGpsActive || isSimulating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live GPS Telemetry Broadcaster
          </h4>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isGpsActive || isSimulating
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isSimulating ? 'SIMULATING ROUTE' : isGpsActive ? 'BROADCASTING LIVE' : 'IDLE'}
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs font-semibold text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {lastSentCoords && (
        <div className="rounded-lg bg-white p-2.5 text-[11px] text-slate-600 border border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-orange-600" />
            <span className="font-mono">{lastSentCoords.lat.toFixed(4)}, {lastSentCoords.lng.toFixed(4)}</span>
          </div>
          <span className="text-slate-400">Sent at {lastSentTime}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setIsSimulating(false);
            setIsGpsActive(!isGpsActive);
          }}
          disabled={order.status === 'DELIVERED'}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow-xs ${
            isGpsActive
              ? 'bg-rose-600 text-white hover:bg-rose-500'
              : 'bg-orange-600 text-white hover:bg-orange-500'
          }`}
        >
          {isGpsActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isGpsActive ? 'Stop Live GPS' : 'Start Device GPS'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsGpsActive(false);
            setIsSimulating(!isSimulating);
          }}
          disabled={order.status === 'DELIVERED'}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition ${
            isSimulating
              ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>{isSimulating ? 'Pause Simulation' : 'Simulate Movement'}</span>
        </button>
      </div>
    </div>
  );
};
