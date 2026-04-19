import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArchitectureDocs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary-fixed min-h-screen relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <span className="font-['Inter'] font-black tracking-tighter text-[#39FF14] text-xl">IZUM</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="font-['Inter'] font-bold tracking-tight text-lg text-[#39FF14] hover:text-[#39FF14] transition-colors duration-300 cursor-pointer">Architecture</a>
          <a className="font-['Inter'] font-bold tracking-tight text-lg text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/map')}>Fleet</a>
          <a className="font-['Inter'] font-bold tracking-tight text-lg text-zinc-400 hover:text-[#39FF14] transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>Analytics</a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-[#39FF14] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>account_circle</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto relative">
        {/* Background Texture */}
        <div className="absolute inset-0 obsidian-grid opacity-[0.03] pointer-events-none -z-10"></div>

        {/* Hero Title */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">System Infrastructure</span>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-none">
              KINETIC <br/> <span className="text-outline">OBSERVATORY</span>
            </h1>
          </div>
          <div className="font-label text-sm text-on-surface-variant flex gap-6 items-center">
            <div className="flex flex-col">
              <span className="text-primary">LATENCY</span>
              <span>14.2ms avg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-primary">NODES</span>
              <span>Active [08]</span>
            </div>
          </div>
        </div>

        {/* System Flow Diagram (Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Central Diagram Canvas */}
          <div className="md:col-span-8 glass-panel rounded-xl p-8 min-h-[500px] relative overflow-hidden group">
            <div className="absolute top-6 left-6 font-label text-xs text-on-surface-variant flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              LIVE_DATA_STREAM
            </div>
            {/* SVG Connectivity Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500">
              <g className="data-flow-line" fill="none" stroke="#8eff71" strokeOpacity="0.3" strokeWidth="1.5">
                <path d="M150 250 Q 250 250, 400 150" style={{ strokeDasharray: 10, animation: "flow 20s linear infinite" }}></path>
                <path d="M150 250 Q 250 250, 400 350" style={{ strokeDasharray: 10, animation: "flow 20s linear infinite" }}></path>
                <path d="M400 150 L 650 250" style={{ strokeDasharray: 10, animation: "flow 20s linear infinite" }}></path>
                <path d="M400 350 L 650 250" style={{ strokeDasharray: 10, animation: "flow 20s linear infinite" }}></path>
                <path d="M400 150 L 400 350" style={{ strokeDasharray: 10, animation: "flow 20s linear infinite" }}></path>
              </g>
            </svg>
            {/* Interactive Nodes */}
            <div className="relative h-full w-full flex items-center justify-between px-12">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-surface-container rounded-lg border border-white/5 flex flex-col items-center justify-center cursor-help group/node hover:border-primary transition-all duration-500 pulse-node">
                  <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                  <span className="font-label text-[10px] mt-1 text-on-surface-variant">GPS</span>
                </div>
              </div>
              <div className="flex flex-col gap-24">
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-surface-container rounded-lg border border-white/5 flex flex-col items-center justify-center cursor-help group/node hover:border-secondary transition-all duration-500">
                    <span className="material-symbols-outlined text-secondary text-3xl">api</span>
                    <span className="font-label text-[10px] mt-1 text-on-surface-variant">FASTAPI</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-surface-container rounded-lg border border-white/5 flex flex-col items-center justify-center cursor-help group/node hover:border-tertiary transition-all duration-500">
                    <span className="material-symbols-outlined text-tertiary text-3xl">psychology</span>
                    <span className="font-label text-[10px] mt-1 text-on-surface-variant">ML CORE</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-surface-container rounded-lg border border-white/5 flex flex-col items-center justify-center cursor-help group/node hover:border-primary transition-all duration-500">
                  <span className="material-symbols-outlined text-primary text-3xl">map</span>
                  <span className="font-label text-[10px] mt-1 text-on-surface-variant">RENDER</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tech Stack / Docker Section */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6 flex-1 flex flex-col gap-4">
              <h3 className="font-label text-xs text-primary uppercase tracking-widest">Docker Stack Build</h3>
              <div className="space-y-4">
                <div className="bg-surface-container-low p-3 rounded border-l-2 border-primary">
                  <div className="flex justify-between text-[10px] font-label mb-2">
                    <span>IMAGE: IZUM-GATEWAY</span>
                    <span className="text-primary">COMPILED</span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full"></div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-3 rounded border-l-2 border-secondary">
                  <div className="flex justify-between text-[10px] font-label mb-2">
                    <span>IMAGE: IZUM-REDIS-CACH</span>
                    <span className="text-secondary">SYNCING</span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-2/3"></div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-3 rounded border-l-2 border-tertiary">
                  <div className="flex justify-between text-[10px] font-label mb-2">
                    <span>IMAGE: IZUM-ML-TENSOR</span>
                    <span className="text-tertiary">QUEUED</span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-white/5">
                <div className="font-label text-[10px] text-zinc-500 mb-2">BUILD_VERSION</div>
                <div className="font-label text-xl text-on-surface">v11.4.0-stable</div>
              </div>
            </div>
            {/* Mini Log Stream */}
            <div className="bg-surface-container-lowest p-4 rounded-xl font-label text-[10px] text-primary/60 border border-primary/5 h-32 overflow-hidden flex flex-col gap-1">
              <div>[09:42:11] INITIALIZING WEBSOCKET CLUSTER...</div>
              <div>[09:42:12] GPS_STREAM_01: HANDSHAKE SUCCESS</div>
              <div>[09:42:12] REDIS_MASTER: PONG</div>
              <div>[09:42:13] ML_INSTANCE: RECOVERY_SUCCESS</div>
              <div className="animate-pulse">[09:42:14] SYSTEM_READY: LISTENING ON PORT 8080</div>
            </div>
          </div>
        </div>

        {/* State Machine Section */}
        <section className="mt-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-headline font-bold text-2xl tracking-tight uppercase">VEHICLE STATE ENGINE</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* State: ACTIVE */}
            <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-primary group hover:bg-surface-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-primary">sensors</span>
                <span className="font-label text-[10px] text-primary">01</span>
              </div>
              <h4 className="font-label font-bold text-sm mb-2">ACTIVE</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Full telemetry lock, high-frequency updates.</p>
            </div>
            {/* State: SPARSE */}
            <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-secondary group hover:bg-surface-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-secondary">wifi_tethering_off</span>
                <span className="font-label text-[10px] text-secondary">02</span>
              </div>
              <h4 className="font-label font-bold text-sm mb-2">SPARSE</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Reduced polling rate to conserve energy.</p>
            </div>
            {/* State: LOST */}
            <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-error group hover:bg-surface-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-error">signal_disconnected</span>
                <span className="font-label text-[10px] text-error">03</span>
              </div>
              <h4 className="font-label font-bold text-sm mb-2">LOST</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">No connection. Initiating dead reckoning.</p>
            </div>
            {/* State: BUFFERING */}
            <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-zinc-500 group hover:bg-surface-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-zinc-500">hourglass_empty</span>
                <span className="font-label text-[10px] text-zinc-500">04</span>
              </div>
              <h4 className="font-label font-bold text-sm mb-2">BUFFERING</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Storing data locally until handshake.</p>
            </div>
            {/* State: SYNCING */}
            <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-tertiary group hover:bg-surface-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-tertiary">sync</span>
                <span className="font-label text-[10px] text-tertiary">05</span>
              </div>
              <h4 className="font-label font-bold text-sm mb-2">SYNCING</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Uploading backlog. Prioritizing realtime.</p>
            </div>
          </div>
        </section>

        {/* Engineering Blog Post Excerpt */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h3 className="font-headline font-black text-3xl mb-6 tracking-tight uppercase">ENGINEERING THE <br/>REAL-TIME FABRIC</h3>
            <div className="space-y-4 text-on-surface-variant leading-relaxed text-sm">
              <p>At the core of the IZUM Kinetic Observatory lies a resilient event-driven architecture. We've moved beyond standard REST polling to a robust WebSocket-first implementation that handles over 2.4 million coordinate points per hour with sub-20ms latency.</p>
              <p>By leveraging Redis as an ephemeral cache layer, the FastAPI gateways can broadcast telemetry updates to connected clients without impacting the primary ML training pipeline, which runs asynchronously in a dedicated Docker swarm.</p>
            </div>
            <button className="mt-8 flex items-center gap-3 text-primary font-label text-xs tracking-widest uppercase hover:gap-5 transition-all">
              Read Whitepaper 
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-video">
            <img className="w-full h-full object-cover grayscale opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8qqH5B_ciVffbJkRgNmYBmO0PuFjAy-x0u3jbr8Buji6iBYNY6EOH2szaSaY2Edrhnc0ecIMQt864jp7P5MzL74V42Zorxw0UXc57UYUtEUagVlG2SELCzT13SWhEERiVfVa4wTQ1wTys6f4S8VmIGMr4tdWOPn0eO7MIIbKQTIVULXJvNdSdM3E8-jC7yszgyDdcA3FU6E0atbKjVa1iZLGaizPxn0No1sROn9mvI1iZceT2mP34EBMxDLn5C9XsMr-CnDVmjuaD" alt="Server Rack"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 font-label text-[10px] bg-primary/20 backdrop-blur-md px-2 py-1 rounded border border-primary/20">IZUM_CORE_V2_RACK_01</div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined text-2xl">map</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 scale-110 duration-200 ease-out cursor-pointer" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined text-2xl">departure_board</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Stops</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-2xl">analytics</span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Status</span>
        </a>
      </footer>

      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default ArchitectureDocs;
