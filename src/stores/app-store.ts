import { create } from 'zustand';
export type AppMode = 'intro' | 'skyview' | 'log' | 'settings';
interface AppState {
  mode: AppMode;
  isCalibrated: boolean;
  magnitudeLimit: number;
  showConstellations: boolean;
  targetObject: string | null;
  setMode: (mode: AppMode) => void;
  setCalibrated: (status: boolean) => void;
  setMagnitudeLimit: (limit: number) => void;
  toggleConstellations: () => void;
  setTarget: (target: string | null) => void;
}
export const useAppStore = create<AppState>((set) => ({
  mode: 'intro',
  isCalibrated: false,
  magnitudeLimit: 6.5,
  showConstellations: true,
  targetObject: null,
  setMode: (mode) => set({ mode }),
  setCalibrated: (status) => set({ isCalibrated: status }),
  setMagnitudeLimit: (limit) => set({ magnitudeLimit: limit }),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  setTarget: (target) => set({ targetObject: target }),
}));