import React, { useState, useEffect } from 'react';

const ConnectivityBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 w-full z-[100] bg-error text-on-error py-2 px-6 flex items-center justify-center gap-3 animate-slide-down">
        <span className="material-symbols-outlined text-sm animate-pulse">cloud_off</span>
        <span className="font-label text-[10px] uppercase tracking-widest font-bold">Offline Mode — Data is currently static</span>
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="fixed top-0 left-0 w-full z-[100] bg-primary text-on-primary py-2 px-6 flex items-center justify-center gap-3 animate-slide-down">
        <span className="material-symbols-outlined text-sm">cloud_done</span>
        <span className="font-label text-[10px] uppercase tracking-widest font-bold">Back Online — Synchronizing...</span>
      </div>
    );
  }

  return null;
};

export default ConnectivityBanner;
