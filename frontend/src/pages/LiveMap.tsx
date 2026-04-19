import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useWebSocket } from '../context/WebSocketContext';
import useVehicleStore from '../store/useVehicleStore';
import SignalBars from '../components/SignalBars';
import Speedometer from '../components/Speedometer';
import VehicleSwitcher from '../components/VehicleSwitcher';
import type { NetworkTier } from '../store/useVehicleStore';
import toast from 'react-hot-toast';
import { useUserLocation } from '../hooks/useUserLocation';
import api from '../lib/axios';
import { haversineM } from '../lib/geo';
import { useSettingsStore } from '../store/useSettingsStore';

const expectedPingMs = (tier: NetworkTier) => {
  if (tier === 'ACTIVE') return 5000;
  if (tier === 'REDUCED') return 10000;
  if (tier === 'MINIMAL') return 15000;
  if (tier === 'SPARSE') return 30000;
  return 90000;
};

const projectLatLng = (lat: number, lng: number, heading: number, speedMph: number, elapsedMs: number) => {
  const distanceM = Math.min((speedMph * 0.44704 * elapsedMs) / 1000, 350);
  const bearing = (heading * Math.PI) / 180;
  const deltaLat = (Math.cos(bearing) * distanceM) / 111320;
  const deltaLng = (Math.sin(bearing) * distanceM) / (111320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + deltaLat, lng: lng + deltaLng };
};

type RouteStop = {
  name: string;
  lat: number;
  lng: number;
  sequence: number;
};

type SimulatorStatus = {
  mode: 'FULL' | 'REDUCED' | 'MINIMAL' | 'DEAD';
  route_name: string;
  stops: RouteStop[];
  buffered_count: number;
  dropped_count: number;
  flushed_count: number;
};

type StopRow = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
};

