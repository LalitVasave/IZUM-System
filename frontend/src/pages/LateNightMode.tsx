import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import useVehicleStore from '../store/useVehicleStore';
import toast from 'react-hot-toast';

const LateNightMode: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const { speed, state: busState, tier, lat } = useVehicleStore();

  const handleContactDriver = () => {
    toast.success('Campus security notified — driver contact initiated', {
      duration: 5000,
      style: { background: '#ef4444', color: '#fff' }
    });
  };

  const handleDismiss = () => {
    toast('Check-in alert dismissed', { icon: '✓' });
  };

  const telemetryRows = [
    {
      icon: 'speed',
      label: 'Vehicle Speed',
      value: isConnected ? `${speed.toFixed(1)}` : '—',
      unit: 'KM/H',
      color: 'text-primary',
    },
    {
      icon: 'signal_cellular_alt',
      label: 'Network Tier',
      value: tier,
      unit: '',
      color:
        tier === 'DEAD'
          ? 'text-error'
          : tier === 'SPARSE' || tier === 'MINIMAL' || tier === 'REDUCED'
            ? 'text-orange-400'
            : 'text-primary',
    },
    {
      icon: 'visibility',
      label: 'Bus Status',
      value: busState,
      unit: '',
      color: busState === 'ACTIVE' ? 'text-secondary' : 'text-orange-400',
    },
  ];

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed min-h-screen overflow-x-hidden relative">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-[#39FF14] transition-colors mr-2">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <span className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-4 max-w-lg mx-auto space-y-6 relative">
        {/* Background Texture */}
        <div className="absolute inset-0 obsidian-grid opacity-[0.03] pointer-events-none -z-10"></div>

        {/* Late Night Mode Banner */}
        <header className="relative overflow-hidden glass-panel rounded-xl p-4 flex items-center justify-between border-l-4 border-secondary shadow-[0px_0px_30px_rgba(0,227,253,0.1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-on-surface leading-tight">Late Night Mode</h1>
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Enhanced Surveillance Active</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/20 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-zinc-600'}`}></div>
            <span className={`font-label text-[10px] font-bold ${isConnected ? 'text-secondary' : 'text-zinc-500'}`}>
              {isConnected ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
        </header>

        {/* Driver Check-in Alert Card */}
        <section className="glass-panel rounded-xl p-5 border-l-4 border-error shadow-[0px_0px_40px_rgba(255,115,81,0.15)] relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-error/20 rounded-full animate-pulse">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div className="flex-1">
              <h2 className="font-headline font-extrabold text-on-surface text-lg">Driver check-in overdue</h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Vehicle ID: <span className="font-label text-error">IZM-992-K</span> has missed the scheduled window.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleContactDriver}
              className="flex-1 py-2 rounded-full bg-error text-on-error font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Contact Driver
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-bold text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors"
            >
              Dismiss
            </button>
          </div>
        </section>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-2 gap-4">
          {/* Check-in Countdown Ring Card */}
          <div className="col-span-1 glass-panel rounded-xl p-5 flex flex-col items-center justify-between text-center relative">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle className="text-surface-container-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-error" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="50" strokeLinecap="round" strokeWidth="6"></circle>
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-label text-xl font-bold text-error">04:00</span>
                <span className="font-label text-[8px] uppercase tracking-tighter text-on-surface-variant">Remain</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Last check-in</p>
              <p className="font-headline font-bold text-sm">6 min ago</p>
            </div>
          </div>

          {/* Route Deviation Map Mini */}
          <div className="col-span-1 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="h-28 relative">
              <img alt="Dark map of urban streets" className="w-full h-full object-cover grayscale opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9h9yS0WRZhbLiGc36sl39vGbbzBRSxQrKSx09zBNUxy7TplGVmS21tGEKIGMegJrFmw8ATbTTABgZH1nk_8lO8FtE7IElsjgawsD-qY2GVzzF5LPqX-8-rlK2qaJN4R8UkEaROoNMG_Yxu0n3ahljIt3yO1PiKIJn_xaCofWnLOqtkiqrnpq6obgQuUKYob4hFOO2bMD3H-lqJoz92AoZ5ucxbT0S30z_OwQ8UxTuCHqOxv-xgBR4EdS5bgwDrU53JJ-Xlx6WKU7k" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <path d="M 20 80 Q 50 50 80 20" fill="none" stroke="#00e3fd" strokeDasharray="4 2" strokeWidth="2"></path>
                <path className="drop-shadow-[0_0_8px_#ff7351]" d="M 20 80 Q 60 70 90 60" fill="none" stroke="#ff7351" strokeWidth="2"></path>
              </svg>
              <div className="absolute top-2 right-2 px-2 py-1 bg-error/90 backdrop-blur rounded-sm shadow-xl">
                <span className="font-label text-[9px] font-bold text-on-error">850m DEVIATION</span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Deviation Status</p>
              <p className="font-headline font-bold text-error text-xs">OFF-ROUTE DETECTED</p>
            </div>
          </div>
        </div>

        {/* Live Telemetry Section — Real Data */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
              {isConnected ? 'Live Telemetry' : 'Telemetry Offline'}
            </span>
            <span className={`material-symbols-outlined text-sm ${isConnected ? 'text-secondary' : 'text-zinc-600'}`}>signal_cellular_alt</span>
          </div>
          <div className="space-y-3">
            {telemetryRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">{row.icon}</span>
                  <span className="text-xs text-on-surface">{row.label}</span>
                </div>
                <span className={`font-label font-bold text-sm ${row.color}`}>
                  {row.value} <span className="text-[10px] opacity-60">{row.unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Position if connected */}
          {isConnected && lat !== 0 && (
            <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-base">gps_fixed</span>
                <span className="text-xs text-on-surface">GPS Position</span>
              </div>
              <span className="font-label font-bold text-sm text-primary">
                {lat.toFixed(4)}° N
              </span>
            </div>
          )}
        </div>
      </main>

      {/* BottomNavBar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Map</span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Stops</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all scale-110 duration-200 ease-out cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Status</span>
        </div>
      </footer>
    </div>
  );
};

export default LateNightMode;
