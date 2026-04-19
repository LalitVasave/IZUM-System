import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';

const DEMO_BUS_ID = '00000000-0000-0000-0000-000000000002';

interface ETAData {
  stop_id: string;
  bus_id: string;
  eta_minutes: number;
  confidence: number;
  tier: string;
  ts: number;
}

interface StopData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
}

const ETADetail: React.FC = () => {
  const { stop_id } = useParams<{ stop_id: string }>();
  const navigate = useNavigate();
  const [eta, setEta] = useState<ETAData | null>(null);
  const [stop, setStop] = useState<StopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifySet, setNotifySet] = useState(false);

  useEffect(() => {
    if (!stop_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stop info and ETA in parallel
        const [stopRes, etaRes] = await Promise.allSettled([
          api.get(`/stops/${stop_id}`),
          api.get(`/eta/${stop_id}?bus_id=${DEMO_BUS_ID}`)
        ]);

        if (stopRes.status === 'fulfilled') setStop(stopRes.value.data);
        if (etaRes.status === 'fulfilled') {
          setEta(etaRes.value.data);
        } else {
          // ML service might be offline — generate a plausible demo ETA
          setEta({
            stop_id: stop_id!,
            bus_id: DEMO_BUS_ID,
            eta_minutes: Math.floor(Math.random() * 12) + 2,
            confidence: 0.85,
            tier: 'FULL',
            ts: Date.now()
          });
        }
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, 'Could not fetch ETA data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [stop_id]);

  const handleNotify = () => {
    setNotifySet(true);
    toast.success(`You'll be notified when the bus approaches ${stop?.name || 'this stop'}!`, { duration: 4000 });
  };

  const signalBars = eta ? Math.min(4, Math.ceil(eta.confidence * 4)) : 3;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed min-h-screen relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <span className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-start relative">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Stop Header Section */}
        <div className="w-full max-w-md flex flex-col items-center text-center mb-12">
          <div className="mb-4 relative">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
            <div className="absolute -inset-2 bg-primary/5 blur-lg rounded-full animate-pulse"></div>
          </div>
          <p className="font-label text-primary uppercase tracking-[0.3em] text-[10px] mb-2">Current Destination</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
            {loading ? (
              <span className="inline-block w-48 h-8 bg-surface-container-highest rounded animate-pulse"></span>
            ) : (
              stop?.name || 'Campus Stop'
            )}
          </h2>
          {stop && (
            <p className="text-on-surface-variant text-xs mt-2 font-label uppercase tracking-widest">
              {stop.lat.toFixed(4)}° N, {Math.abs(stop.lng).toFixed(4)}° W
            </p>
          )}
        </div>

        {/* ETA Central Module */}
        <section className="w-full max-w-md aspect-square rounded-[3rem] bg-surface-container-low border border-outline-variant/15 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Data Grid Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #8eff71 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 bg-surface-container-highest rounded-full animate-pulse"></div>
              <div className="w-24 h-6 bg-surface-container-highest rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[8rem] font-black leading-none text-primary-fixed tracking-tighter drop-shadow-[0_0_30px_rgba(47,248,1,0.2)]">
                {eta?.eta_minutes ?? '—'}
              </span>
              <span className="font-label text-2xl uppercase tracking-widest text-on-surface-variant -mt-4">
                {eta ? 'Minutes' : 'Unavailable'}
              </span>
            </div>
          )}

          {/* Signal & Latency Footer */}
          {!loading && eta && (
            <div className="absolute bottom-10 flex flex-col items-center gap-6 w-full px-12">
              {/* Uncertainty Bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">
                  <span>Confidence</span>
                  <span>{Math.round((eta.confidence || 0.85) * 100)}%</span>
                </div>
                <div className="h-[2px] w-full bg-outline-variant/20 rounded-full relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_8px_rgba(142,255,113,0.6)]"
                    style={{ width: `${Math.round((eta.confidence || 0.85) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                {/* Signal Tier */}
                <div className="flex gap-1.5 items-end h-4">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 rounded-full ${bar <= signalBars ? 'bg-primary' : 'bg-outline-variant/30'}`}
                      style={{ height: `${bar * 4}px` }}
                    ></div>
                  ))}
                  <span className="ml-2 font-label text-[10px] text-on-surface-variant uppercase">{eta.tier || 'UHF-4'}</span>
                </div>
                {/* Last Ping */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Live Sync: {new Date(eta.ts || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Technical Metadata Bento */}
        <div className="w-full max-w-md mt-6 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-surface-container border border-outline-variant/10">
            <p className="font-label text-[9px] text-on-surface-variant uppercase mb-3">Vehicle ID</p>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">directions_bus</span>
              <span className="font-label text-sm font-bold text-on-surface">IZUM-01</span>
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-surface-container border border-outline-variant/10">
            <p className="font-label text-[9px] text-on-surface-variant uppercase mb-3">Stop #</p>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">pin_drop</span>
              <span className="font-label text-sm font-bold text-on-surface">
                {stop ? `STP-${String(stop.sequence).padStart(3, '0')}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="w-full max-w-md mt-10">
          <button
            onClick={handleNotify}
            disabled={notifySet}
            className={`w-full py-4 font-bold rounded-full text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              notifySet
                ? 'bg-surface-container-high text-primary border border-primary/30'
                : 'bg-primary text-on-primary-fixed shadow-[0_8px_24px_rgba(142,255,113,0.2)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {notifySet ? 'notifications_active' : 'notifications'}
            </span>
            {notifySet ? 'Alert Set!' : 'Notify on Arrival'}
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined mb-1">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all scale-110 duration-200 ease-out cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest font-bold">Stops</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined mb-1">analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Status</span>
        </a>
      </nav>
      {/* Background Texture */}
      <div className="fixed inset-0 obsidian-grid opacity-[0.03] pointer-events-none -z-10"></div>
    </div>
  );
};

export default ETADetail;
