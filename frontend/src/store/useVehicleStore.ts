import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NetworkTier = 'ACTIVE' | 'REDUCED' | 'MINIMAL' | 'SPARSE' | 'DEAD';

interface VehicleState {
  bus_id: string | null;
  state: 'ACTIVE' | 'SPARSE' | 'LOST' | 'BUFFERING' | 'SYNCING';
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  tier: NetworkTier;
  confidence_radius_m: number;
  ts: number;
  route_name?: string;
  from_stop?: string;
  next_stop?: string;
  next_sequence?: number;
  segment_progress_pct?: number;
  updateVehicle: (data: Partial<VehicleState>) => void;
  setTier: (tier: NetworkTier) => void;
}

const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      bus_id: null,
      state: 'ACTIVE',
      lat: 34.0522,
      lng: -118.2437,
      heading: 0,
      speed: 0,
      tier: 'ACTIVE',
      confidence_radius_m: 5,
      ts: 0,
      route_name: 'Campus Loop A',
      from_stop: 'Library (North Entrance)',
      next_stop: 'Student Union Building',
      next_sequence: 2,
      segment_progress_pct: 0,
      updateVehicle: (data) => set((state) => ({ ...state, ...data })),
      setTier: (tier) => set({ tier }),
    }),
    {
      name: 'izum-vehicle-state',
    }
  )
);

export default useVehicleStore;
