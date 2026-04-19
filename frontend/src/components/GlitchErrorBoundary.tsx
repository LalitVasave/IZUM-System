import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlitchErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-mono overflow-hidden relative">
          {/* Glitch Overlay */}
          <div className="absolute inset-0 obsidian-grid opacity-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-error/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10 text-center max-w-md">
            <h1 className="text-8xl font-black italic tracking-tighter text-error mb-4 uppercase" style={{ animation: 'glitch 0.3s infinite' }}>
              FAULT
            </h1>
            <div className="bg-error/20 border border-error/40 p-6 rounded-2xl backdrop-blur-3xl mb-8">
              <p className="font-label text-xs text-error font-bold uppercase tracking-[0.2em] mb-4">Node_Corruption_Detected</p>
              <div className="h-px w-full bg-error/20 mb-4"></div>
              <p className="text-[10px] text-zinc-500 uppercase leading-relaxed text-left">
                {this.state.error?.message || 'Unknown system exception in sector_main.'}
              </p>
              <div className="mt-6 flex flex-col gap-2 font-mono text-[9px] text-zinc-600 text-left">
                <p>{`> TRACE: [CORE_DUMP_v1.2.0]`}</p>
                <p>{`> STATUS: STACK_OVERFLOW_CATCH`}</p>
                <p className="text-error/60">{`> ERR: FATAL_COMPONENT_COLLISION`}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-error text-black font-bold rounded-full uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,49,49,0.3)]"
            >
              Reboot System
            </button>
          </div>

          <style>{`
            @keyframes glitch {
              0% { transform: translate(0); text-shadow: 2px 2px #ff3131; }
              25% { transform: translate(-2px, 2px); text-shadow: -2px -2px #ff3131; }
              50% { transform: translate(-2px, -2px); text-shadow: 2px -2px #ff3131; }
              75% { transform: translate(2px, 2px); text-shadow: -2px 2px #ff3131; }
              100% { transform: translate(0); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlitchErrorBoundary;
