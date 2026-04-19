import React, { useState, useEffect } from 'react';

interface Event {
  id: string;
  type: 'INFO' | 'WARN' | 'ALERT' | 'SYSTEM';
  msg: string;
  ts: string;
}

const LiveEventStream: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const mockEvents = [
      { id: '1', type: 'SYSTEM', msg: 'Observatory Node IZUM-01 Heartbeat established', ts: new Date().toLocaleTimeString() },
      { id: '2', type: 'INFO', msg: 'Route Maker persistence synced to local_node', ts: new Date().toLocaleTimeString() },
      { id: '3', type: 'WARN', msg: 'Packet delay detected in sector_G4', ts: new Date().toLocaleTimeString() },
    ] as Event[];
    
    setEvents(mockEvents);

    const interval = setInterval(() => {
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9),
        type: Math.random() > 0.8 ? 'ALERT' : Math.random() > 0.6 ? 'WARN' : 'INFO',
        msg: [
          'GPS Handshake validated',
          'Telemetry stream optimized',
          'Biometric cache cleared',
          'Node synchronization active',
          'Encryption cycle complete',
          'Unusual latency in API_REFRESH',
        ][Math.floor(Math.random() * 6)],
        ts: new Date().toLocaleTimeString()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 10));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 font-mono text-[10px] relative overflow-hidden h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-zinc-400 uppercase tracking-[0.2em] font-bold">GLOBAL_EVENT_STREAM</span>
        </div>
        <span className="text-zinc-600 uppercase tracking-widest text-[8px]">Live Feed • V2.4.0</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
        {events.map((e) => (
          <div key={e.id} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="text-zinc-700 whitespace-nowrap">[{e.ts}]</span>
            <span className={`font-bold whitespace-nowrap min-w-[40px] ${
              e.type === 'ALERT' ? 'text-error' : 
              e.type === 'WARN' ? 'text-amber-500' : 
              e.type === 'SYSTEM' ? 'text-secondary' : 'text-primary/60'
            }`}>{e.type}</span>
            <span className="text-zinc-400 leading-relaxed">{e.msg}</span>
          </div>
        ))}
      </div>

      {/* Matrix Backdrop Effect */}
      <div className="absolute inset-0 obsidian-grid opacity-[0.05] pointer-events-none"></div>
    </div>
  );
};

export default LiveEventStream;
