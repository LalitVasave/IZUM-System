import React, { useState, useEffect } from 'react';

interface BiometricHandshakeProps {
  onSuccess: () => void;
  onCancel: () => void;
  actionName: string;
}

const BiometricHandshake: React.FC<BiometricHandshakeProps> = ({ onSuccess, onCancel, actionName }) => {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS'>('IDLE');

  useEffect(() => {
    if (status === 'IDLE') {
      const timer = setTimeout(() => setStatus('SCANNING'), 500);
      return () => clearTimeout(timer);
    }
    if (status === 'SCANNING') {
      const timer = setTimeout(() => setStatus('SUCCESS'), 2000);
      return () => clearTimeout(timer);
    }
    if (status === 'SUCCESS') {
      const timer = setTimeout(() => onSuccess(), 800);
      return () => clearTimeout(timer);
    }
  }, [status, onSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-surface-container-high border border-white/10 rounded-[40px] p-10 flex flex-col items-center max-w-[300px] w-full shadow-[0_32px_128px_rgba(0,0,0,0.8)]">
        
        <div className="relative w-24 h-24 mb-10">
          {/* Scanning Ring */}
          <div className={`absolute inset-0 border-4 rounded-3xl transition-all duration-500 ${
            status === 'SUCCESS' ? 'border-primary scale-110' : 'border-zinc-800'
          }`}></div>
          
          {status === 'SCANNING' && (
            <div className="absolute inset-0 bg-primary/10 rounded-3xl animate-pulse">
              <div className="w-full h-1 bg-primary/40 absolute top-0 animate-[scan_2s_infinite]"></div>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`material-symbols-outlined text-6xl transition-all duration-500 ${
              status === 'SUCCESS' ? 'text-primary' : 'text-zinc-500'
            }`} style={{ fontVariationSettings: status === 'SUCCESS' ? "'FILL' 1" : "'FILL' 0" }}>
              {status === 'SUCCESS' ? 'check_circle' : 'fingerprint'}
            </span>
          </div>
        </div>

        <h3 className="font-headline font-black text-xl text-center mb-2 uppercase tracking-tight italic">
          {status === 'SUCCESS' ? 'Verified' : 'Authenticating'}
        </h3>
        <p className="text-[10px] font-label text-zinc-500 uppercase tracking-[0.2em] text-center mb-10 leading-relaxed">
          {status === 'SUCCESS' ? 'Access Granted' : `Confirming identity for ${actionName}`}
        </p>

        <button 
          onClick={onCancel}
          className="text-zinc-500 hover:text-on-surface font-label text-[10px] uppercase tracking-widest transition-colors"
        >
          Cancel Request
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(88px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BiometricHandshake;
