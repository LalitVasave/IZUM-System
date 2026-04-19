import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen relative overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_12px_rgba(57,255,20,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#39FF14]">sensors</span>
          <span className="font-headline font-black tracking-tighter text-[#39FF14] text-xl">IZUM</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 items-center">
            <a className="font-headline font-bold tracking-tight text-lg text-[#39FF14] hover:text-[#39FF14] transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); navigate('/docs/architecture'); }}>Docs</a>
            <a className="font-headline font-bold tracking-tight text-lg text-zinc-400 hover:text-[#39FF14] transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); navigate('/docs/api'); }}>API</a>
            <a className="font-headline font-bold tracking-tight text-lg text-zinc-400 hover:text-[#39FF14] transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
          </nav>
          <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-[#39FF14] transition-colors" onClick={() => navigate('/login')}>account_circle</span>
        </div>
      </header>

      <main className="relative pt-24 pb-32">
        {/* Hero Section */}
        <section className="relative min-h-[819px] flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>
          </div>
          {/* Kinetic Map Preview */}
          <div className="absolute top-0 left-0 w-full h-full z-[-1] opacity-40">
            <div className="w-full h-full bg-cover bg-center grayscale brightness-50 contrast-125" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7xCsZPZQKD3Axx3-UqvjnPocDl4zUrcffyv7dQelvzLE44BtQued9mgeUFVBXR65xELj9hZc9e92KN3U8j-D5EGw7M7nggYaQ9dwllO_PHitnGlH323EMalWVbEZrflnHd-WjReptNMEMthaRt3a60CqzjTWFZkC4aRV02kZ10hv2-yW8cJukvceBz5H6AuJUuwZcN6QuqJA82MFY-1dboCXWQUr0-YLj4BsS9epbEPEXNqwegujMKIzKxaeKeX5jmhbPYAu7oDTy')" }}>
            </div>
          </div>
          <div className="text-center z-10 space-y-6">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#39FF14] text-glow uppercase leading-none">
              IZUM
            </h1>
            <p className="font-label text-secondary tracking-[0.2em] text-sm md:text-lg uppercase max-w-xl mx-auto leading-relaxed">
              The next-generation protocol for kinetic observability and campus mobility.
            </p>
            <div className="pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold text-lg pulse-primary transition-transform active:scale-95"
                  onClick={() => navigate('/demo')}
                >
                  5‑min Demo Tour
                </button>
                <button
                  className="px-10 py-4 rounded-full border border-white/15 bg-surface-container-low/40 text-on-surface font-bold text-lg hover:border-primary/30 hover:text-primary transition-colors"
                  onClick={() => navigate('/login')}
                >
                  Manual Mode
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* The Human Story Paragraph */}
        <section className="max-w-4xl mx-auto px-6 py-32 text-center">
          <h2 className="font-label text-on-surface-variant text-xs uppercase tracking-widest mb-8">Philosophy</h2>
          <p className="text-2xl md:text-4xl font-light text-on-surface leading-snug">
            Mobility isn't just about moving atoms. It's about <span className="text-primary font-bold">preserving momentum</span>. We built IZUM to bridge the gap between physical intent and digital visibility, ensuring every step, turn, and stop is captured with surgical precision.
          </p>
        </section>

        {/* Bento Grid Feature Cards */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full md:h-[600px]">
            {/* Card 1: Payload Reduction */}
            <div className="md:col-span-7 glass-panel rounded-xl p-10 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[160px]">analytics</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-primary rounded-full pulse-primary"></span>
                  <span className="font-label text-xs text-primary uppercase tracking-[0.3em]">Telemetry</span>
                </div>
                <h3 className="text-5xl font-black text-on-surface tracking-tight mb-4">94% Payload Reduction</h3>
                <p className="text-on-surface-variant text-lg max-w-md">Our proprietary compression algorithms ensure that tracking data remains lightweight without sacrificing resolution.</p>
              </div>
              <div className="font-label text-6xl text-primary font-bold">0.12<span className="text-xl">kb/s</span></div>
            </div>
            {/* Card 2: Dead Reckoning */}
            <div className="md:col-span-5 bg-surface-container-high rounded-xl p-10 flex flex-col justify-between border border-white/5 hover:border-primary/20 transition-all">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6">explore</span>
                <h3 className="text-3xl font-bold text-on-surface mb-2">Dead Reckoning</h3>
                <p className="text-on-surface-variant">Continuous positioning even in GNSS-denied environments. Resilience is not optional.</p>
              </div>
              <div className="mt-8 space-y-2">
                <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-primary"></div>
                </div>
                <div className="flex justify-between font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                  <span>Inertial Sync</span>
                  <span>85% Accuracy</span>
                </div>
              </div>
            </div>
            {/* Card 3: Honest ETA */}
            <div className="md:col-span-5 bg-surface-container-low rounded-xl p-10 flex flex-col justify-center border border-white/5 hover:bg-surface-container transition-colors">
              <h3 className="text-3xl font-bold text-on-surface mb-2">Honest ETA</h3>
              <p className="text-on-surface-variant mb-6">No more buffer manipulation. Predictive arrival times based on real-time kinetic flux.</p>
              <div className="p-6 rounded-lg bg-surface-container-lowest flex items-center justify-between border-l-4 border-secondary">
                <div>
                  <div className="font-label text-[10px] text-secondary uppercase mb-1">Arriving in</div>
                  <div className="text-3xl font-black text-on-surface">2m 45s</div>
                </div>
                <span className="material-symbols-outlined text-secondary text-4xl">schedule</span>
              </div>
            </div>
            {/* Card 4: Micro-data badge */}
            <div className="md:col-span-7 glass-panel rounded-xl p-10 overflow-hidden relative border border-white/5">
              <div className="flex h-full items-center justify-between gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-on-surface mb-2">Edge Computation</h3>
                  <p className="text-on-surface-variant">Processing occurs at the point of kinetic origin. Instant feedback loops.</p>
                </div>
                <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-dashed border-primary/20">
                  <span className="material-symbols-outlined text-primary text-5xl">memory</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Specs Section */}
        <section className="max-w-4xl mx-auto px-6 py-32 space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 border-b border-white/10 pb-4">
            <h2 className="text-4xl font-bold tracking-tight">Technical Specs</h2>
            <span className="font-label text-primary text-xs uppercase tracking-widest">v4.0.2 Stable</span>
          </div>
          <div className="space-y-12">
            <div className="flex items-start gap-8">
              <span className="font-label text-zinc-600 text-lg">01</span>
              <div>
                <h4 className="text-xl font-bold mb-2">Zero-Latency Sync</h4>
                <p className="text-on-surface-variant leading-relaxed">State updates are broadcasted via a custom UDP tunnel, bypassing standard HTTP overhead for sub-50ms reaction times.</p>
              </div>
            </div>
            <div className="flex items-start gap-8">
              <span className="font-label text-zinc-600 text-lg">02</span>
              <div>
                <h4 className="text-xl font-bold mb-2">Dynamic Re-routing</h4>
                <p className="text-on-surface-variant leading-relaxed">The graph engine recalculates navigation paths every 500ms based on obstacle density sensors.</p>
              </div>
            </div>
            <div className="flex items-start gap-8">
              <span className="font-label text-zinc-600 text-lg">03</span>
              <div>
                <h4 className="text-xl font-bold mb-2">Security at Rest</h4>
                <p className="text-on-surface-variant leading-relaxed">Hardware-level encryption ensures that kinetic data is anonymized before it ever leaves the local edge node.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-zinc-950/60 backdrop-blur-2xl rounded-t-3xl border-t-[0.5px] border-white/15 shadow-[0px_-24px_48px_rgba(0,0,0,0.4)]">
        <button className="flex flex-col items-center justify-center text-[#39FF14] bg-[#39FF14]/10 rounded-full px-5 py-1.5 transition-all duration-200 ease-out active:scale-110" onClick={() => navigate('/map')}>
          <span className="material-symbols-outlined">map</span>
          <span className="font-label text-[10px] uppercase tracking-widest mt-1">Map</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all" onClick={() => navigate('/stops')}>
          <span className="material-symbols-outlined">departure_board</span>
          <span className="font-label text-[10px] uppercase tracking-widest mt-1">Stops</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label text-[10px] uppercase tracking-widest mt-1">Status</span>
        </button>
      </footer>

      {/* Grid Layout Background Helper */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]" style={{ backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)", backgroundSize: "100px 100px" }}></div>
    </div>
  );
};

export default LandingPage;
