import React from 'react';

const VEHICLES = [
  { id: 'IZUM-01', route: 'Campus Loop A', status: 'Active' },
  { id: 'IZUM-02', route: 'North Shuttle', status: 'Idle' },
  { id: 'IZUM-03', route: 'Express Line', status: 'Maintenance' },
];

interface VehicleSwitcherProps {
  currentVehicleId: string;
  onSelect: (id: string) => void;
  className?: string;
}

const VehicleSwitcher: React.FC<VehicleSwitcherProps> = ({ currentVehicleId, onSelect, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar ${className}`}>
      {VEHICLES.map((v) => (
        <button
          key={v.id}
          onClick={() => v.status !== 'Maintenance' && onSelect(v.id)}
          className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
            currentVehicleId === v.id
              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(142,255,113,0.3)]'
              : v.status === 'Maintenance'
              ? 'bg-surface-container-low border-white/5 text-zinc-600 cursor-not-allowed opacity-50'
              : 'bg-surface-container-low border-white/10 text-on-surface-variant hover:border-white/20 hover:text-on-surface'
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="font-label text-[10px] font-black tracking-tighter uppercase leading-none">{v.id}</span>
            <span className="font-label text-[8px] opacity-60 uppercase tracking-widest mt-0.5">{v.route}</span>
          </div>
          {currentVehicleId === v.id && (
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#8eff71]"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default VehicleSwitcher;
