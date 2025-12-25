import { create } from 'zustand';
import { StarRecord } from '@/data/star-catalog';
export type AppMode = 'intro' | 'skyview' | 'log' | 'settings';
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';
interface Orientation {
  alpha: number; 
  beta: number;  
  gamma: number; 
  heading: number; 
}
interface AppState {
  mode: AppMode;
  isCalibrated: boolean;
  magnitudeLimit: number;
  showConstellations: boolean;
  showGrid: boolean;
  targetObject: string | null;
  selectedStar: StarRecord | null;
  // Phase 2: Sensor States
  orientation: Orientation;
  isSensorActive: boolean;
  permissionStatus: PermissionStatus;
  calibrationOffset: number;
  // Actions
  setMode: (mode: AppMode) => void;
  setCalibrated: (status: boolean) => void;
  setMagnitudeLimit: (limit: number) => void;
  toggleConstellations: () => void;
  toggleGrid: () => void;
  setTarget: (target: string | null) => void;
  setSelectedStar: (star: StarRecord | null) => void;
  // Sensor Actions
  setOrientation: (orientation: Orientation) => void;
  setSensorActive: (active: boolean) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setCalibrationOffset: (offset: number) => void;
}
export const useAppStore = create<AppState>((set) => ({
  mode: 'intro',
  isCalibrated: false,
  magnitudeLimit: 6.5,
  showConstellations: true,
  showGrid: true,
  targetObject: null,
  selectedStar: null,
  orientation: { alpha: 0, beta: 0, gamma: 0, heading: 0 },
  isSensorActive: false,
  permissionStatus: 'prompt',
  calibrationOffset: 0,
  setMode: (mode) => set({ mode }),
  setCalibrated: (status) => set({ isCalibrated: status }),
  setMagnitudeLimit: (limit) => set({ magnitudeLimit: limit }),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setTarget: (target) => set({ targetObject: target }),
  setSelectedStar: (star) => set({ selectedStar: star }),
  setOrientation: (orientation) => set({ orientation }),
  setSensorActive: (active) => set({ isSensorActive: active }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setCalibrationOffset: (offset) => set({ calibrationOffset: offset }),
}));