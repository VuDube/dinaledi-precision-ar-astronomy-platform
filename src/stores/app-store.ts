import { create } from 'zustand';
export type AppMode = 'intro' | 'skyview' | 'log' | 'settings';
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';
interface Orientation {
  alpha: number; // Z-axis rotation [0, 360]
  beta: number;  // X-axis rotation [-180, 180]
  gamma: number; // Y-axis rotation [-90, 90]
  heading: number; // Compass heading
}
interface AppState {
  mode: AppMode;
  isCalibrated: boolean;
  magnitudeLimit: number;
  showConstellations: boolean;
  targetObject: string | null;
  // Phase 2: Sensor States
  orientation: Orientation;
  isSensorActive: boolean;
  permissionStatus: PermissionStatus;
  calibrationOffset: number;
  setMode: (mode: AppMode) => void;
  setCalibrated: (status: boolean) => void;
  setMagnitudeLimit: (limit: number) => void;
  toggleConstellations: () => void;
  setTarget: (target: string | null) => void;
  // Phase 2: Sensor Actions
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
  targetObject: null,
  // Initial Sensor States
  orientation: { alpha: 0, beta: 0, gamma: 0, heading: 0 },
  isSensorActive: false,
  permissionStatus: 'prompt',
  calibrationOffset: 0,
  setMode: (mode) => set({ mode }),
  setCalibrated: (status) => set({ isCalibrated: status }),
  setMagnitudeLimit: (limit) => set({ magnitudeLimit: limit }),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  setTarget: (target) => set({ targetObject: target }),
  // Sensor Actions
  setOrientation: (orientation) => set({ orientation }),
  setSensorActive: (active: boolean) => set({ isSensorActive: active }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setCalibrationOffset: (offset) => set({ calibrationOffset: offset }),
}));