type EtaResponse = {
  stop_id: string;
  bus_id: string;
  eta_min: number; // seconds
  eta_max: number; // seconds
  stops_remaining: number;
  tier?: string;
  ts?: number;
};

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const LiveMap: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const { walkTimeMin, hapticFeedback } = useSettingsStore();
  const {
    lat,
    lng,
    speed,
    heading,
    tier,
    ts,
    route_name,
    from_stop,
    next_stop,
    next_sequence,
    segment_progress_pct,
  } = useVehicleStore();
  const [displayPosition, setDisplayPosition] = React.useState({ lat, lng });
  const [isProjected, setIsProjected] = React.useState(false);
  const lastActualRef = React.useRef({ lat, lng, ts: ts || Date.now() });
  const [isBusClose, setIsBusClose] = React.useState(false);
  const busCloseDismissedUntilRef = React.useRef(0);
  const busCloseWasActiveRef = React.useRef(false);
  const [activeVehicleId, setActiveVehicleId] = React.useState('IZUM-01');
  const { coords: userLocation, permission: geoPermission, refresh: refreshUserLocation } = useUserLocation({
    autoRequest: true,
    watch: true,
  });
  const [simulatorStatus, setSimulatorStatus] = React.useState<SimulatorStatus | null>(null);
  const [isStartingRoute, setIsStartingRoute] = React.useState(false);
  const [mapFollowsUser, setMapFollowsUser] = React.useState(false);
  const DEMO_BUS_ID = '00000000-0000-0000-0000-000000000002';
  const [stops, setStops] = React.useState<StopRow[]>([]);
  const [trackedStop, setTrackedStop] = React.useState<StopRow | null>(null);
  const [eta, setEta] = React.useState<EtaResponse | null>(null);

  // Demo toggle for BUS CLOSE banner
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b') {
        setIsBusClose(prev => {
          const next = !prev;
          if (next) {
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            document.title = '(!) Bus Approaching — IZUM';
          } else {
            document.title = 'IZUM Mobility';
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    api.get('/stops')
      .then((res) => {
        if (cancelled) return;
        setStops(res.data as StopRow[]);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (stops.length === 0) return;
    if (userLocation) {
      const nearest = [...stops].sort((a, b) => haversineM(userLocation, a) - haversineM(userLocation, b))[0];
      setTrackedStop(nearest || null);
      return;
    }
    const seq2 = stops.find((s) => s.sequence === 2);
    setTrackedStop(seq2 || stops[0] || null);
  }, [stops, userLocation]);

  React.useEffect(() => {
    if (!trackedStop) return;
    let alive = true;

    const tick = async () => {
      try {
        const res = await api.get(`/eta/${trackedStop.id}?bus_id=${DEMO_BUS_ID}`);
        if (!alive) return;
        setEta(res.data as EtaResponse);
      } catch {
        // ignore; keep last known ETA
      }
    };

    void tick();
    const interval = window.setInterval(tick, 15000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [trackedStop]);

  React.useEffect(() => {
    const now = Date.now();
    if (now < busCloseDismissedUntilRef.current) {
      if (isBusClose) setIsBusClose(false);
      return;
    }

    const etaMinMinutes = eta ? (Number(eta.eta_min) || 0) / 60 : Infinity;
    const canTrust = tier !== 'DEAD';
    const next = Boolean(eta && canTrust && eta.stops_remaining <= 2 && etaMinMinutes <= (walkTimeMin + 1));

    setIsBusClose(next);

    if (next && !busCloseWasActiveRef.current) {
      busCloseWasActiveRef.current = true;
      document.title = '(!) Bus Approaching — IZUM';
      if (hapticFeedback && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      toast.success('Bus approaching — leave now!', { duration: 2500 });
    }
    if (!next && busCloseWasActiveRef.current) {
      busCloseWasActiveRef.current = false;
      document.title = 'IZUM Mobility';
    }
  }, [eta, walkTimeMin, tier, isBusClose, hapticFeedback]);

  const refreshSimulatorStatus = React.useCallback(async () => {
    try {
      const res = await fetch('/simulator/status');
      if (!res.ok) throw new Error('Simulator unavailable');
      setSimulatorStatus(await res.json());
    } catch {
      setSimulatorStatus(null);
    }
  }, []);

  React.useEffect(() => {
    refreshSimulatorStatus();
    const interval = window.setInterval(refreshSimulatorStatus, 3000);
    return () => window.clearInterval(interval);
  }, [refreshSimulatorStatus]);

  const locateUser = React.useCallback(() => {
    refreshUserLocation()
      .then(() => {
        setMapFollowsUser(true);
        toast.success('Current location acquired');
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('denied')) {
          toast.error('Location permission was denied — allow location for this site in the browser lock icon.');
          return;
        }
        if (msg.includes('timed out')) {
          toast.error('Location timed out. Try again outdoors or tap Locate Me.');
          return;
        }
        if (msg.includes('not available')) {
          toast.error('Geolocation is not available in this browser.');
          return;
        }
        toast.error(msg || 'Location is unavailable right now.');
      });
  }, [refreshUserLocation]);

  const startRouteFromUser = async () => {
    if (!userLocation) {
      locateUser();
      toast('Get current location first', { icon: 'gps_fixed' });
      return;
    }
    setIsStartingRoute(true);
    try {
      const res = await fetch('/simulator/start-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: userLocation.lat,
          lng: userLocation.lng,
          name: 'Your Current Location',
        }),
      });
      if (!res.ok) throw new Error('Could not start route');
      const data = await res.json();
      toast.success(`Bus started from your location toward ${data.next_stop.name}`);
      await refreshSimulatorStatus();
      setMapFollowsUser(false);
    } catch {
      toast.error('Simulator is not running on port 8000.');
    } finally {
      setIsStartingRoute(false);
    }
  };

  const startCampusLoop = async () => {
    setIsStartingRoute(true);
    try {
      const res = await fetch('/simulator/reset-campus-route', { method: 'POST' });
      if (!res.ok) throw new Error('Could not start campus route');
      const data = await res.json();
      toast.success(`Bus started on ${data.route_name || 'Campus Loop A'}`);
      await refreshSimulatorStatus();
      setMapFollowsUser(false);
    } catch {
      toast.error('Simulator is not running on port 8000.');
    } finally {
      setIsStartingRoute(false);
    }
  };

  React.useEffect(() => {
    const from = displayPosition;
    const to = { lat, lng };
    const start = performance.now();
    const duration = Math.min(expectedPingMs(tier) * 0.8, 3500);
    lastActualRef.current = { lat, lng, ts: ts || Date.now() };
    setIsProjected(false);

    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPosition({
        lat: from.lat + (to.lat - from.lat) * eased,
        lng: from.lng + (to.lng - from.lng) * eased,
      });
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [lat, lng, ts, tier]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      const last = lastActualRef.current;
      const elapsed = Date.now() - last.ts;
      const staleAfter = expectedPingMs(tier) * 1.25;
      if (tier === 'DEAD') {
        setIsProjected(true);
        return;
      }
      if (elapsed > staleAfter) {
        setDisplayPosition(projectLatLng(last.lat, last.lng, heading, speed, elapsed - staleAfter));
        setIsProjected(true);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [tier, heading, speed]);

  const busCenter: [number, number] = [displayPosition.lat, displayPosition.lng];
  const mapCenter: [number, number] = mapFollowsUser && userLocation
    ? [userLocation.lat, userLocation.lng]
    : busCenter;
  const routeStops = simulatorStatus?.stops?.length
    ? simulatorStatus.stops
    : [
        { name: 'Library (North Entrance)', lat: 34.0522, lng: -118.2437, sequence: 1 },
        { name: 'Student Union Building', lat: 34.053, lng: -118.245, sequence: 2 },
        { name: 'Science Complex', lat: 34.054, lng: -118.246, sequence: 3 },
        { name: 'Engineering Block', lat: 34.055, lng: -118.244, sequence: 4 },
      ];
  const routeLine = routeStops.map((stop) => [stop.lat, stop.lng] as [number, number]);
  const closedRouteLine = routeLine.length > 1 ? [...routeLine, routeLine[0]] : routeLine;
  const signalAnalysis = simulatorStatus
    ? `${simulatorStatus.mode}: ${simulatorStatus.mode === 'DEAD' ? 'buffering coordinates locally' : 'live telemetry active'}`
    : 'Simulator status unavailable';
  const locationStatusLabel =
    geoPermission === 'granted'
      ? userLocation
        ? `±${Math.round(userLocation.accuracy || 0)}m · live`
        : 'Acquiring…'
      : geoPermission === 'denied'
        ? 'Blocked — allow in browser'
        : geoPermission === 'unsupported'
          ? 'Not supported'
          : 'Requesting permission…';

  return (
    <div className="bg-background text-on-surface font-body overflow-hidden h-screen relative">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <h1 className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest/50 rounded-full border border-white/5 backdrop-blur-md">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-error'}`}></div>
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {isProjected ? 'Projected Position' : isConnected ? 'Live Connection' : 'Reconnecting...'}
            </span>
          </div>
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      {/* Floating Vehicle Switcher Pill */}
      <div className="fixed top-24 left-6 right-6 z-40 overflow-hidden">
        <VehicleSwitcher currentVehicleId={activeVehicleId} onSelect={setActiveVehicleId} />
      </div>

      {/* Main Map Canvas */}
      <main className="relative w-full h-screen overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-surface">
          <MapContainer
            center={mapCenter}
            zoom={16}
            minZoom={3}
            className="w-full h-full z-0 grayscale-[0.2]"
            zoomControl={false}
          >
            <RecenterMap center={mapCenter} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={closedRouteLine} pathOptions={{ color: '#8eff71', weight: 5, opacity: 0.75 }} />
            {routeStops.map((stop) => (
              <CircleMarker
                key={`${stop.sequence}-${stop.name}`}
                center={[stop.lat, stop.lng]}
                radius={7}
                pathOptions={{ color: '#00e3fd', fillColor: '#00e3fd', fillOpacity: 0.85, weight: 2 }}
              >
                <Popup>
                  <strong>{stop.name}</strong>
                  <br />
                  Stop {stop.sequence}
                </Popup>
              </CircleMarker>
            ))}
            {userLocation && (
              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={8}
                pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.9, weight: 3 }}
              >
                <Popup>
                  Your current location
                  <br />
                  Accuracy: {Math.round(userLocation.accuracy || 0)}m
                </Popup>
              </CircleMarker>
            )}
            <CircleMarker
              center={busCenter}
              radius={11}
              pathOptions={{
                color: isProjected ? '#f59e0b' : '#39FF14',
                fillColor: isProjected ? '#f59e0b' : '#39FF14',
                fillOpacity: 0.95,
                weight: 4,
              }}
            >
              <Popup>
                IZUM-01
                <br />
                {isProjected ? 'Projected position' : 'Live GPS position'}
                <br />
                {next_stop || 'Student Union Building'}
              </Popup>
            </CircleMarker>
          </MapContainer>
          {/* Custom Map Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent opacity-40 pointer-events-none"></div>
        </div>

        {/* BUS CLOSE Amber Banner */}
        <div className={`absolute top-20 left-0 w-full z-40 transition-transform duration-500 ${isBusClose ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="bg-amber-500 text-black px-6 py-4 flex items-center justify-between shadow-[0_10px_30px_rgba(245,158,11,0.3)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-pulse text-2xl">sensors</span>
              <div>
                <h3 className="font-headline font-black text-lg leading-none tracking-tight">BUS APPROACHING</h3>
                <p className="font-label text-xs font-bold uppercase tracking-widest opacity-80 mt-1">
                  {trackedStop ? `Closest stop: ${trackedStop.name}` : 'Leave for your stop now'}
                </p>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
                  Walk time: {walkTimeMin} min
                  {eta ? ` • ETA: ${Math.ceil((eta.eta_min || 0) / 60)}–${Math.ceil((eta.eta_max || 0) / 60)} min` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  busCloseDismissedUntilRef.current = Date.now() + 10 * 60 * 1000;
                  setIsBusClose(false);
                  busCloseWasActiveRef.current = false;
                  document.title = 'IZUM Mobility';
                  toast('Approach dismissed for 10 minutes', { duration: 2000 });
                }}
                className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/20 transition-colors flex items-center justify-center"
                aria-label="Dismiss bus approaching banner"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <SignalBars tier={tier} size="sm" />
            </div>
          </div>
        </div>

        {/* Floating UI: Network Pill */}
        <div className="absolute top-24 right-6 z-10 transition-opacity duration-300" style={{ opacity: isBusClose ? 0 : 1 }}>
          <div className="flex items-center gap-3 px-4 py-2 bg-surface-container/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
            <SignalBars tier={tier} size="md" showLabel={true} />
          </div>
        </div>

        <div className="absolute top-36 left-6 z-30 w-[calc(100%-48px)] max-w-sm bg-zinc-950/70 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="font-label text-[9px] uppercase tracking-widest text-zinc-500">Route Control</p>
              <p className="font-headline text-sm font-bold text-on-surface">Current Location → Campus Loop A</p>
            </div>
            <span className="material-symbols-outlined text-primary">route</span>
          </div>
          <select
            className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface outline-none"
            value="current-campus-loop"
            onChange={() => undefined}
          >
            <option value="current-campus-loop">Start from current location</option>
            <option value="campus-loop">Campus Loop A only</option>
          </select>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={locateUser}
              className="py-2 rounded-full bg-surface-container-high border border-white/10 text-xs font-bold uppercase tracking-widest text-on-surface"
            >
              Locate Me
            </button>
            <button
              onClick={startRouteFromUser}
              disabled={isStartingRoute}
              className="py-2 rounded-full bg-primary text-black text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isStartingRoute ? 'Starting...' : 'Start Bus'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void startCampusLoop()}
            disabled={isStartingRoute}
            className="mt-2 w-full py-2 rounded-full border border-white/15 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            Reset to campus loop (simulator)
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-label uppercase tracking-wider">
            <div className="bg-black/30 rounded-lg p-2">
              <p className="text-zinc-500">Signal Analysis</p>
              <p className={simulatorStatus?.mode === 'DEAD' ? 'text-error' : 'text-primary'}>{signalAnalysis}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <p className="text-zinc-500">User GPS</p>
              <p className="text-secondary">{locationStatusLabel}</p>
            </div>
          </div>
        </div>

        {/* Bus Details Floating Card */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-30">
          <div className="bg-zinc-950/60 backdrop-blur-2xl rounded-[2rem] p-6 border-t border-l border-white/15 shadow-[0px_24px_48px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-bold">Current Transit</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-primary shadow-[0_0_8px_#8eff71]' : 'bg-zinc-600'}`}></div>
                </div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">{route_name || 'Campus Loop A'}</h2>
                <p className="text-on-surface-variant text-sm font-medium">
                  {isConnected
                    ? `${displayPosition.lat.toFixed(4)}° N, ${Math.abs(displayPosition.lng).toFixed(4)}° W`
                    : `Last Seen: ${new Date(ts).toLocaleTimeString()}`}
                </p>
                <div className="mt-3 bg-surface-container-low/70 rounded-xl p-3 border border-white/5 min-w-[220px]">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-label text-[9px] uppercase tracking-widest text-zinc-500">Next Stop</span>
                    <span className="font-label text-[9px] uppercase tracking-widest text-primary">Stop {next_sequence || 2}</span>
                  </div>
                  <p className="font-headline text-sm font-bold text-on-surface leading-tight">
                    {next_stop || 'Student Union Building'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Departed {from_stop || 'Library (North Entrance)'}
                  </p>
                  <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-700"
                      style={{ width: `${Math.max(0, Math.min(100, segment_progress_pct || 0))}%` }}
                    ></div>
                  </div>
                </div>
                <p className={`font-label text-[10px] uppercase tracking-widest mt-2 ${isProjected ? 'text-amber-400' : 'text-primary'}`}>
                  {isProjected ? 'Sparse ping: interpolating heading and speed' : 'Live ping: direct GPS fix'}
                </p>
              </div>
              <Speedometer speed={speed} size={70} />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/stops')}
                className="flex-1 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(142,255,113,0.4)] transition-all"
              >
                <span className="material-symbols-outlined text-sm">departure_board</span>
                <span className="uppercase font-label tracking-wider text-xs">View Stops</span>
              </button>
              <button
                onClick={() => navigate('/safety')}
                className="w-12 h-12 flex items-center justify-center bg-surface-container border border-white/10 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">shield</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <a className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all scale-110 duration-200 ease-out cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Stops</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Status</span>
        </a>
      </nav>
    </div>
  );
};

export default LiveMap;
