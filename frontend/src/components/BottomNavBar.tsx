import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: 'home', path: '/dashboard' },
    { label: 'Map', icon: 'map', path: '/map' },
    { label: 'Nodes', icon: 'hub', path: '/stops' },
    { label: 'Safety', icon: 'shield_person', path: '/safety' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4">
       <div className="bg-surface-container-low/60 backdrop-blur-3xl rounded-[2.5rem] border border-outline-variant/20 shadow-[0_-24px_48px_rgba(0,0,0,0.6)] flex justify-around items-center h-20 max-w-lg mx-auto overflow-hidden relative">
          {/* Active Accent Layer */}
          <div className="absolute inset-0 obsidian-grid opacity-[0.03] pointer-events-none"></div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center h-full flex-1 transition-all duration-500 relative ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-12 h-1 bg-primary rounded-full shadow-[0_0_12px_#8eff71]"></div>
                )}
                <span className={`material-symbols-outlined text-2xl transition-all ${isActive ? 'scale-110' : ''}`}>
                   {item.icon}
                </span>
                <span className={`font-label text-[8px] font-black uppercase tracking-[0.2em] mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
       </div>
    </footer>
  );
};

export default BottomNavBar;
