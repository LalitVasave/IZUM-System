import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, SignalLow, SignalZero, WifiOff, Zap } from 'lucide-react';
import useVehicleStore from '../store/useVehicleStore';

const HonestStatusBar: React.FC = () => {
  const { state } = useVehicleStore();

  const states = {
    ACTIVE: {
      label: 'Signal: High Frequency',
      sub: '5s polling • High Accuracy',
      icon: <Signal className="w-4 h-4" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20'
    },
    SPARSE: {
      label: 'Signal: Reduced Tier',
      sub: '15s polling • Low Accuracy',
      icon: <SignalLow className="w-4 h-4" />,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20'
    },
    LOST: {
      label: 'Signal: Minimal Tier',
      sub: '30s polling • Dead Reckoning Active',
      icon: <SignalZero className="w-4 h-4" />,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20'
    },
    BUFFERING: {
      label: 'Signal: Dead Zone',
      sub: 'Projecting last known trajectory',
      icon: <WifiOff className="w-4 h-4" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20'
    },
    SYNCING: {
        label: 'Synchronizing...',
        sub: 'Restoring telemetry stream',
        icon: <Zap className="w-4 h-4 animate-pulse" />,
        color: 'text-primary',
        bg: 'bg-primary/10 border-primary/20'
    }
  };

  const current = states[state] || states.ACTIVE;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-6 left-6 right-6 p-4 rounded-2xl border flex items-center gap-4 z-50 glass-panel ${current.bg}`}
      >
        <div className={`p-2 rounded-xl bg-black/20 ${current.color}`}>
          {current.icon}
        </div>
        <div className="flex-grow">
          <h5 className={`text-xs font-bold uppercase tracking-widest ${current.color}`}>
            {current.label}
          </h5>
          <p className="text-[10px] text-white/40 font-medium mt-0.5">
            {current.sub}
          </p>
        </div>
        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white/20 uppercase tracking-tighter">
          RESILIENCE v1.0
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HonestStatusBar;
