import React from 'react';
import { useNavigate } from 'react-router-dom';
import useVehicleStore from '../store/useVehicleStore';
import { useWebSocket } from '../context/WebSocketContext';
import type { NetworkTier } from '../store/useVehicleStore';
import toast from 'react-hot-toast';

type SimulatorMode = 'FULL' | 'REDUCED' | 'MINIMAL' | 'DEAD';

interface SimulatorStatus {
  is_running: boolean;
  mode: SimulatorMode;
  buffered_count: number;
  dropped_count: number;
  flushed_count: number;
}

const tierToSimulatorMode: Record<NetworkTier, SimulatorMode> = {
  ACTIVE: 'FULL',
  REDUCED: 'REDUCED',
  MINIMAL: 'MINIMAL',
  SPARSE: 'MINIMAL',
  DEAD: 'DEAD',
};

const NetworkSimulation: React.FC = () => {
  const navigate = useNavigate();
  const { tier, setTier, speed } = useVehicleStore();
  const { isConnected } = useWebSocket();
  const [simulatorStatus, setSimulatorStatus] = React.useState<SimulatorStatus | null>(null);
  const [isApplyingMode, setIsApplyingMode] = React.useState(false);

  const tiers: { id: NetworkTier; label: string; icon: string; color: string; sub: string; payloadMB: string; pingMs: number }[] = [
    { id: 'ACTIVE', label: 'Full Mode', icon: 'wifi', color: 'text-primary', sub: 'Optimized Throughput', payloadMB: '1.2', pingMs: 24 },
    { id: 'REDUCED', label: 'Reduced', icon: 'wifi_2_bar', color: 'text-secondary', sub: 'Latency Priority', payloadMB: '0.4', pingMs: 80 },
    { id: 'MINIMAL', label: 'Minimal', icon: 'wifi_1_bar', color: 'text-orange-400', sub: 'Essential Data', payloadMB: '0.08', pingMs: 200 },
    { id: 'SPARSE', label: 'Sparse', icon: 'wifi_1_bar', color: 'text-orange-300', sub: 'Sparse uplink', payloadMB: '0.04', pingMs: 200 },
    { id: 'DEAD', label: 'Dead Signal', icon: 'signal_disconnected', color: 'text-error', sub: 'Offline Cache', payloadMB: '0.0', pingMs: 9999 },
  ];

  const activeTier = tiers.find((t) => t.id === tier) || tiers[0];

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

  const applyNetworkMode = async (nextTier: NetworkTier) => {
    setTier(nextTier);
    setIsApplyingMode(true);
    const simulatorMode = tierToSimulatorMode[nextTier];
    try {
      const res = await fetch('/simulator/network-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: simulatorMode }),
      });
      if (!res.ok) throw new Error('Simulator mode update failed');
      const body = await res.json();
      toast.success(`Simulator switched to ${body.mode}`);
      await refreshSimulatorStatus();
    } catch {
      toast.error('Simulator is not running. UI mode changed locally only.');
    } finally {
      setIsApplyingMode(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed min-h-screen relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-[#39FF14] transition-colors mr-2">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <h1 className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</h1>
        </div>
        <div className="flex items-center">
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto relative">
        {/* Background Texture */}
        <div className="absolute inset-0 obsidian-grid opacity-[0.03] pointer-events-none -z-10"></div>

        {/* Signal Header Decoration */}
        <div className="mb-12 overflow-hidden">
          <div className="flex justify-between items-end mb-2">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Telemetry Active</span>
            <span className={`font-label text-[10px] uppercase tracking-[0.2em] ${activeTier.color}`}>
              Mode: {activeTier.label}
            </span>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#8eff71] to-transparent opacity-50"></div>
        </div>

        {/* Hero Editorial Section */}
        <section className="mb-12">
          <h2 className="text-5xl font-black italic tracking-tighter leading-tight mb-2 uppercase">NETWORK<br/><span className="text-primary-container">OSCILLATION</span></h2>
          <p className="text-on-surface-variant font-label text-sm max-w-md uppercase tracking-wider">Configure real-time packet distribution and node visibility across the observatory grid.</p>
        </section>

        {/* 2x2 Network Mode Grid */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => applyNetworkMode(t.id)}
              className={`relative group aspect-square flex flex-col items-center justify-center rounded-xl p-6 transition-all duration-300 ${
                tier === t.id
                  ? 'bg-surface-container scale-105 shadow-[0px_0px_32px_rgba(142,255,113,0.15)] ring-1 ring-primary/30'
                  : 'bg-surface-container-low hover:bg-surface-container hover:scale-105'
              }`}
            >
              {tier === t.id && <div className="absolute inset-0 bg-primary/5 rounded-xl"></div>}
              <span className={`material-symbols-outlined ${t.color} text-4xl mb-4`} style={{ fontVariationSettings: tier === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
              <span className={`font-label text-xs uppercase tracking-widest ${tier === t.id ? 'text-primary' : 'text-on-surface'} mb-1`}>{t.label}</span>
              <span className="font-label text-[10px] text-on-surface-variant">{t.sub}</span>
              <span className="mt-3 font-label text-[9px] text-on-surface-variant uppercase tracking-widest">
                {tierToSimulatorMode[t.id]} / {t.id === 'DEAD' ? 'buffers locally' : `${t.id === 'ACTIVE' ? '5' : t.id === 'MINIMAL' ? '15' : '30'}s pings`}
              </span>
              {tier === t.id && <div className="absolute bottom-4 w-12 h-1 bg-primary rounded-full blur-[2px]"></div>}
            </button>
          ))}
        </div>

        <section className="mb-8 bg-surface-container-low border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Store-and-forward telemetry</p>
              <h3 className="font-headline font-bold text-xl tracking-tight">
                {simulatorStatus ? `Simulator ${simulatorStatus.mode}` : 'Simulator offline'}
              </h3>
            </div>
            <button
              onClick={refreshSimulatorStatus}
              disabled={isApplyingMode}
              className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-primary disabled:opacity-40"
              title="Refresh simulator status"
            >
              <span className="material-symbols-outlined text-lg">sync</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Buffered', simulatorStatus?.buffered_count ?? '—'],
              ['Dropped', simulatorStatus?.dropped_count ?? '—'],
              ['Flushed', simulatorStatus?.flushed_count ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-zinc-950/60 rounded-xl p-3 border border-white/5">
                <p className="font-label text-[9px] uppercase tracking-widest text-zinc-500">{label}</p>
                <p className="font-headline text-2xl font-black text-primary mt-1">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant leading-relaxed">
            DEAD mode keeps generating GPS points locally, then flushes them as buffered telemetry when signal returns.
          </p>
        </section>

        {/* Stats Panel (Bento Style) — real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Payload Size</span>
              <span className="font-label text-2xl font-bold text-on-surface">
                {activeTier.payloadMB}<span className="text-xs text-primary ml-1">MB/s</span>
              </span>
            </div>
            <div className="h-10 w-24 bg-surface-container rounded flex items-end gap-1 px-2 pb-1">
              {[20, 60, 30, 80, 50].map((h, i) => (
                <div key={i} className="w-2 rounded-t transition-all duration-500" style={{ height: `${h * (parseFloat(activeTier.payloadMB) + 0.1) / 1.3}%`, background: `rgba(142,255,113,${0.2 + i * 0.2})` }}></div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Ping Interval</span>
              <span className="font-label text-2xl font-bold text-on-surface">
                {activeTier.pingMs === 9999 ? '∞' : activeTier.pingMs}<span className="text-xs text-primary ml-1">ms</span>
              </span>
            </div>
            <span className="material-symbols-outlined text-primary/30 text-3xl">timer</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Vehicle Speed</span>
              <span className="font-label text-2xl font-bold text-on-surface">
                {isConnected ? speed.toFixed(1) : '—'}<span className="text-xs text-primary ml-1">MPH</span>
              </span>
            </div>
            <span className="material-symbols-outlined text-primary/30 text-3xl">speed</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">WebSocket</span>
              <span className={`font-label text-xs uppercase font-bold flex items-center gap-2 ${isConnected ? 'text-primary' : 'text-error'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary shadow-[0_0_8px_#8eff71]' : 'bg-error'}`}></span>
                {isConnected ? 'Established' : 'Disconnected'}
              </span>
            </div>
            <span className="material-symbols-outlined text-primary/30 text-3xl">cloud_sync</span>
          </div>
        </div>

        {/* Dead Zone Simulation Tool (Terminal Style) */}
        <section className="mt-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-headline font-bold text-xl tracking-tight uppercase">Dead Zone Simulation</h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 font-mono text-[11px] relative overflow-hidden group">
            <div className="flex items-center gap-2 text-zinc-500 mb-6 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span className="uppercase tracking-[0.2em]">observatory_mock_v1.2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'The Tunnel', desc: 'Total signal obstruction' },
                { name: 'Deep Parking', desc: 'Multipath interference' },
                { name: 'Forest Edge', desc: 'Sparse packet loss' },
              ].map((zone) => (
                <button
                  key={zone.name}
                  onClick={() => {
                    const original = tier;
                    applyNetworkMode('DEAD');
                    setTimeout(() => applyNetworkMode(original), 10000);
                  }}
                  className="bg-surface-container-low border border-white/5 p-4 rounded-xl text-left hover:border-error/40 hover:bg-error/5 transition-all group/btn"
                >
                  <p className="font-bold text-on-surface mb-1 group-hover/btn:text-error transition-colors">{zone.name}</p>
                  <p className="text-on-surface-variant text-[9px] uppercase tracking-tighter">{zone.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-zinc-600 group-hover/btn:text-error/60 transition-colors">
                    <span className="material-symbols-outlined text-[12px]">sensors_off</span>
                    <span className="font-bold">TRIGGER_DROP</span>
                  </div>
                </button>
              ))}
            </div>
            {/* Ambient Background Grid for Terminal */}
            <div className="absolute inset-0 obsidian-grid opacity-[0.05] pointer-events-none"></div>
          </div>
        </section>

        {/* Decorative Map/Data Card */}
        <div className="mt-8 relative h-48 rounded-2xl overflow-hidden group">
          <img className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIUJ46zRYT-dyg6ZRH7eOPmbWae-2d5OEJVOUaCYbcZkD3j2huqhyCNJA2G8KgLoKZCj218OxDV0bui1dndFo4kFmrFSU2ZEI_yNvmFtbnuQwJdaVcOkQMfSTPlNmG9EWzk5epeGaJipxCFpX644iRg5jAq7PcCGKzTjTFrNKI7NVAebWEQKkp07OeXtRGW2J12N5BWTG5rLbhha2D4PoQ1yJJlhjizpTjzFyr9QX96GYNvZuyyEvTh7dwyXmPJ1NHEQAlm_7QzGnC" alt="Decorative"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute bottom-6 left-6">
            <h4 className="font-headline font-bold text-xl text-primary uppercase">GRID_NODE_ALPHA</h4>
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">Active Tier: {activeTier.label}</p>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined mb-1">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Map</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined mb-1">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Stops</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all active:scale-110 duration-200 ease-out cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined mb-1">analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Status</span>
        </button>
      </nav>
    </div>
  );
};

export default NetworkSimulation;
