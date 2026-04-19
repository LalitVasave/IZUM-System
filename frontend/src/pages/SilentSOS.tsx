import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import BiometricHandshake from '../components/BiometricHandshake';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';
import { useSettingsStore } from '../store/useSettingsStore';

const DEMO_BUS_ID = '00000000-0000-0000-0000-000000000002';

const SilentSOS: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isVerifyingCancel, setIsVerifyingCancel] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [safeWordInput, setSafeWordInput] = useState('');
  const [drainWidth, setDrainWidth] = useState(100);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const drainRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get user's real location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords({ lat: 35.6895, lng: 139.6917 }),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    } else {
      setCoords({ lat: 35.6895, lng: 139.6917 });
    }
  }, []);

  const { hapticFeedback } = useSettingsStore();

  const triggerSOS = async () => {
    setIsActive(true);
    setIsDispatching(true);
    setDrainWidth(100);

    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]); // Alarm pattern
    }

    const location = coords || { lat: 35.6895, lng: 139.6917 };

    try {
      await api.post('/sos', {
        lat: location.lat,
        lng: location.lng,
        bus_id: DEMO_BUS_ID,
      });
      
      // Simulate dispatch time
      setTimeout(() => {
        setIsDispatching(false);
        toast.success('🚨 SOS dispatched — Patrol is on the way!', {
          duration: 8000,
          style: { background: '#ef4444', color: '#fff' }
        });
      }, 2500);

    } catch (error: unknown) {
      setIsDispatching(false);
      toast.error(getApiErrorMessage(error, 'SOS failed — please call emergency services directly'));
    }

    // Start 10-second drain countdown
    drainRef.current = setInterval(() => {
      setDrainWidth((prev) => {
        if (prev <= 0) {
          clearInterval(drainRef.current!);
          setIsActive(false);
          return 0;
        }
        return prev - 10;
      });
    }, 1000);
  };

  const handleTriggerRequest = () => {
    setShowBiometric(true);
  };

  const onBiometricSuccess = () => {
    setShowBiometric(false);
    triggerSOS();
  };

  const cancelSOS = () => {
    setIsVerifyingCancel(true);
  };

  const confirmCancellation = () => {
    // Demo Safe Word: "SAFE"
    if (safeWordInput.toUpperCase() === 'SAFE') {
      clearInterval(drainRef.current!);
      setIsActive(false);
      setIsVerifyingCancel(false);
      setSafeWordInput('');
      setDrainWidth(100);
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50); // Short confirmation
      }
      toast('SOS cancelled securely', { icon: '✓' });
    } else {
      toast.error('Incorrect Safe Word — SOS remains ACTIVE');
      setSafeWordInput('');
    }
  };

  // Cleanup interval on unmount
  useEffect(() => () => { if (drainRef.current) clearInterval(drainRef.current); }, []);

  const displayLat = coords?.lat ?? 35.6895;
  const displayLng = coords?.lng ?? 139.6917;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen relative overflow-hidden">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <span className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 items-center">
            <a className="text-[#39FF14] font-['Inter'] font-bold tracking-tight text-lg transition-colors duration-300 cursor-pointer" onClick={() => navigate('/map')}>Map</a>
            <a className="text-zinc-400 font-['Inter'] font-bold tracking-tight text-lg hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/stops')}>Stops</a>
          </nav>
          <span className="material-symbols-outlined text-[#39FF14] cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      <main className="relative h-screen w-full overflow-hidden bg-surface">
        {/* Map Canvas (Background) */}
        <div className="absolute inset-0 z-0">
          <img alt="Dark Map Interface" className="w-full h-full object-cover opacity-60 grayscale-[0.5]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRJeDiz1L6SyVFMKTfkXcbHtNDeI27EqheSd3rzJ4fYRAqh_uDrWX9V2OYFUSt2RtIaiLeViB4zxjpS-dxxcCwdYA0i0Vng_SXGW1PwbrCm2_RxJFalBO5f4FMtfFxlDN73XyYlXiHXZnv0qRto_wFrrPKSJbH37Nwzr92U7XY_cLOIYgt3nfq6T1y55SoMY1TcFmcbF9D1ICt835_jomfacSjMFDCdtlSet6ZR_m09wilTzvrqf8iYrsdpIPZwNf5_UffLCF2jcW8" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background/80 pointer-events-none"></div>
        </div>

        {/* Active SOS Overlay */}
        {isActive && (
          <div className="absolute inset-0 z-40 flex flex-col items-center pointer-events-none">
            {/* Cancel Progress Bar */}
            <div className="w-full h-1.5 bg-surface-container-lowest mt-[72px] relative pointer-events-auto">
              <div
                className="h-full bg-error transition-all duration-1000 ease-linear"
                style={{ width: `${drainWidth}%` }}
              ></div>
              <button
                onClick={cancelSOS}
                className="absolute inset-0 flex items-center justify-center text-[10px] font-label uppercase tracking-[0.3em] text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Tap to cancel
              </button>
            </div>
            {/* Dispatching / Active Toast */}
            <div className="mt-8 pointer-events-auto flex flex-col items-center">
              {isDispatching ? (
                <div className="bg-amber-500/20 backdrop-blur-2xl px-6 py-3 rounded-full flex items-center gap-3 border border-amber-500/30 shadow-2xl animate-pulse">
                  <span className="material-symbols-outlined text-amber-500 text-sm animate-spin">sync</span>
                  <span className="font-label text-xs uppercase tracking-widest text-amber-500 font-bold">Connecting to Security...</span>
                </div>
              ) : (
                <div className="bg-error/20 backdrop-blur-2xl px-6 py-3 rounded-full flex items-center gap-3 border border-error/30 shadow-2xl">
                  <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
                  <span className="font-label text-xs uppercase tracking-widest text-error font-bold">SOS ACTIVE — Help dispatched</span>
                </div>
              )}

              {/* Safe Word Verification Modal */}
              {isVerifyingCancel && (
                <div className="mt-12 bg-surface-container-high/90 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] w-[calc(100%-48px)] max-w-[320px] animate-in zoom-in-95 duration-300">
                  <h3 className="font-headline font-black text-xl text-center mb-2 uppercase italic tracking-tighter">Identity Verification</h3>
                  <p className="text-[10px] font-label text-zinc-500 uppercase tracking-widest text-center mb-6">Enter Safe Word to de-escalate</p>
                  
                  <input
                    type="text"
                    value={safeWordInput}
                    onChange={(e) => setSafeWordInput(e.target.value)}
                    placeholder="ENTER SAFE WORD"
                    className="w-full bg-black/40 border-b-2 border-primary/30 py-3 text-center font-mono tracking-[0.5em] text-primary focus:border-primary focus:outline-none transition-colors uppercase"
                    autoFocus
                  />
                  
                  <div className="mt-8 flex flex-col gap-3">
                    <button
                      onClick={confirmCancellation}
                      className="w-full py-4 bg-primary text-black font-bold rounded-full uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Confirm Safe Status
                    </button>
                    <button
                      onClick={() => setIsVerifyingCancel(false)}
                      className="w-full py-3 text-zinc-500 font-bold uppercase tracking-widest text-[9px] hover:text-on-surface transition-colors"
                    >
                      Keep SOS Active
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Telemetry Data (Asymmetric Layout) */}
        <div className="absolute top-24 right-8 z-10 flex flex-col gap-1 items-end pointer-events-none">
          <div className="bg-surface-container-low/40 backdrop-blur-md p-4 rounded-xl border-l border-primary/20">
            <p className="font-label text-[10px] uppercase text-primary tracking-tighter opacity-70">Your Coordinates</p>
            <p className="font-label text-base font-bold tracking-widest text-on-surface">
              {displayLat.toFixed(4)}° N
            </p>
            <p className="font-label text-base font-bold tracking-widest text-on-surface">
              {Math.abs(displayLng).toFixed(4)}° {displayLng < 0 ? 'W' : 'E'}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center gap-8">
                <span className="font-label text-[9px] uppercase text-on-surface-variant">GPS Signal</span>
                <span className="font-label text-[9px] text-primary">{coords ? 'LIVE' : 'APPROX'}</span>
              </div>
              <div className="w-24 h-[1px] bg-outline-variant/30 relative">
                <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: coords ? '98%' : '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge (Floating) */}
        <div className="absolute top-24 left-8 z-10 pointer-events-none">
          <div className="flex items-center gap-4 bg-surface-container/60 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/5">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
              <div className="relative w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface">
              {isActive ? 'SOS ACTIVE' : 'System Live'}
            </span>
          </div>
        </div>

        {/* Hidden SOS Trigger (The Stealth Shield) */}
        <button
          className={`absolute bottom-32 right-8 z-30 w-20 h-20 flex items-center justify-center rounded-full transition-all ${
            isActive
              ? 'bg-error/20 border-2 border-error opacity-100'
              : 'hover:bg-white/5 opacity-[0.08] active:opacity-[0.25]'
          }`}
          onClick={isActive ? cancelSOS : handleTriggerRequest}
          title="Silent SOS"
        >
          <span className={`material-symbols-outlined text-5xl ${isActive ? 'text-error' : 'text-on-surface-variant'}`}
            style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            shield
          </span>
        </button>

        {/* Instruction Text */}
        {!isActive && (
          <div className="absolute bottom-32 left-8 z-10">
            <div className="glass-panel px-4 py-3 rounded-xl max-w-[200px]">
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant leading-relaxed">
                Hold shield button → Silent SOS sent to campus security
              </p>
            </div>
          </div>
        )}

        {/* Map Interactions Floating Panel */}
        <div className="absolute left-8 bottom-52 z-10 space-y-4">
          <div className="flex flex-col gap-2">
            <button className="w-12 h-12 bg-surface-container-high/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-all text-on-surface">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="w-12 h-12 bg-surface-container-high/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 transition-all text-on-surface">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
          <button className="w-12 h-12 bg-primary/10 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/30 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
          </button>
        </div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-primary/40 to-transparent pointer-events-none"></div>
      </main>

      {showBiometric && (
        <BiometricHandshake 
          actionName="Silent SOS" 
          onSuccess={onBiometricSuccess} 
          onCancel={() => {
            setShowBiometric(false);
            setDrainWidth(100);
          }} 
        />
      )}

      {/* Bottom Navigation Shell */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Stops</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 cursor-pointer" onClick={() => navigate('/safety')}>
          <span className="material-symbols-outlined">shield</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Safety</span>
        </a>
      </footer>
    </div>
  );
};

export default SilentSOS;
