import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import toast from 'react-hot-toast';

const GhostBusAlert: React.FC = () => {
  const navigate = useNavigate();
  const { anomaly, isConnected } = useWebSocket();
  const [countdown, setCountdown] = useState(42);
  const [reported, setReported] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-close countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [navigate]);

  const handleReport = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setReported(true);
    toast.success('Ghost Bus reported to admin — security notified', {
      duration: 6000,
      style: { background: '#ef4444', color: '#fff' }
    });
  };

  const handleDismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate(-1);
  };

  // Use real anomaly data if available, otherwise demo
  const alertData = anomaly
    ? {
        vehicleId: anomaly.type || 'UNKNOWN',
        route: 'Campus Loop',
        status: anomaly.message,
        stationaryTime: 'Unknown',
      }
    : {
        vehicleId: 'LX-4092',
        route: 'North Campus Loop',
        status: 'Non-Responsive — 0 GPS pings',
        stationaryTime: '18 minutes',
      };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed overflow-hidden h-screen relative">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-error/10 rounded-full border border-error/20">
            <div className="w-1.5 h-1.5 bg-error rounded-full animate-pulse"></div>
            <span className="font-label text-[10px] uppercase tracking-widest text-error">ANOMALY</span>
          </div>
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      {/* Main Canvas: Map Backdrop */}
      <main className="relative w-full h-screen">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover grayscale opacity-40 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQO82hCSY36gV45PY4hzkNFoWTW136Q8HV7CwjXkI4ogSD5BZ0I1E3gPNpZHvFuezZISbRCEb5nrFCTD_6Oz8oUZ7QGaLPHdG96bbp375EhZL3rGRXOYUkhfo_bFL-wtV_DFjd_j946saiwtzmVQCokO4d-7rndd_DVSujoHmrWhUz1bJk9A7FeOA5TgQT1dp-PsPhNBVh-mAk-HemIeww8oxuRhFi4z7SMYjWvnXzR1ZcGXQ32v9D7YuWNV4QhGhxsajtEx7qL7kX" alt="Background Map" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80"></div>
        </div>

        {/* Pulse Marker Behind Modal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-error/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute w-16 h-16 bg-primary/10 rounded-full animate-ping"></div>
            <span className="material-symbols-outlined text-error text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mist</span>
          </div>
        </div>

        {/* Semi-transparent Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20"></div>

        {/* Alert Modal Container */}
        <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-surface-container/80 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.4),0px_0px_12px_rgba(142,255,113,0.08)] overflow-hidden border border-white/5">
            {/* Countdown Ring */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="49" stroke="rgba(142, 255, 113, 0.1)" strokeWidth="0.5"></circle>
              <circle
                cx="50" cy="50" fill="none" r="49" stroke="#8eff71"
                strokeDasharray="308"
                strokeDashoffset={String(308 - (countdown / 42) * 308)}
                strokeWidth="1.5"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              ></circle>
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Floating Ghost Icon */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <div className="w-20 h-20 bg-surface-container-highest rounded-3xl flex items-center justify-center border border-primary/30 shadow-2xl">
                  <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>mist</span>
                </div>
              </div>

              {/* Alert Header */}
              <div className="mb-2">
                <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block">
                  {anomaly ? 'Live Anomaly Detected' : 'Anomaly Detected'}
                </span>
                <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Ghost Bus Alert</h1>
              </div>

              {/* Bus Telemetry Details */}
              <div className="w-full bg-surface-container-low rounded-2xl p-4 my-6 flex flex-col gap-3">
                <div className="flex justify-between items-center px-2">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Vehicle ID</span>
                  <span className="font-label text-sm text-primary font-bold">{alertData.vehicleId}</span>
                </div>
                <div className="h-px bg-white/5 w-full"></div>
                <div className="flex justify-between items-center px-2">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Route</span>
                  <span className="font-label text-sm text-on-surface font-bold uppercase">{alertData.route}</span>
                </div>
                <div className="h-px bg-white/5 w-full"></div>
                <div className="flex flex-col items-center gap-1 py-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-sm">emergency_home</span>
                    <span className="font-label text-error text-xs font-bold uppercase tracking-tighter">
                      Status: {reported ? 'REPORTED' : 'Non-Responsive'}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-sm font-medium">{alertData.status}</p>
                  {alertData.stationaryTime !== 'Unknown' && (
                    <p className="text-on-surface-variant text-sm font-medium">
                      Stationary for <span className="text-on-surface font-bold">{alertData.stationaryTime}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className={`w-full py-4 rounded-full font-headline font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                    reported
                      ? 'bg-surface-container border border-primary/30 text-primary cursor-not-allowed'
                      : 'bg-error border border-error/50 text-on-error hover:scale-[1.02] active:scale-95 shadow-[0px_8px_16px_rgba(255,115,81,0.2)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{reported ? 'check_circle' : 'report'}</span>
                  {reported ? 'Reported to Admin' : 'Report to Admin'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full bg-transparent border border-outline-variant text-on-surface-variant py-4 rounded-full font-headline font-bold text-sm tracking-wide hover:bg-white/5 hover:text-on-surface transition-all"
                >
                  Dismiss Alert
                </button>
              </div>

              {/* Timer Countdown Text */}
              <div className="mt-6">
                <span className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                  Auto-closing in {countdown}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Detail: Telemetry Stream */}
        <div className="absolute bottom-12 right-12 z-10 hidden lg:block opacity-20">
          <div className="flex flex-col items-end font-label text-[10px] text-primary gap-1">
            <span>ANOMALY_TYPE: {anomaly?.type || 'GHOST_BUS'}</span>
            <span>WS_STATUS: {isConnected ? 'LIVE' : 'RECONNECTING'}</span>
            <span>RETRY_ATTEMPT: 04</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GhostBusAlert;
