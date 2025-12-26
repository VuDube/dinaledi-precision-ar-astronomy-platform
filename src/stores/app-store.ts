import { create } from 'zustand';
import { StarRecord } from '@/data/star-catalog';
import { DSORecord } from '@/data/dso-catalog';
export type AppMode = 'intro' | 'skyview' | 'log' | 'settings' | 'highlights' | 'search';
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';
export type GPSStatus = 'idle' | 'tracking' | 'error' | 'denied' | 'unavailable';
interface Orientation {
  alpha: number;
  beta: number;
  gamma: number;
  heading: number;
}
interface AppState {
  mode: AppMode;
  isCalibrated: boolean;
  isObserving: boolean;
  magnitudeLimit: number;
  bortleScale: number;
  autoBortle: boolean;
  showConstellations: boolean;
  showConstellationLabels: boolean;
  showGrid: boolean;
  targetObject: string | null;
  selectedStar: StarRecord | null;
  selectedDSO: DSORecord | null;
  orientation: Orientation;
  isSensorActive: boolean;
  permissionStatus: PermissionStatus;
  gpsStatus: GPSStatus;
  gpsEnabled: boolean;
  isInstallable: boolean;
  calibrationOffset: number;
  simulationTime: Date;
  timeSpeed: number;
  latitude: number;
  longitude: number;
  searchQuery: string;
  isSearchOpen: boolean;
  setMode: (mode: AppMode) => void;
  setCalibrated: (status: boolean) => void;
  setObserving: (observing: boolean) => void;
  setBortleScale: (scale: number) => void;
  setAutoBortle: (auto: boolean) => void;
  toggleConstellations: () => void;
  toggleConstellationLabels: () => void;
  toggleGrid: () => void;
  setTarget: (target: string | null) => void;
  setSelectedStar: (star: StarRecord | null) => void;
  setSelectedDSO: (dso: DSORecord | null) => void;
  setOrientation: (orientation: Orientation) => void;
  setSensorActive: (active: boolean) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setGPSStatus: (status: GPSStatus) => void;
  setGPSEnabled: (enabled: boolean) => void;
  setInstallable: (status: boolean) => void;
  setCalibrationOffset: (offset: number) => void;
  setSimulationTime: (time: Date) => void;
  setTimeSpeed: (speed: number) => void;
  setLocation: (lat: number, lon: number) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
}
export const useAppStore = create<AppState>((set) => ({
  mode: 'intro',
  isCalibrated: false,
  isObserving: false,
  magnitudeLimit: 6.5,
  bortleScale: 4,
  autoBortle: true,
  showConstellations: true,
  showConstellationLabels: true,
  showGrid: true,
  targetObject: null,
  selectedStar: null,
  selectedDSO: null,
  orientation: { alpha: 0, beta: 0, gamma: 0, heading: 0 },
  isSensorActive: false,
  permissionStatus: 'prompt',
  gpsStatus: 'idle',
  gpsEnabled: true,
  isInstallable: false,
  calibrationOffset: 0,
  simulationTime: new Date(),
  timeSpeed: 1,
  latitude: -26.2,
  longitude: 28.0,
  searchQuery: '',
  isSearchOpen: false,
  setMode: (mode) => set({ mode }),
  setCalibrated: (status) => set({ isCalibrated: status }),
  setObserving: (isObserving) => set({ isObserving }),
  setBortleScale: (scale) => {
    const mag = Math.max(3.5, 7.5 - (scale * 0.4));
    set({ bortleScale: scale, magnitudeLimit: mag });
  },
  setAutoBortle: (autoBortle) => set({ autoBortle }),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  toggleConstellationLabels: () => set((state) => ({ showConstellationLabels: !state.showConstellationLabels })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setTarget: (target) => set({ targetObject: target }),
  setSelectedStar: (star) => set({ selectedStar: star, selectedDSO: null }),
  setSelectedDSO: (dso) => set({ selectedDSO: dso, selectedStar: null }),
  setOrientation: (orientation) => set({ orientation }),
  setSensorActive: (active) => set({ isSensorActive: active }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setGPSStatus: (gpsStatus) => set({ gpsStatus }),
  setGPSEnabled: (gpsEnabled) => set({ gpsEnabled }),
  setInstallable: (isInstallable) => set({ isInstallable }),
  setCalibrationOffset: (offset) => set({ calibrationOffset: offset }),
  setSimulationTime: (simulationTime) => set({ simulationTime }),
  setTimeSpeed: (timeSpeed) => set({ timeSpeed }),
  setLocation: (latitude, longitude) => set({ latitude, longitude }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
}));