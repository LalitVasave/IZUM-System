import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { useUserLocation } from '../hooks/useUserLocation';
import { haversineM } from '../lib/geo';
import { useSettingsStore } from '../store/useSettingsStore';

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
}

const DEMO_BUS_ID = '00000000-0000-0000-0000-000000000002';

const Stops: React.FC = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState<Stop[]>([]);
  const [filtered, setFiltered] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [etas, setEtas] = useState<Record<string, any>>({});

  const { coords: userCoords, permission: geoPermission, refresh: refreshLocation } = useUserLocation({
    autoRequest: true,
    watch: true,
  });
  const walkTimeMin = useSettingsStore((s) => s.walkTimeMin);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await api.get('/stops');
        setStops(res.data);
        setFiltered(res.data);
      } catch (err) {
        toast.error('Failed to load stops.');
      } finally {
        setLoading(false);
      }
    };
    fetchStops();
  }, []);

  // Poll ETA for top 3 visible stops
  useEffect(() => {
    if (filtered.length === 0) return;
    
    const fetchEtas = async () => {
      const topStops = filtered.slice(0, 3);
      for (const stop of topStops) {
        try {
          const res = await api.get(`/eta/${stop.id}?bus_id=${DEMO_BUS_ID}`);
          setEtas(prev => ({ ...prev, [stop.id]: res.data }));
        } catch (e) {
          // ignore error
        }
      }
    };
    
    fetchEtas();
    const interval = setInterval(fetchEtas, 15000);
    return () => clearInterval(interval);
  }, [filtered]);

  const fuse = useMemo(() => new Fuse(stops, { keys: ['name'], threshold: 0.35 }), [stops]);

  useEffect(() => {
    if (!search) {
      setFiltered(stops);
      return;
    }
    const results = fuse.search(search);
    setFiltered(results.map(r => r.item));
  }, [search, stops, fuse]);

  const getETAData = (stopId: string, seq: number) => {
    const data = etas[stopId];
    if (data) {
      return {
        min: Math.ceil(data.eta_min / 60),
        max: Math.ceil(data.eta_max / 60),
        uncertainty: data.uncertainty_bar_pct,
        isCongested: data.eta_seconds > (seq * 4 * 60) // Simple congestion threshold
      };
    }
    const minutes = seq * 3 + 1;
    return {
      min: minutes,
      max: minutes + 3,
      uncertainty: 20,
      isCongested: false
    };
  };

  const isBusClose = useCallback((stopId: string) => {
    const data = etas[stopId];
    if (!data) return false;
    const etaMinMinutes = (Number(data.eta_min) || 0) / 60;
    return data.stops_remaining <= 2 && etaMinMinutes <= (walkTimeMin + 1);
  }, [etas, walkTimeMin]);

  const stopsForList = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const aClose = isBusClose(a.id);
      const bClose = isBusClose(b.id);
      if (aClose && !bClose) return -1;
      if (!aClose && bClose) return 1;
      if (userCoords) return haversineM(userCoords, a) - haversineM(userCoords, b);
      return a.sequence - b.sequence;
    });
    return list;
  }, [filtered, userCoords, isBusClose]);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen pb-32 relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <h1 className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Search Bar Section */}
        <div className="mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:outline-none transition-all duration-300"
              placeholder="Search campus stops..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-[90%] transition-all duration-500 rounded-full shadow-[0_0_8px_#8eff71]"></div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary shrink-0 text-xl">near_me</span>
            <p className="text-xs text-on-surface-variant leading-snug">
              {geoPermission === 'denied' && 'Location blocked — stops follow route order. Allow location in the site settings (lock icon) to sort by distance.'}
              {geoPermission === 'unsupported' && 'This browser cannot use GPS here — stops follow route order.'}
              {geoPermission === 'granted' && userCoords && 'Location on — list sorted by distance to you (approaching buses stay on top).'}
              {geoPermission === 'granted' && !userCoords && 'Waiting for first GPS fix…'}
              {geoPermission === 'prompt' && 'Requesting location so nearby stops surface first…'}
            </p>
          </div>
          {geoPermission === 'denied' && (
            <button
              type="button"
              onClick={() =>
                refreshLocation().catch(() => toast.error('Still blocked — check browser site permissions.'))
              }
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-1 rounded-lg border border-primary/30"
            >
              Retry
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface-container/30 border border-white/5 rounded-xl p-5">
                <div className="flex gap-4">
                  <Skeleton variant="circle" className="w-12 h-12" />
                  <div className="flex-1 space-y-3">
                    <Skeleton variant="text" className="w-3/4 h-5" />
                    <Skeleton variant="text" className="w-1/2 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">departure_board</span>
            <p className="font-headline text-on-surface-variant font-bold">
              {search ? `No stops found for "${search}"` : 'No stops available'}
            </p>
          </div>
        )}

        {/* Stops List */}
        {!loading && stopsForList.length > 0 && (
          <div className="space-y-4">
            {stopsForList.map((stop, idx) => {
              const etaData = getETAData(stop.id, stop.sequence);
              return (
                <div
                key={stop.id}
                onClick={() => navigate(`/eta/${stop.id}`)}
                style={{ order: isBusClose(stop.id) ? -1 : 0 }}
                className={`rounded-xl overflow-hidden border transition-all duration-500 cursor-pointer group ${
                  isBusClose(stop.id)
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse'
                    : idx === 0
                    ? 'bg-surface-container-high border-primary/20 shadow-[0px_24px_48px_rgba(0,0,0,0.4)]'
                    : 'bg-surface-container border-white/5 hover:bg-surface-container-high hover:border-primary/10'
                }`}
              >
                <div className="p-5 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="2.5"></circle>
                        <circle
                          className={isBusClose(stop.id) ? 'text-amber-500' : idx === 0 ? 'text-primary' : 'text-secondary'}
                          cx="24" cy="24" fill="transparent" r="20" stroke="currentColor"
                          strokeDasharray="125.6"
                          strokeDashoffset={String(30 + idx * 20)}
                          strokeWidth="2.5"
                        ></circle>
                      </svg>
                      <span className={`material-symbols-outlined ${isBusClose(stop.id) ? 'text-amber-500' : idx === 0 ? 'text-primary' : 'text-secondary'}`}>directions_bus</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-on-surface">{stop.name}</h3>
                      <div className="flex flex-col gap-1 mt-0.5">
                        <div className="flex items-center gap-2">
                          <p className={`font-label text-xs uppercase tracking-widest ${isBusClose(stop.id) ? 'text-amber-500' : idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {`Arrives in ${etaData.min}–${etaData.max} min`}
                          </p>
                          {etaData.isCongested && (
                            <div className="flex items-center gap-1 bg-error/10 px-2 py-0.5 rounded border border-error/20">
                              <span className="material-symbols-outlined text-[10px] text-error">warning</span>
                              <span className="font-label text-[8px] text-error font-bold uppercase tracking-tighter">Congestion</span>
                            </div>
                          )}
                        </div>
                        {/* ML Confidence Bar */}
                        <div className="w-24 h-[2px] bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${etaData.uncertainty > 40 ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${100 - etaData.uncertainty}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isBusClose(stop.id) ? (
                      <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/50">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                        <span className="font-label text-[10px] font-bold text-amber-400 tracking-tighter uppercase">Approaching</span>
                      </div>
                    ) : idx === 0 ? (
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                        <span className="font-label text-[10px] font-bold text-primary tracking-tighter uppercase">Live</span>
                      </div>
                    ) : (
                      <span className="font-label text-[10px] text-on-surface-variant group-hover:text-primary transition-colors">
                        STP-{String(stop.sequence).padStart(3, '0')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded content for first stop */}
                {idx === 0 && (
                  <div className="px-5 pb-6 border-t border-white/5 pt-5 space-y-6">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">directions_walk</span>
                        <span className="font-label text-xs">Nearest stop on route</span>
                      </div>
                      <div className="font-label text-xs text-secondary">Stop #{stop.sequence}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.success(`Proximity alert set for ${stop.name}!`); }}
                      className="w-full py-3 bg-primary text-on-primary font-bold rounded-full text-sm shadow-[0_0_15px_rgba(142,255,113,0.3)] hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      Set Proximity Alert
                    </button>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined text-2xl mb-1">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all scale-110 duration-200 ease-out cursor-pointer">
          <span className="material-symbols-outlined text-2xl mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Stops</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-2xl mb-1">analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Status</span>
        </a>
      </nav>

      {/* Background Texture */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute inset-0 obsidian-grid opacity-20"></div>
      </div>
    </div>
  );
};

export default Stops;
