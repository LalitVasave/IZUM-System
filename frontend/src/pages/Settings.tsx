import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    lowDataMode, setLowDataMode,
    hapticFeedback, setHapticFeedback,
    etaAlertThresholdMin, setEtaAlertThresholdMin,
    walkTimeMin, setWalkTimeMin,
    theme, setTheme,
  } = useSettingsStore();

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? 'bg-primary' : 'bg-zinc-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative">
      <header className="fixed top-0 w-full z-50 flex items-center gap-3 px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <span className="material-symbols-outlined text-primary">tune</span>
        <h1 className="font-['Inter'] font-black tracking-tighter text-primary text-xl">SETTINGS</h1>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-xl mx-auto space-y-6">

        {/* Theme */}
        <section className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
          <h2 className="font-headline font-bold text-lg uppercase italic tracking-tighter mb-4">Appearance</h2>
          <div className="flex gap-3">
            {(['dark', 'light', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-3 rounded-xl font-label text-xs uppercase tracking-widest font-bold border transition-all ${
                  theme === t ? 'bg-primary/10 border-primary text-primary' : 'border-white/5 text-zinc-500 hover:border-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* ETA Alert Threshold */}
        <section className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
          <h2 className="font-headline font-bold text-lg uppercase italic tracking-tighter mb-1">ETA Alert Threshold</h2>
          <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest mb-5">
            Notify when bus arrives within this many minutes
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={15}
              value={etaAlertThresholdMin}
              onChange={e => setEtaAlertThresholdMin(Number(e.target.value))}
              className="flex-1 accent-[#39FF14]"
            />
            <div className="bg-surface-container rounded-xl px-4 py-2 min-w-[60px] text-center">
              <span className="font-headline font-black text-xl text-primary">{etaAlertThresholdMin}</span>
              <span className="font-label text-[9px] text-zinc-500 block uppercase">min</span>
            </div>
          </div>
        </section>

        {/* Walk Time Preference */}
        <section className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
          <h2 className="font-headline font-bold text-lg uppercase italic tracking-tighter mb-1">My Walk to Stop</h2>
          <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest mb-5">
            Used for “Bus approaching” triggers (BUS CLOSE)
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={10}
              value={walkTimeMin}
              onChange={e => setWalkTimeMin(Number(e.target.value))}
              className="flex-1 accent-[#39FF14]"
            />
            <div className="bg-surface-container rounded-xl px-4 py-2 min-w-[80px] text-center">
              <span className="font-headline font-black text-xl text-primary">{walkTimeMin}</span>
              <span className="font-label text-[9px] text-zinc-500 block uppercase">min</span>
            </div>
          </div>
        </section>

        {/* Connectivity & Haptics */}
        <section className="bg-surface-container-low rounded-2xl p-6 border border-white/5 space-y-5">
          <h2 className="font-headline font-bold text-lg uppercase italic tracking-tighter">Connectivity</h2>
          {[
            { label: 'Low Data Mode', sub: 'Reduces telemetry payload frequency', value: lowDataMode, onChange: setLowDataMode },
            { label: 'Haptic Feedback', sub: 'Vibration on SOS and safety events', value: hapticFeedback, onChange: setHapticFeedback },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="font-label text-sm font-bold text-on-surface">{item.label}</p>
                <p className="font-label text-[10px] text-zinc-500 uppercase tracking-tighter mt-0.5">{item.sub}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </section>

        {/* App Version */}
        <div className="text-center font-mono text-[9px] text-zinc-700 uppercase tracking-[0.3em]">
          IZUM Platform • v2.4.0 • Kinetic Observatory Build
        </div>
      </main>
    </div>
  );
};

export default Settings;
