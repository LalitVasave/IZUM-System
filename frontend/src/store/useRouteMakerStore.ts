import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RouteStop {
  id: string; // the database ID of the stop
  name: string;
  lat: number;
  lng: number;
  route_id: string;
}

interface RouteMakerState {
  routeName: string;
  currentStops: RouteStop[];
  setRouteName: (name: string) => void;
  addStop: (stop: RouteStop) => void;
  removeStop: (stopId: string) => void;
  reorderStops: (startIndex: number, endIndex: number) => void;
  clearStops: () => void;
}

export const useRouteMakerStore = create<RouteMakerState>()(
  persist(
    (set) => ({
      routeName: '',
      currentStops: [],
      setRouteName: (name) => set({ routeName: name }),
      addStop: (stop) => set((state) => ({ 
        currentStops: [...state.currentStops, stop] 
      })),
      removeStop: (stopId) => set((state) => ({
        currentStops: state.currentStops.filter((s) => s.id !== stopId)
      })),
      reorderStops: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.currentStops);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { currentStops: result };
      }),
      clearStops: () => set({ currentStops: [], routeName: '' }),
    }),
    {
      name: 'izum-route-maker-storage',
    }
  )
);

// Utility to calculate walk time between two coordinates
export function calculateWalkTimeMin(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const dist_m = R * c;
  
  if (dist_m < 50) return 0;
  
  // 5 km/h = 1.39 m/s
  return Math.ceil(dist_m / 1.39 / 60);
}
