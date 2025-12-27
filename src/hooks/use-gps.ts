import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { predictBortleFromLocation } from '@/lib/astronomy-math';
export function useGPS() {
  const setLocation = useAppStore(s => s.setLocation);
  const setGPSStatus = useAppStore(s => s.setGPSStatus);
  const setBortleScale = useAppStore(s => s.setBortleScale);
  const autoBortle = useAppStore(s => s.autoBortle);
  const gpsEnabled = useAppStore(s => s.gpsEnabled);
  const watchId = useRef<number | null>(null);
  const autoBortleRef = useRef<boolean>(autoBortle);
  // Keep a stable ref of autoBortle to use in memoized handlers
  useEffect(() => {
    autoBortleRef.current = autoBortle;
  }, [autoBortle]);
  const setLocationRef = useRef(setLocation);
  const setBortleScaleRef = useRef(setBortleScale);
  const setGPSStatusRef = useRef(setGPSStatus);

  useEffect(() => {
    setLocationRef.current = setLocation;
    setBortleScaleRef.current = setBortleScale;
    setGPSStatusRef.current = setGPSStatus;
  }, [setLocation, setBortleScale, setGPSStatus]);

  const handlePositionUpdate = useCallback((latitude: number, longitude: number) => {
    setLocationRef.current(latitude, longitude);
    if (autoBortleRef.current) {
      const predicted = predictBortleFromLocation(latitude, longitude);
      setBortleScaleRef.current(predicted);
    }
  }, []);
  useEffect(() => {
    // Cleanup existing watch if disabled
    if (!gpsEnabled || !('geolocation' in navigator)) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setGPSStatusRef.current('idle');
      return;
    }

    const MOCK_LAT = -26.2;
    const MOCK_LON = 28.0;

    const opts: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const onPos = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      handlePositionUpdate(latitude, longitude);
      setGPSStatusRef.current('tracking');
    };

    const onErr = (error: GeolocationPositionError) => {
      if (error.code === 1 || error.code === 2) {
        setGPSStatusRef.current('mock');
        handlePositionUpdate(MOCK_LAT, MOCK_LON);
        // Don't return - let watchPosition continue for potential permission change
      } else {
        setGPSStatusRef.current('error');
      }
    };

    // Check if we need mock immediately
    if (!navigator.geolocation) {
      handlePositionUpdate(MOCK_LAT, MOCK_LON);
      setGPSStatusRef.current('mock');
      return;
    }

    // Try real GPS first
    navigator.geolocation.getCurrentPosition(onPos, onErr, opts);
    watchId.current = navigator.geolocation.watchPosition(onPos, onErr, opts);
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [gpsEnabled, handlePositionUpdate]); // eslint-disable-next-line react-hooks/exhaustive-deps
  return null;
}