import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

// Auth
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ConnectivityBanner from './components/ConnectivityBanner';

// Core App
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Stops from './pages/Stops';
import ETADetail from './pages/ETADetail';

// Safety
import SafetyHub from './pages/SafetyHub';
import SilentSOS from './pages/SilentSOS';
import VirtualEscort from './pages/VirtualEscort';

// Features
import LateNightMode from './pages/LateNightMode';
import GhostBusAlert from './pages/GhostBusAlert';
import NetworkSimulation from './pages/NetworkSimulation';
import RouteMaker from './pages/RouteMaker';

// Docs
import ArchitectureDocs from './pages/ArchitectureDocs';
import ApiPayloadDocs from './pages/ApiPayloadDocs';
import Settings from './pages/Settings';
import DemoTour from './pages/DemoTour';

// Guards & Contexts
import ProtectedRoute from './components/ProtectedRoute';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

const GlobalAlertListener = () => {
  const { anomaly } = useWebSocket();

  useEffect(() => {
    if (anomaly) {
      toast.error(`⚠️ ANOMALY DETECTED: ${anomaly.message}`, {
        duration: 8000,
        style: { background: '#ef4444', color: '#fff' }
      });
    }
  }, [anomaly]);

  return null;
};

function App() {
  const [isLateNight, setIsLateNight] = useState(false);

  useEffect(() => {
    const checkNight = () => {
      const hour = new Date().getHours();
      setIsLateNight(hour >= 22 || hour < 5);
    };
    checkNight();
    const interval = setInterval(checkNight, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WebSocketProvider>
      <Router>
        <GlobalAlertListener />
        <div className={`bg-black text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen relative overflow-hidden ${isLateNight ? 'late-night-mode' : ''}`}>
          <ConnectivityBanner />
          {isLateNight && (
            <div className="fixed bottom-24 left-6 z-[60] animate-bounce">
               <div className="bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                 <span className="material-symbols-outlined text-amber-500 text-sm">nightlight</span>
                 <span className="font-label text-[9px] font-bold text-amber-500 uppercase tracking-widest">Late Night Safety Active</span>
               </div>
            </div>
          )}
          <div className="absolute inset-0 obsidian-grid opacity-[0.03] pointer-events-none"></div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f1f26',
                color: '#f9f5fd',
                border: '1px solid rgba(142, 255, 113, 0.2)',
              },
            }}
          />
          <Routes>
            {/* Entry Point */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<LandingPage />} />

            {/* Auth — public */}
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/demo" element={<DemoTour />} />

            {/* Core — protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><LiveMap /></ProtectedRoute>} />
            <Route path="/stops" element={<ProtectedRoute><Stops /></ProtectedRoute>} />
            <Route path="/eta/:stop_id" element={<ProtectedRoute><ETADetail /></ProtectedRoute>} />

            {/* Safety — protected */}
            <Route path="/safety" element={<ProtectedRoute><SafetyHub /></ProtectedRoute>} />
            <Route path="/safety/sos" element={<ProtectedRoute><SilentSOS /></ProtectedRoute>} />
            <Route path="/safety/escort" element={<ProtectedRoute><VirtualEscort /></ProtectedRoute>} />
            <Route path="/escort/:token" element={<VirtualEscort />} />  {/* Public — viewed by friend */}

            {/* Features — protected */}
            <Route path="/status" element={<ProtectedRoute><LateNightMode /></ProtectedRoute>} />
            <Route path="/anomaly" element={<ProtectedRoute><GhostBusAlert /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><NetworkSimulation /></ProtectedRoute>} />
            <Route path="/route-maker" element={<ProtectedRoute><RouteMaker /></ProtectedRoute>} />

            {/* Docs — protected */}
            <Route path="/docs/architecture" element={<ProtectedRoute><ArchitectureDocs /></ProtectedRoute>} />
            <Route path="/docs/api" element={<ProtectedRoute><ApiPayloadDocs /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
