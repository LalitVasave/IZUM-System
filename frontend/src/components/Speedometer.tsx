import React from 'react';

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
  size?: number;
  label?: string;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed = 60, size = 120, label = "MPH" }) => {
  const percentage = Math.min(100, (speed / maxSpeed) * 100);
  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-container-highest"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(142,255,113,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline font-black text-2xl tracking-tighter italic">{Math.floor(speed)}</span>
        <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant font-bold">{label}</span>
      </div>
    </div>
  );
};

export default Speedometer;
