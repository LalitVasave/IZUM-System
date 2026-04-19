import React from 'react';
import { useNavigate } from 'react-router-dom';

const ApiPayloadDocs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <h1 className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl uppercase">IZUM</h1>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <nav className="flex gap-6 font-label text-[10px] uppercase tracking-widest text-zinc-400">
            <a className="hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/architecture')}>Overview</a>
            <a className="text-[#39FF14] transition-colors duration-300 cursor-pointer">Efficiency</a>
            <a className="hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/network')}>Terminal</a>
          </nav>
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-16 relative">
        {/* Background Texture */}
        <div className="absolute inset-0 obsidian-grid opacity-[0.03] pointer-events-none -z-10"></div>

        {/* Hero: Payload Comparison */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <p className="font-label text-primary uppercase tracking-[0.3em] text-xs">Observatory Metrics // Efficiency</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
              Massive <br/>Efficiency. <br/><span className="text-primary">Micro Payload.</span>
            </h2>
            <p className="text-on-surface-variant max-w-md text-lg leading-relaxed">
              By rethinking the telemetry stack, we've reduced standard GPS data packets to the absolute physical minimum.
            </p>
          </div>
          <div className="space-y-6">
            {/* Naive Card */}
            <div className="bg-surface-container-low rounded-xl p-6 shadow-xl relative overflow-hidden group transition-all duration-500 hover:bg-surface-container border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-label text-[10px] uppercase text-on-surface-variant">Legacy protocol</span>
                  <h3 className="text-xl font-bold font-headline">Naive Tracker</h3>
                </div>
                <span className="text-error font-label font-bold text-2xl tracking-tighter">340B</span>
              </div>
              <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                <div className="bg-error h-full w-full opacity-60"></div>
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                <span>Standard JSON Payload</span>
                <span>Full Latency</span>
              </div>
            </div>
            {/* IZUM Card */}
            <div className="bg-surface-container rounded-xl p-6 shadow-2xl relative overflow-hidden group transition-all duration-500 ring-1 ring-primary/20 bg-gradient-to-br from-surface-container to-surface-container-high border border-white/5">
              <div className="absolute top-0 right-0 p-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#8eff71]"></div>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-label text-[10px] uppercase text-primary">Izum Binary Protocol</span>
                  <h3 className="text-xl font-bold font-headline">IZUM Core</h3>
                </div>
                <div className="text-right">
                  <span className="text-primary font-label font-bold text-2xl tracking-tighter">8B</span>
                  <div className="text-primary font-label text-[9px] uppercase">-94% Shrinkage</div>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full w-[6%] shadow-[0_0_15px_#8eff71]"></div>
                <div className="bg-surface-container-highest h-full w-[94%]"></div>
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] font-label text-primary uppercase tracking-widest">
                <span>Binary Bit-Stream</span>
                <span>Instantaneous</span>
              </div>
            </div>
          </div>
        </section>

        {/* Network Tiers */}
        <section className="space-y-8">
          <h3 className="font-label text-sm uppercase tracking-widest border-l-2 border-primary pl-4">Network Resilience Tiering</h3>
          <div className="space-y-4">
            <div className="group flex items-center justify-between p-6 bg-surface-container-low hover:bg-surface-container transition-all duration-300 rounded-lg cursor-default border-l-2 border-transparent hover:border-primary">
              <div className="flex gap-8 items-center">
                <span className="font-label text-on-surface-variant group-hover:text-primary">01</span>
                <div>
                  <h4 className="font-headline font-bold text-lg">Sub-Orbital Burst</h4>
                  <p className="text-on-surface-variant text-xs">Proprietary low-frequency binary relay</p>
                </div>
              </div>
              <div className="text-right font-label text-sm">
                <span className="text-primary">8 Bytes</span>
                <span className="mx-2 text-outline">/</span>
                <span className="text-on-surface-variant uppercase">0.02ms</span>
              </div>
            </div>
            <div className="group flex items-center justify-between p-6 bg-surface-container-low hover:bg-surface-container transition-all duration-300 rounded-lg cursor-default border-l-2 border-transparent hover:border-primary">
              <div className="flex gap-8 items-center">
                <span className="font-label text-on-surface-variant group-hover:text-primary">02</span>
                <div>
                  <h4 className="font-headline font-bold text-lg">LTE-M Tunnelling</h4>
                  <p className="text-on-surface-variant text-xs">Carrier-grade persistence for urban density</p>
                </div>
              </div>
              <div className="text-right font-label text-sm">
                <span className="text-primary">12 Bytes</span>
                <span className="mx-2 text-outline">/</span>
                <span className="text-on-surface-variant uppercase">0.08ms</span>
              </div>
            </div>
            <div className="group flex items-center justify-between p-6 bg-surface-container-low hover:bg-surface-container transition-all duration-300 rounded-lg cursor-default border-l-2 border-transparent hover:border-primary">
              <div className="flex gap-8 items-center">
                <span className="font-label text-on-surface-variant group-hover:text-primary">03</span>
                <div>
                  <h4 className="font-headline font-bold text-lg">Mesh-Over-Radio</h4>
                  <p className="text-on-surface-variant text-xs">Fallback local communication grid</p>
                </div>
              </div>
              <div className="text-right font-label text-sm">
                <span className="text-primary">16 Bytes</span>
                <span className="mx-2 text-outline">/</span>
                <span className="text-on-surface-variant uppercase">0.14ms</span>
              </div>
            </div>
          </div>
        </section>

        {/* ML Features Table */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-1 space-y-4">
            <h3 className="text-2xl font-bold font-headline uppercase">ML Telemetry Features</h3>
            <p className="text-on-surface-variant">Our edge models pre-process movement data to eliminate noise before transmission.</p>
            <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">neurology</span>
                </div>
                <span className="font-label text-xs uppercase tracking-tighter">Neural Edge Core 4.2</span>
              </div>
              <img className="w-full h-48 object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3YvOjMuUzAvTE-d_YTyQHsJT8dYwLKdeRu_Cqa5xyCMdTUiyM8Xo9JXVd1G2eBR4OlsgyLAerXM66zcr6mN1HrrzdZQXIBONuYG5l7yBr23Gd8pHxVOVST2iT5xXhzD-UXcNGtD-m0pZM-41qD56rbizgEgL0AM9TTR6NKeTtcHLP_uckC8FcUvuGu5vjJ9tK7Zpzz1uEvHd6RZdohjYWwB7NtFmcpN21aqUHwWfK3ENyvsyzV7gWd8j_WtGgAkzVz11FeOLdVm_Q" alt="Microchip"/>
            </div>
          </div>
          <div className="xl:col-span-2 overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Feature</th>
                  <th className="py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Model</th>
                  <th className="py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Accuracy</th>
                  <th className="py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 pr-4 font-headline font-medium">Trajectory Smoothing</td>
                  <td className="py-6 font-label text-sm text-secondary">Kalman-Lite v2</td>
                  <td className="py-6 font-label text-sm text-primary">99.98%</td>
                  <td className="py-6"><span className="px-2 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded">Active</span></td>
                </tr>
                <tr className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 pr-4 font-headline font-medium">Battery Optimization</td>
                  <td className="py-6 font-label text-sm text-secondary">VoltPredict L4</td>
                  <td className="py-6 font-label text-sm text-primary">98.40%</td>
                  <td className="py-6"><span className="px-2 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded">Active</span></td>
                </tr>
                <tr className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 pr-4 font-headline font-medium">Anomalous Stop Detection</td>
                  <td className="py-6 font-label text-sm text-secondary">Echobox-Net</td>
                  <td className="py-6 font-label text-sm text-primary">97.21%</td>
                  <td className="py-6"><span className="px-2 py-1 bg-white/10 text-on-surface-variant text-[10px] uppercase font-bold rounded">Syncing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* API Docs Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* WebSocket Code Block */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-label text-sm uppercase tracking-widest">WebSocket Real-time Stream</h3>
              <button className="flex items-center gap-2 text-primary font-label text-[10px] uppercase hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy Auth URL
              </button>
            </div>
            <div className="bg-black/80 rounded-xl p-6 font-label text-sm border border-white/10 shadow-2xl relative">
              <pre className="text-zinc-400 overflow-x-auto no-scrollbar"><code className="block whitespace-pre">
{`{
  "type": "TELEMETRY",
  "payload": {
    "lat": 34.0522,
    "lng": -118.2437,
    "speed": 22.5,
    "heading": 145,
    "tier": 1,
    "state": "ACTIVE",
    "ts": 1715830922
  }
}`}
              </code></pre>
            </div>
          </div>
          {/* Endpoints Accordion */}
          <div className="space-y-4">
            <h3 className="font-label text-sm uppercase tracking-widest">REST Endpoints</h3>
            <div className="space-y-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
              <div className="bg-surface-container-low p-4 cursor-pointer hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-primary text-on-primary-fixed text-[10px] font-bold rounded">GET</span>
                    <span className="font-label text-sm text-on-surface">/v1/devices/status</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                </div>
                <p className="text-on-surface-variant text-xs font-label">Returns real-time health and position for all fleet nodes.</p>
              </div>
              <div className="bg-surface-container p-4 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-secondary text-on-secondary-fixed text-[10px] font-bold rounded">POST</span>
                    <span className="font-label text-sm text-on-surface">/v1/deploy/wake</span>
                  </div>
                  <span className="material-symbols-outlined text-primary">expand_less</span>
                </div>
                <div className="mt-4 p-3 bg-surface-container-lowest rounded font-label text-[11px] text-primary/80 border border-primary/10">
                  <span className="text-on-surface-variant">Response:</span> {`{ "status": "waking", "eta_ms": 40 }`}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Map</span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Stops</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all active:scale-110 duration-200 ease-out cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Status</span>
        </div>
      </footer>
    </div>
  );
};

export default ApiPayloadDocs;
