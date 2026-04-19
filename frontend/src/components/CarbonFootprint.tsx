import React from 'react';

interface CarbonFootprintProps {
  milesSaved: number;
  className?: string;
}

const CarbonFootprint: React.FC<CarbonFootprintProps> = ({ milesSaved, className = '' }) => {
  // Approx 404 grams of CO2 per mile for a passenger car
  const kgSaved = (milesSaved * 0.404).toFixed(2);
  const treesEquivalent = (milesSaved / 100).toFixed(1);

  return (
    <div className={`bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">eco</span>
        </div>
        <div className="text-right">
          <p className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-bold">Sustainability Impact</p>
          <p className="text-[10px] text-zinc-500 font-label uppercase mt-0.5">Campus Clean-Air Initiative</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter text-on-surface">
            {kgSaved}<span className="text-sm ml-1 text-primary">kg CO₂</span>
          </h3>
          <p className="text-[10px] font-label text-zinc-500 uppercase tracking-widest mt-1">Total Carbon Offset</p>
        </div>

        <div className="flex items-center gap-4 py-3 border-y border-white/5">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-label text-[9px] text-zinc-400 uppercase">Tree Recovery</span>
              <span className="font-label text-[9px] text-primary font-bold">{treesEquivalent} Trees</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(100, (milesSaved / 500) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <p className="text-[9px] font-label text-zinc-500 leading-relaxed uppercase tracking-tighter italic">
          *Calculated based on standard passenger vehicle emissions vs shared campus electric transit.
        </p>
      </div>

      {/* Decorative Leaf in Background */}
      <span className="absolute -bottom-4 -right-4 material-symbols-outlined text-8xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">eco</span>
    </div>
  );
};

export default CarbonFootprint;
