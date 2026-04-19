import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import useVehicleStore from '../store/useVehicleStore';
import type { NetworkTier } from '../store/useVehicleStore';
import { useSettingsStore } from '../store/useSettingsStore';

interface TelemetryData {
  lat: number;
  lng: number;
  speed: number;
  accuracy: number;
  ping: number;
  ts: number;
}

interface AnomalyData {
  type: string;
  message: string;
}

interface WebSocketContextProps {
  telemetry: TelemetryData | null;
  anomaly: AnomalyData | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  telemetry: null,
  anomaly: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

const normalizeTier = (tier: string): NetworkTier => {
  const t = (tier || '').toUpperCase();
  if (t === 'FULL' || t === 'ACTIVE') return 'ACTIVE';
  if (t === 'REDUCED') return 'REDUCED';
  if (t === 'MINIMAL') return 'MINIMAL';
  if (t === 'SPARSE') return 'SPARSE';
  if (t === 'DEAD') return 'DEAD';
  return 'ACTIVE';
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);

  // Hardcoded bus_id from our Prisma seed for demo purposes
  const DEMO_BUS_ID = '00000000-0000-0000-0000-000000000002';

  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdateRef = useRef(0);
  const { lowDataMode } = useSettingsStore();
  // Ref so the onmessage closure always sees the latest value without reconnecting
  const lowDataModeRef = useRef(lowDataMode);
  useEffect(() => { lowDataModeRef.current = lowDataMode; }, [lowDataMode]);

  useEffect(() => {
    if (!token) {
      if (wsRef.current) wsRef.current.close();
      return;
    }

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/bus/${DEMO_BUS_ID}?token=${token}`;
      
      console.log(`Connecting to WebSocket (Attempt ${reconnectCountRef.current + 1})...`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectCountRef.current = 0; // Reset count on success
      };

      ws.onmessage = (event) => {
        try {
          // If in Low Data Mode, throttle to 1 update per second
          if (lowDataModeRef.current) {
            const now = Date.now();
            if (now - lastUpdateRef.current < 1000) return;
            lastUpdateRef.current = now;
          }

          const data = JSON.parse(event.data);
          if (data.type === 'TELEMETRY' || data.lat) {
            const payload = data.payload || data;
            setTelemetry(payload);
            const normalizedTs = payload.ts && payload.ts < 1_000_000_000_000 ? payload.ts * 1000 : payload.ts;
            useVehicleStore.getState().updateVehicle({
              lat: payload.lat,
              lng: payload.lng,
              heading: payload.heading || 0,
              speed: payload.speed || 0,
              tier: normalizeTier(payload.tier),
              state: payload.buffered ? 'SYNCING' : payload.state || 'ACTIVE',
              confidence_radius_m: payload.confidence_radius_m || 5,
              ts: normalizedTs || Date.now(),
              route_name: payload.route_name,
              from_stop: payload.from_stop,
              next_stop: payload.next_stop,
              next_sequence: payload.next_sequence,
              segment_progress_pct: payload.segment_progress_pct,
            });
          } else if (data.type === 'ANOMALY') {
            setAnomaly(data.payload);
          }
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Exponential backoff: min 1s, max 30s
        const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000);
        console.log(`Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectCountRef.current += 1;
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnection loop on cleanup
        wsRef.current.close();
      }
    };
  }, [token]);

  useEffect(() => {
    const checkGhostBus = () => {
      const { ts } = useVehicleStore.getState();
      if (ts > 0 && isConnected) {
        const diff = (Date.now() - ts) / 1000;
        if (diff > 120) {
          setAnomaly({
            type: 'GHOST_BUS',
            message: `Telemetry Timeout: Tracking for this vehicle has been silent for ${Math.floor(diff/60)}m. Use caution.`
          });
        } else {
          // Clear ghost bus anomaly if data resumes
          setAnomaly(prev => prev?.type === 'GHOST_BUS' ? null : prev);
        }
      }
    };

    const interval = setInterval(checkGhostBus, 30000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <WebSocketContext.Provider value={{ telemetry, anomaly, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
