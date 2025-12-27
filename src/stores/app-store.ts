import { create } from 'zustand';
import { StarRecord } from '@/data/star-catalog';
import { DSORecord } from '@/data/dso-catalog';
export type AppMode = 'intro' | 'skyview' | 'log' | 'settings' | 'highlights' | 'search' | 'pwa-install';
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';
export type GPSStatus = 'idle' | 'tracking' | 'error' | 'denied' | 'unavailable' | 'mock';
export type LorePreference = 'western' | 'african' | 'both';
interface Orientation {
  alpha: number;
  beta: number;
  gamma: number;
  heading: number;
}
interface TargetTelemetry {
  angle: number;
  onScreen: boolean;
  azimuth: number;
}
interface AppState {
  mode: AppMode;
  isCalibrated: boolean;
  isCoreReady: boolean;
  calibrationProgress: number;
  isCatalogReady: boolean;
  catalogLoadingProgress: number;
  preferredLore: LorePreference;
  isObserving: boolean;
  nightMode: boolean;
  isSlewing: boolean;
  magnitudeLimit: number;
  bortleScale: number;
  autoBortle: boolean;
  showPlanets: boolean;
  showISS: boolean;
  showConstellations: boolean;
  showBoundaries: boolean;
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
  deferredPrompt: any | null;
  isOnline: boolean;
  calibrationOffset: number;
  simulationTime: Date;
  timeSpeed: number;
  latitude: number;
  longitude: number;
  searchQuery: string;
  isSearchOpen: boolean;
  isVoiceTriggered: boolean;
  targetTelemetry: TargetTelemetry | null;
  fov: number;
  isRadialOpen: boolean;
  isGesturingTime: boolean;
  isDetailOpen: boolean;
  lastSyncTime: Date | null;
  setMode: (mode: AppMode) => void;
  setCalibrated: (status: boolean) => void;
  setCoreReady: (status: boolean) => void;
  setCalibrationProgress: (progress: number | ((prev: number) => number)) => void;
  setCatalogReady: (status: boolean) => void;
  setCatalogLoadingProgress: (progress: number) => void;
  setTarget: (target: string | null) => void;
  setSelectedStar: (star: StarRecord | null) => void;
  setSelectedDSO: (dso: DSORecord | null) => void;
  setOrientation: (orientation: Orientation) => void;
  setSensorActive: (active: boolean) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setGPSStatus: (status: GPSStatus) => void;
  setGPSEnabled: (enabled: boolean) => void;
  setSearchOpen: (open: boolean, isVoice?: boolean) => void;
  setDetailOpen: (open: boolean) => void;
  setSimulationTime: (time: Date) => void;
  setTimeSpeed: (timeSpeed: number) => void;
  setLocation: (lat: number, lon: number) => void;
  setBortleScale: (scale: number) => void;
  setAutoBortle: (auto: boolean) => void;
  setCalibrationOffset: (offset: number) => void;
  setIsOnline: (online: boolean) => void;
  setDeferredPrompt: (prompt: any) => void;
  setInstallable: (status: boolean) => void;
  setTargetTelemetry: (telemetry: TargetTelemetry | null) => void;
  setRadialOpen: (open: boolean) => void;
  setLastSyncTime: (time: Date | null) => void;
  setSlewing: (slewing: boolean) => void;
  setObserving: (observing: boolean) => void;
  toggleNightMode: () => void;
  togglePlanets: () => void;
  toggleISS: () => void;
  toggleConstellations: () => void;
  toggleBoundaries: () => void;
  toggleConstellationLabels: () => void;
  toggleGrid: () => void;
  setFOV: (fov: number) => void;
}
export const useAppStore = create<AppState>((set) => ({
  mode: 'intro',
  isCalibrated: typeof window !== 'undefined' ? localStorage.getItem('dinaledi-calib') === 'true' : false,
  isCoreReady: false,
  calibrationProgress: 0,
  isCatalogReady: false,
  catalogLoadingProgress: 0,
  preferredLore: 'both',
  isObserving: false,
  nightMode: true,
  isSlewing: false,
  magnitudeLimit: 6.5,
  bortleScale: 4,
  autoBortle: true,
  showPlanets: true,
  showISS: true,
  showConstellations: true,
  showBoundaries: false,
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
  deferredPrompt: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  calibrationOffset: 0,
  simulationTime: new Date(),
  timeSpeed: 1,
  latitude: -26.2,
  longitude: 28.0,
  searchQuery: '',
  isSearchOpen: false,
  isVoiceTriggered: false,
  targetTelemetry: null,
  fov: 55,
  isRadialOpen: false,
  isGesturingTime: false,
  isDetailOpen: false,
  lastSyncTime: null,
  setMode: (mode) => set({ mode }),
  setCalibrated: (status) => {
    set({ isCalibrated: status, calibrationProgress: status ? 100 : 0 });
    if (status === true && typeof window !== 'undefined') {
      localStorage.setItem('dinaledi-calib', 'true');
    }
  },
  setCoreReady: (status) => set({ isCoreReady: status }),
  setCalibrationProgress: (progress) => set((state) => ({ calibrationProgress: typeof progress === 'function' ? progress(state.calibrationProgress) : progress })),
  setCatalogReady: (status) => set({ isCatalogReady: status }),
  setCatalogLoadingProgress: (progress) => set({ catalogLoadingProgress: progress }),
  setTarget: (target) => set({ targetObject: target }),
  setSelectedStar: (star) => set((state) => ({
    selectedStar: star,
    selectedDSO: null,
    isSlewing: star !== null && !state.isSensorActive && state.isCoreReady,
    isDetailOpen: star !== null && !state.isSensorActive && state.isCoreReady
  })),
  setSelectedDSO: (dso) => set((state) => ({
    selectedDSO: dso,
    selectedStar: null,
    isSlewing: dso !== null && !state.isSensorActive && state.isCoreReady,
    isDetailOpen: dso !== null && !state.isSensorActive && state.isCoreReady
  })),
  setOrientation: (orientation) => set({ orientation }),
  setSensorActive: (active) => set({ isSensorActive: active }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setGPSStatus: (gpsStatus) => set({ gpsStatus }),
  setGPSEnabled: (gpsEnabled) => set({ gpsEnabled }),
  setSearchOpen: (isSearchOpen, isVoice = false) => set({ isSearchOpen, isVoiceTriggered: isVoice }),
  setDetailOpen: (isDetailOpen) => set({ isDetailOpen }),
  setSimulationTime: (simulationTime) => set({ simulationTime }),
  setTimeSpeed: (timeSpeed) => set({ timeSpeed }),
  setLocation: (latitude, longitude) => set({ latitude, longitude }),
  setBortleScale: (scale) => {
    const mag = Math.max(3.5, 7.5 - (scale * 0.4));
    set({ bortleScale: scale, magnitudeLimit: mag });
  },
  setAutoBortle: (autoBortle) => set({ autoBortle }),
  setCalibrationOffset: (offset) => set({ calibrationOffset: offset }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt, isInstallable: !!deferredPrompt }),
  setInstallable: (isInstallable) => set({ isInstallable }),
  setTargetTelemetry: (telemetry) => set({ targetTelemetry: telemetry }),
  setRadialOpen: (isRadialOpen) => set({ isRadialOpen }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setSlewing: (isSlewing) => set({ isSlewing }),
  setObserving: (isObserving) => set({ isObserving }),
  toggleNightMode: () => set((state) => ({ nightMode: !state.nightMode })),
  togglePlanets: () => set((state) => ({ showPlanets: !state.showPlanets })),
  toggleISS: () => set((state) => ({ showISS: !state.showISS })),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  toggleBoundaries: () => set((state) => ({ showBoundaries: !state.showBoundaries })),
  toggleConstellationLabels: () => set((state) => ({ showConstellationLabels: !state.showConstellationLabels })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setFOV: (fov) => set({ fov: Math.max(10, Math.min(90, fov)) }),
}));