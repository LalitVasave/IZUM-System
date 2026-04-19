import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ title = "Observatory", showBack = false, showLogout = false }) => {
  const navigate = useNavigate();
  const { clearAuth, isAuthenticated } = useAuthStore();
  const { lowDataMode, setLowDataMode } = useSettingsStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-black/50 backdrop-blur-2xl border-b border-primary/10">
      <div className="flex items-center justify-between px-6 h-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-xl">arrow_back</span>
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="font-headline font-black text-primary tracking-tighter text-2xl leading-none italic uppercase">
              IZUM
            </h1>
            <span className="font-label text-[9px] text-on-surface-variant font-black uppercase tracking-[0.3em] mt-0.5">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#8eff71]"></div>
               <span className="font-label font-black text-primary text-[10px] uppercase tracking-widest">Protocol_v4.2</span>
            </div>
          </nav>

          <button
            onClick={() => {
              const next = !lowDataMode;
              setLowDataMode(next);
              toast.success(next ? 'Low Data Mode: Active' : 'Low Data Mode: Disabled', { icon: '📊' });
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${
              lowDataMode 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(57,255,20,0.3)]' 
                : 'bg-surface-container-high border-white/5 text-on-surface-variant hover:border-primary/30'
            }`}
            title={lowDataMode ? "Disable Low Data Mode" : "Enable Low Data Mode"}
          >
            <span className="material-symbols-outlined text-lg">{lowDataMode ? 'data_saver_on' : 'data_saver_off'}</span>
          </button>
          
          {(showLogout || isAuthenticated()) && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/20 hover:bg-error/10 hover:border-error/30 transition-all group"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-error text-lg transition-colors">logout</span>
              <span className="hidden md:block font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-error transition-colors">Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
