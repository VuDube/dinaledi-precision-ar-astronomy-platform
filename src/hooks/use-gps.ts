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
  const handlePositionUpdate = useCallback((latitude: number, longitude: number) => {
    setLocation(latitude, longitude);
    if (autoBortleRef.current) {
      const predicted = predictBortleFromLocation(latitude, longitude);
      setBortleScale(predicted);
    }
  }, [setLocation, setBortleScale]);
  useEffect(() => {
    // Cleanup existing watch if disabled
    if (!gpsEnabled || !('geolocation' in navigator)) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setGPSStatus('idle');
      return;
    }
    const opts: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };
    const onPos = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      handlePositionUpdate(latitude, longitude);
      setGPSStatus('tracking');
    };
    const onErr = (error: GeolocationPositionError) => {
      if (error.code === 2) {
        setGPSStatus('unavailable');
      } else if (error.code === 1) {
        setGPSStatus('denied');
      } else {
        setGPSStatus('error');
      }
    };
    // Immediate update
    navigator.geolocation.getCurrentPosition(onPos, onErr, opts);
    // Continuous tracking
    watchId.current = navigator.geolocation.watchPosition(onPos, onErr, opts);
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [gpsEnabled, handlePositionUpdate, setGPSStatus]);
  return null;
}