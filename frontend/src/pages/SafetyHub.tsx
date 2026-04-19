import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';

const SafetyHub: React.FC = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      id: 'sos',
      title: 'Silent SOS',
      desc: 'Discreetly notify campus security of your emergency and location.',
      icon: 'report',
      path: '/safety/sos',
      color: 'border-error text-error bg-error/5',
      tag: 'EMERGENCY'
    },
    {
      id: 'escort',
      title: 'Virtual Escort',
      desc: 'Share a live tracking link with a friend until you reach your stop.',
      icon: 'share_location',
      path: '/safety/escort',
      color: 'border-primary text-primary bg-primary/5',
      tag: 'PROTECTION'
    }
  ];

  return (
    <div className="bg-black text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 obsidian-grid opacity-[0.05] pointer-events-none"></div>
      <TopAppBar title="Safety Protocols" showBack={true} />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto space-y-8">
        {/* Security Status Banner */}
        <div className="glass-panel p-6 rounded-[2rem] border-l-4 border-primary flex items-center gap-4 bg-surface-container-low shadow-xl">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">lock</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Encrypted Connection</h3>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold leading-tight">Your location is shared only with authorized nodes</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-headline text-3xl font-black tracking-tight uppercase italic leading-none">Active <span className="text-primary">Protocols</span></h2>
          <p className="font-label text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-bold">Select a safety service to initiate</p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          {safetyFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => navigate(feature.path)}
              className={`glass-panel p-8 rounded-[2.5rem] border shadow-2xl cursor-pointer group hover:scale-[1.02] transition-all ${feature.color}`}
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center border border-current/20">
                  <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest border border-current uppercase">
                  {feature.tag}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="font-headline text-3xl font-extrabold tracking-tighter">{feature.title}</h3>
                  <p className="text-on-surface-variant text-sm max-w-[220px] leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover:bg-current group-hover:text-black transition-all">
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Info Accent */}
        <div className="pt-6 px-4">
           <div className="flex items-start gap-4 opacity-40">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <p className="font-label text-[9px] uppercase tracking-widest leading-relaxed font-bold">
                 IZUM uses real-time GPS telemetry and end-to-end encryption to ensure campus security has the fastest possible response time. Node_ID: 0x44FB.
              </p>
           </div>
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
};

export default SafetyHub;
