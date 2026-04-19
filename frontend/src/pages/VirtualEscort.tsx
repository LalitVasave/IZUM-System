import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import useVehicleStore from '../store/useVehicleStore';
import toast from 'react-hot-toast';

const VirtualEscort: React.FC = () => {
  const navigate = useNavigate();
  const { token: escortToken } = useParams<{ token: string }>();
  const { isConnected } = useWebSocket();
  const { lat, lng, speed } = useVehicleStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [escortLink, setEscortLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If we have a token in the URL, we're a viewer — start session immediately
  useEffect(() => {
    if (escortToken) {
      setSessionActive(true);
    }
  }, [escortToken]);

  // Live timer
  useEffect(() => {
    if (sessionActive) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedSeconds(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sessionActive]);

  // Arrival Detection Logic
  useEffect(() => {
    if (sessionActive && isConnected && lat && lng) {
      // Mock Destination: Engineering Building (very close to center for demo)
      const destLat = 34.0525;
      const destLng = -118.2435;

      const dist = Math.sqrt(Math.pow(lat - destLat, 2) + Math.pow(lng - destLng, 2)) * 111320; // Approx meters
      
      if (dist < 30) { // Within 30 meters
        setSessionActive(false);
        toast.success('Safe Arrival Detected! Virtual Escort session closed.', {
          icon: '🏠',
          duration: 6000
        });
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      }
    }
  }, [lat, lng, sessionActive, isConnected]);

  const startEscort = () => {
    const token = Math.random().toString(36).substring(2, 12).toUpperCase();
    const link = `${window.location.origin}/escort/${token}`;
    setEscortLink(link);
    setSessionActive(true);
    toast.success('Virtual Escort session started!');
  };

  const stopEscort = () => {
    setSessionActive(false);
    setEscortLink('');
    setLinkCopied(false);
    toast('Escort session ended', { icon: '✓' });
  };

  const copyLink = async () => {
    if (!escortLink) return;
    try {
      await navigator.clipboard.writeText(escortLink);
      setLinkCopied(true);
      toast.success('Tracking link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  // Calculate expiry countdown (45 min sessions)
  const expirySeconds = Math.max(0, 45 * 60 - elapsedSeconds);
  const expiryMin = Math.floor(expirySeconds / 60);
  const expirySec = expirySeconds % 60;

  return (
    <div className="bg-background text-on-surface font-body overflow-hidden h-screen flex flex-col relative">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <h1 className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl uppercase">IZUM</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      {/* Map Canvas */}
      <main className="relative flex-1 w-full bg-surface">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[#131319]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7PWhqT8-7jF6M2KPBnG0d9BaKTo3reStMgHcj6SUjr21A-WGq9kxNqWDHC8qYUjTg1dM6aMFwFYIInGA30TS8G9sPL0NZOeLj1htsUE4GOHKwtE2N62HYL6ZgZ48hUoAffO03GCxNRlvjsH_FU7Zbc-uZjo3dCFMF2RaIAz0IV5pgQfH4HhFRPLGgfSitLfpyjqtZXLF2n0Za9ynasCjWgngPgxrfEXKNmNu_3j3vwYRirnszeVlxpep4uSdz5WlvSK_yRf2z6E3W')", backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(100%) brightness(30%) contrast(120%)" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background/90 opacity-60"></div>
        </div>

        {/* Session Not Started — Start Card */}
        {!sessionActive && !escortToken && (
          <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
            <div className="glass-panel rounded-[2rem] p-8 w-full max-w-sm text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-secondary/30">
                <span className="material-symbols-outlined text-secondary text-4xl">share_location</span>
              </div>
              <h2 className="font-headline text-2xl font-black tracking-tight mb-2">Virtual Escort</h2>
              <p className="text-on-surface-variant text-sm mb-8">
                Share a live tracking link with a trusted contact until you arrive safely.
              </p>
              <button
                onClick={startEscort}
                className="w-full py-4 bg-gradient-to-r from-secondary to-secondary-container text-black font-bold rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start Escort Session
              </button>
            </div>
          </div>
        )}

        {/* Tracking Banner — active session */}
        {sessionActive && (
          <div className="absolute top-20 left-4 right-4 z-10 flex flex-col gap-2">
            <div className="glass-panel rounded-xl px-4 py-3 flex items-center justify-between border-t border-l border-white/10 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-secondary rounded-full animate-ping opacity-75"></div>
                </div>
                <div>
                  <p className="text-xs font-label text-secondary-dim uppercase tracking-[0.2em]">
                    {escortToken ? 'Viewing — Live' : 'Sharing — Live'}
                  </p>
                  <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-0.5">
                    {isConnected ? `GPS: ${lat.toFixed(4)}° N` : 'Awaiting GPS...'}
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-highest px-2 py-1 rounded text-[10px] font-label text-secondary tracking-tighter">
                {isConnected ? `${lat.toFixed(4)}° N` : 'No GPS'}
              </div>
            </div>

            {/* Expiration Notice */}
            <div className="self-center bg-error/10 border border-error/20 px-4 py-1.5 rounded-full backdrop-blur-md">
              <p className="text-[9px] font-label text-error uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                Session expires in {String(expiryMin).padStart(2, '0')}:{String(expirySec).padStart(2, '0')}
              </p>
            </div>
          </div>
        )}

        {/* Map Marker: Bus */}
        {sessionActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative group">
              <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-xl group-hover:bg-secondary/40 transition-all"></div>
              <div className="relative bg-secondary p-3 rounded-full shadow-[0px_0px_24px_rgba(0,227,253,0.5)] border-2 border-background flex items-center justify-center transform hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-background text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
              </div>
              {/* Route Trace Line */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-secondary/40 h-24 w-0.5 blur-[1px]"></div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Card */}
      <section className="relative z-30 pb-10 px-4 bg-background">
        <div className="glass-panel rounded-t-[2.5rem] p-6 border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.6)]">
          {/* Pull Handle */}
          <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6"></div>

          {sessionActive ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-on-surface mb-1">
                    {isConnected ? 'Tracking Active' : 'Session Active'}
                  </h2>
                  <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
                    {isConnected ? 'Live GPS • Encrypted' : 'Waiting for GPS signal'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-secondary tracking-tighter leading-none mb-1">
                    {isConnected ? `${Math.round(speed)}` : '—'}<span className="text-lg ml-0.5">mph</span>
                  </div>
                  <p className="text-[10px] font-label text-secondary uppercase tracking-[0.2em]">Current Speed</p>
                </div>
              </div>

              {/* Share Link */}
              {escortLink && (
                <div className="mb-4 bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">link</span>
                  <p className="flex-1 font-label text-xs text-on-surface-variant truncate">{escortLink}</p>
                  <button onClick={copyLink} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${linkCopied ? 'bg-primary/20 text-primary' : 'bg-secondary/10 text-secondary hover:bg-secondary/20'}`}>
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}

              {/* Meta Data Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-secondary">schedule</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">Elapsed</p>
                    <p className="text-sm font-bold text-on-surface">{formatTime(elapsedSeconds)}</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-secondary">gps_fixed</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">GPS Status</p>
                    <p className={`text-sm font-bold ${isConnected ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {isConnected ? 'Live' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={stopEscort}
                className="w-full py-3 bg-error/10 border border-error/30 text-error rounded-full font-bold text-sm uppercase tracking-widest hover:bg-error/20 transition-all"
              >
                End Escort Session
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-on-surface-variant font-label text-sm">Tap above to start a new Virtual Escort session</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <p className="text-[10px] font-label uppercase tracking-widest">End-to-End Encrypted Live Location</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VirtualEscort;
