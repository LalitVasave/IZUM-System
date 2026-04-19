import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import useVehicleStore from '../store/useVehicleStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import SignalBars from '../components/SignalBars';
import Speedometer from '../components/Speedometer';
import CarbonFootprint from '../components/CarbonFootprint';
import LiveEventStream from '../components/LiveEventStream';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const { speed, tier, state: busState, lat } = useVehicleStore();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    toast.success('Signed out of the Observatory');
    navigate('/login');
  };

  // Derive signal tier for display
  const tierMap: Record<string, { label: string; color: string; icon: string }> = {
    ACTIVE: { label: 'Full Signal', color: 'text-primary', icon: 'signal_cellular_alt' },
    MINIMAL: { label: 'Latency Mode', color: 'text-secondary', icon: 'signal_cellular_connected_no_internet_4_bar' },
    SPARSE: { label: 'Sparse Data', color: 'text-orange-400', icon: 'signal_cellular_1_bar' },
    DEAD: { label: 'Signal Lost', color: 'text-error', icon: 'signal_disconnected' },
    FULL: { label: 'Full Signal', color: 'text-primary', icon: 'signal_cellular_alt' },
    REDUCED: { label: 'Reduced Mode', color: 'text-secondary', icon: 'signal_cellular_2_bar' },
  };
  const tierInfo = tierMap[tier] || tierMap['ACTIVE'];
  const [isMechanicMode, setIsMechanicMode] = React.useState(false);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed min-h-screen relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <h1 className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <a className="font-['Inter'] font-bold tracking-tight text-lg text-[#39FF14] cursor-pointer">Status</a>
            <a className="font-['Inter'] font-bold tracking-tight text-lg text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/map')}>Map</a>
            <a className="font-['Inter'] font-bold tracking-tight text-lg text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/stops')}>Stops</a>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMechanicMode(!isMechanicMode)} 
              className={`flex items-center gap-1 transition-colors ${isMechanicMode ? 'text-secondary' : 'text-zinc-400 hover:text-[#39FF14]'}`}
              title="Mechanic Mode"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isMechanicMode ? "'FILL' 1" : "'FILL' 0" }}>engineering</span>
            </button>
            <button onClick={() => navigate('/settings')} className="text-zinc-400 hover:text-[#39FF14] transition-colors" title="Settings">
              <span className="material-symbols-outlined">tune</span>
            </button>
            {user && <span className="font-label text-[10px] text-on-surface-variant hidden md:block">{user.email}</span>}
            <button onClick={handleLogout} className="flex items-center gap-1 text-zinc-400 hover:text-[#39FF14] transition-colors" title="Sign Out">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-32 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Background Narrative Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <span className="font-label text-primary-dim uppercase tracking-[0.2em] text-xs mb-2 block">System Telemetry</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic">HONEST STATUS OVERLAYS</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Real-time kinetic feedback modules designed for high-stakes mobility tracking. These overlays prioritize radical transparency through color-coded urgency.
              </p>
            </div>
            <div className="hidden lg:block text-right">
              <p className="font-label text-[10px] text-zinc-500 uppercase">
                WS: <span className={isConnected ? 'text-primary' : 'text-error'}>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </p>
              <p className="font-label text-[10px] text-zinc-500 uppercase">Tier: {tier}</p>
            </div>
          </div>
        </section>

        {/* Overlay Component Matrix (Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* WebSocket Connection State */}
          <div className="bg-surface-container-low rounded-xl p-6 border-t border-l border-white/10 flex flex-col justify-center min-h-[180px]">
            <div className="mb-6">
              <span className="font-label text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block">Live Connection</span>
              <div className="w-full h-[1px] bg-white/5"></div>
            </div>
            <div className={`relative overflow-hidden bg-surface-container/60 backdrop-blur-xl border-l-4 rounded-lg p-4 flex items-center justify-between shadow-2xl ${isConnected ? 'border-primary' : 'border-error'}`}>
              <div className="flex items-center gap-4">
                <span className={`material-symbols-outlined ${isConnected ? 'text-primary' : 'text-error animate-pulse'}`}>
                  {isConnected ? 'cloud_done' : 'cloud_off'}
                </span>
                <div>
                  <p className="font-headline font-bold text-sm">{isConnected ? 'WebSocket Live' : 'WebSocket Offline'}</p>
                  <p className={`font-label text-[10px] uppercase ${isConnected ? 'text-primary/70' : 'text-error/70'}`}>
                    {isConnected ? 'Receiving telemetry' : 'Attempting reconnect...'}
                  </p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-error'}`}></div>
            </div>
          </div>

          {/* Signal Tier State */}
          <div className="bg-surface-container-low rounded-xl p-6 border-t border-l border-white/10 flex flex-col justify-center min-h-[180px]">
            <div className="mb-6">
              <span className="font-label text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block">Network State</span>
              <div className="w-full h-[1px] bg-white/5"></div>
            </div>
            <div className="relative overflow-hidden bg-surface-container/60 backdrop-blur-xl border-l-4 border-[#ffb700] rounded-lg p-4 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-4">
                <SignalBars tier={tier as any} size="sm" />
                <div>
                  <p className="font-headline font-bold text-sm">{tierInfo.label}</p>
                  <p className={`font-label text-[10px] uppercase ${tierInfo.color}/70`}>Tier: {tier}</p>
                </div>
              </div>
              <button onClick={() => navigate('/network')} className="font-label text-[10px] text-zinc-500 hover:text-primary transition-colors">
                CONFIGURE
              </button>
            </div>
          </div>

          {/* Bus Speed / Telemetry */}
          <div className="bg-surface-container-low rounded-xl p-6 border-t border-l border-white/10 flex flex-col justify-center min-h-[180px]">
            <div className="mb-6">
              <span className="font-label text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block">Live Telemetry</span>
              <div className="w-full h-[1px] bg-white/5"></div>
            </div>
            <div className="relative overflow-hidden bg-surface-container/60 backdrop-blur-xl border-l-4 border-secondary rounded-lg p-4 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-4">
                <Speedometer speed={speed} size={50} />
                <div>
                  <div className="font-headline font-bold text-sm min-w-[80px]">
                    {isConnected ? `${speed.toFixed(1)} mph` : <Skeleton variant="text" className="w-20 h-5" />}
                  </div>
                  <div className="font-label text-[10px] text-secondary/70 uppercase mt-1">
                    {isConnected ? `Bus: ${busState}` : <Skeleton variant="text" className="w-16 h-3" />}
                  </div>
                </div>
              </div>
              <div className="font-label text-[10px] text-secondary">
                {isConnected && lat ? `${lat.toFixed(4)}° N` : <Skeleton variant="text" className="w-12 h-3" />}
              </div>
            </div>
          </div>

          {/* Safety Hub Quick Link */}
          <div className="bg-surface-container-low rounded-xl p-6 border-t border-l border-white/10 flex flex-col justify-center min-h-[180px] lg:col-span-2">
            <div className="mb-6">
              <span className="font-label text-[10px] text-zinc-500 uppercase tracking-widest mb-1 block">Safety Protocols</span>
              <div className="w-full h-[1px] bg-white/5"></div>
            </div>
            <div className="relative overflow-hidden bg-surface-container/60 backdrop-blur-xl border-l-4 border-orange-400 rounded-lg p-5 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-orange-400/60 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <div>
                  <p className="font-headline font-bold text-lg">Campus Safety Active</p>
                  <p className="font-label text-xs text-orange-400/70 uppercase">Silent SOS • Virtual Escort • Late Night Mode</p>
                </div>
              </div>
              <button onClick={() => navigate('/safety')} className="px-4 py-2 bg-orange-400/10 text-orange-400 border border-orange-400/20 rounded-full font-label text-[10px] uppercase tracking-tighter hover:bg-orange-400/20 transition-all">
                Open Hub
              </button>
            </div>
          </div>

          {/* Carbon Impact Analytics */}
          <div className="lg:col-span-2">
            <CarbonFootprint milesSaved={142.5} />
          </div>

          {/* Mechanic Mode: Engine Diagnostics */}
          {isMechanicMode && (
            <div className="lg:col-span-4 bg-zinc-950 border-2 border-dashed border-secondary/30 rounded-2xl p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-3xl">terminal</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-2xl italic tracking-tighter text-secondary uppercase">Vehicle_Diagnostics_v4.0</h3>
                  <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest">Authorized Personnel Only • Node: IZUM-01</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></div>
                  <span className="font-label text-[9px] text-secondary font-bold uppercase tracking-widest">Telemetry Stream Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Battery Capacity', value: '84%', sub: '392V / 112kWh', color: 'text-secondary' },
                  { label: 'Motor Temp', value: '52°C', sub: 'Nominal Range', color: 'text-primary' },
                  { label: 'Tire Pressure', value: '102%', sub: 'System Balanced', color: 'text-primary' },
                  { label: 'Brake Health', value: 'GOOD', sub: 'Regenerative Active', color: 'text-primary' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-surface-container-low/50 p-4 rounded-xl border border-white/5">
                    <p className="font-label text-[9px] text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`font-headline font-black text-xl italic ${stat.color}`}>{stat.value}</p>
                    <p className="font-label text-[8px] text-zinc-600 uppercase mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Decorative Console Lines */}
              <div className="mt-8 font-mono text-[9px] text-zinc-700 space-y-1">
                <p>{`> FETCHING_CORE_TELEMETRY... OK`}</p>
                <p>{`> DECRYPTING_NODE_HANDSHAKE... IZUM_SEC_v2`}</p>
                <p className="text-secondary/40">{`> WARN: INVERTER_COOLANT_FLUX_THRESHOLD_LOW`}</p>
              </div>
            </div>
          )}

          {/* Live Global Event Stream */}
          <div className="lg:col-span-4">
            <LiveEventStream />
          </div>
        </div>

        {/* Quick Navigation Section */}
        <section className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Live Map', icon: 'map', path: '/map', color: 'text-primary' },
            { label: 'Bus Stops', icon: 'departure_board', path: '/stops', color: 'text-secondary' },
            { label: 'Late Night', icon: 'dark_mode', path: '/status', color: 'text-orange-400' },
            { label: 'Network', icon: 'wifi', path: '/network', color: 'text-primary' },
            { label: 'Route Maker', icon: 'route', path: '/route-maker', color: 'text-secondary' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-surface-container-low rounded-xl p-5 flex flex-col items-center gap-3 border border-white/5 hover:border-primary/20 hover:bg-surface-container transition-all group"
            >
              <span className={`material-symbols-outlined ${item.color} text-3xl group-hover:scale-110 transition-transform`}>{item.icon}</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">{item.label}</span>
            </button>
          ))}
        </section>

        {/* Live Map Context Preview */}
        <section className="mt-12 rounded-3xl overflow-hidden relative border border-white/5 h-[300px] cursor-pointer group" onClick={() => navigate('/map')}>
          <div className="absolute inset-0">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://tile.openstreetmap.org/15/16485/10757.png" alt="Map Preview" style={{ imageRendering: 'pixelated', filter: 'invert(1) hue-rotate(90deg) saturate(0.4) brightness(0.5)' }}/>
          </div>
          <div className="absolute top-6 left-6 right-6 flex flex-col gap-3 max-w-md">
            <div className={`bg-zinc-950/80 backdrop-blur-xl border-l-4 rounded-lg p-3 flex items-center justify-between shadow-xl ${isConnected ? 'border-primary animate-pulse' : 'border-zinc-600'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-sm ${isConnected ? 'text-primary' : 'text-zinc-500'}`}>sensors</span>
                <p className="font-headline font-bold text-xs">{isConnected ? 'Tracking active' : 'Not connected'}</p>
              </div>
              <span className="font-label text-[9px] text-zinc-500 uppercase">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-zinc-950/60 backdrop-blur-md px-6 py-3 rounded-full border border-primary/30">
              <span className="font-headline font-bold text-primary uppercase tracking-widest text-sm">Open Live Map</span>
            </div>
          </div>
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined mb-1">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined mb-1">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Stops</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all duration-200 ease-out active:scale-110 cursor-pointer">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest">Status</span>
        </a>
      </nav>

      {/* Background Texture */}
      <div className="fixed inset-0 obsidian-grid opacity-[0.03] pointer-events-none -z-10"></div>
    </div>
  );
};

export default Dashboard;
