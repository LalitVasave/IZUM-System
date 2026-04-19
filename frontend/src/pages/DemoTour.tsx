import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';

type Step = {
  title: string;
  path: string;
  seconds: number;
  note: string;
  before?: () => Promise<void> | void;
};

const DEMO_EMAIL = 'demo@campus.edu';
const DEMO_PASSWORD = 'Demo@1234';

const DemoTour: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { setLowDataMode, setHapticFeedback, setWalkTimeMin } = useSettingsStore();

  const [running, setRunning] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const [remaining, setRemaining] = React.useState(0);
  const timerRef = React.useRef<number | null>(null);

  const steps = React.useMemo<Step[]>(() => [
    {
      title: 'Dashboard (status + signal)',
      path: '/dashboard',
      seconds: 25,
      note: 'Shows WS connectivity, signal bars, telemetry panels.',
    },
    {
      title: 'Live Map (GPS + BUS CLOSE)',
      path: '/map',
      seconds: 45,
      note: 'Auto-requests user location, shows user dot, BUS CLOSE triggers from ETA + walk time.',
      before: () => {
        setWalkTimeMin(3);
        setHapticFeedback(true);
      },
    },
    {
      title: 'Stops (distance sorting + approaching)',
      path: '/stops',
      seconds: 35,
      note: 'Sorted by distance if GPS allowed; approaching cards rise to top.',
    },
    {
      title: 'ETA Detail (range + confidence)',
      path: '/eta/00000000-0000-0000-0000-000000000004',
      seconds: 25,
      note: 'If stop ID not found, page still demonstrates the UI with fallback demo ETA.',
    },
    {
      title: 'Route Maker (personal route)',
      path: '/route-maker',
      seconds: 35,
      note: 'Drag/drop stops, save a custom route (student-only).',
    },
    {
      title: 'Network Simulation (signal tiers)',
      path: '/network',
      seconds: 35,
      note: 'Switch tiers; if simulator is offline the UI still updates locally.',
    },
    {
      title: 'Safety Hub',
      path: '/safety',
      seconds: 20,
      note: 'Entry point for SOS + Virtual Escort.',
    },
    {
      title: 'Silent SOS',
      path: '/safety/sos',
      seconds: 30,
      note: '3-tap / biometric flow demo; uses geolocation if available.',
    },
    {
      title: 'Virtual Escort (generate/share)',
      path: '/safety/escort',
      seconds: 30,
      note: 'Generate a token-based viewer link. (Some parts depend on backend endpoints.)',
    },
    {
      title: 'Ghost Bus / Anomaly Screen',
      path: '/anomaly',
      seconds: 25,
      note: 'Shows anomaly UI and real-time alerts (if backend flags anomalies).',
      before: () => {
        setLowDataMode(true);
      },
    },
    {
      title: 'Settings (walk time + low data)',
      path: '/settings',
      seconds: 25,
      note: 'Adjust walk time (BUS CLOSE), low data mode, haptics, theme.',
    },
  ], [setHapticFeedback, setLowDataMode, setWalkTimeMin]);

  const loginDemo = React.useCallback(async () => {
    const res = await api.post('/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setAuth(res.data.access_token, res.data.user);
  }, [setAuth]);

  const stop = React.useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  }, []);

  const start = React.useCallback(async () => {
    setRunning(true);
    setIdx(0);
    try {
      await loginDemo();
      toast.success('Demo login ready');
    } catch (e) {
      setRunning(false);
      toast.error(getApiErrorMessage(e, 'Demo login failed. Run backend + seed the DB.'));
      return;
    }
  }, [loginDemo]);

  React.useEffect(() => {
    if (!running) return;
    const step = steps[idx];
    if (!step) {
      stop();
      toast.success('Demo tour complete');
      navigate('/dashboard');
      return;
    }

    Promise.resolve(step.before?.()).catch(() => undefined);
    navigate(step.path);
    setRemaining(step.seconds);

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          setIdx((i) => i + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running, idx, steps, navigate, stop]);

  const current = steps[idx];

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pt-20 px-6 pb-24">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">sensors</span>
          <span className="font-['Inter'] font-black tracking-tighter text-primary text-xl">DEMO TOUR</span>
        </div>
        <div className="flex items-center gap-3">
          {running ? (
            <button
              className="px-4 py-2 rounded-full bg-error/15 border border-error/30 text-error font-bold text-xs uppercase tracking-widest"
              onClick={stop}
            >
              Stop
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold text-xs uppercase tracking-widest"
              onClick={() => void start()}
            >
              Start 5‑min demo
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant mb-2">Now playing</p>
          <h1 className="text-2xl font-black tracking-tight">{current ? current.title : 'Ready'}</h1>
          <p className="text-on-surface-variant mt-2">{current ? current.note : 'Tap Start to auto-run the demo.'}</p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Step {Math.min(idx + 1, steps.length)} / {steps.length}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              {running ? `${remaining}s` : 'paused'}
            </div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round(((idx) / steps.length) * 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant mb-3">Manual controls</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {steps.map((s) => (
              <button
                key={s.path}
                onClick={() => navigate(s.path)}
                className="px-3 py-3 rounded-xl border border-white/10 bg-surface-container-low hover:border-primary/30 hover:text-primary transition-colors text-left"
              >
                <div className="text-xs font-bold">{s.title}</div>
                <div className="text-[10px] text-on-surface-variant mt-1">{s.seconds}s</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-[10px] text-on-surface-variant uppercase tracking-[0.25em]">
          Tip: Run `start-izum.bat` and ensure Postgres + Redis are running.
        </div>
      </main>
    </div>
  );
};

export default DemoTour;

