import React from 'react';
import type { NetworkTier } from '../store/useVehicleStore';

export type { NetworkTier };

interface SignalBarsProps {
  tier?: NetworkTier;
  level?: number; // 0-4
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SignalBars: React.FC<SignalBarsProps> = ({ 
  tier, 
  level, 
  size = 'md', 
  showLabel = false,
  className = '' 
}) => {
  // Convert tier to level if provided
  let effectiveLevel = level ?? 0;
  if (tier) {
    const tierMap: Record<NetworkTier, number> = {
      ACTIVE: 4,
      REDUCED: 3,
      MINIMAL: 2,
      SPARSE: 1,
      DEAD: 0
    };
    effectiveLevel = tierMap[tier];
  }

  const heights = {
    sm: ['h-1.5', 'h-2.5', 'h-3.5', 'h-4.5'],
    md: ['h-2', 'h-3.5', 'h-5', 'h-6.5'],
    lg: ['h-3', 'h-5', 'h-7', 'h-9']
  }[size];

  const widths = {
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1.5'
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-end gap-1 h-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${widths} ${heights[i]} rounded-t-[1px] transition-all duration-700 ${
              i < effectiveLevel
                ? effectiveLevel === 1 ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                  : effectiveLevel <= 2 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                  : 'bg-primary shadow-[0_0_8px_rgba(142,255,113,0.5)]'
                : 'bg-white/10'
            }`}
          ></div>
        ))}
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="font-label text-[8px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Signal</span>
          <span className={`font-label text-[10px] font-bold uppercase tracking-widest leading-none ${
            effectiveLevel <= 1 ? 'text-error' : effectiveLevel <= 2 ? 'text-amber-500' : 'text-primary'
          }`}>
            {tier || (effectiveLevel === 4 ? 'FULL' : effectiveLevel === 0 ? 'DEAD' : 'STABLE')}
          </span>
        </div>
      )}
    </div>
  );
};

export default SignalBars;
