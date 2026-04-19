import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  lowDataMode: boolean;
  setLowDataMode: (enabled: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (enabled: boolean) => void;
  etaAlertThresholdMin: number;
  setEtaAlertThresholdMin: (min: number) => void;
  walkTimeMin: number;
  setWalkTimeMin: (min: number) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      lowDataMode: false,
      setLowDataMode: (enabled) => set({ lowDataMode: enabled }),
      hapticFeedback: true,
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
      etaAlertThresholdMin: 5,
      setEtaAlertThresholdMin: (min) => set({ etaAlertThresholdMin: min }),
      walkTimeMin: 3,
      setWalkTimeMin: (min) => set({ walkTimeMin: min }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'izum-settings',
    }
  )
);
