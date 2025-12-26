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
  const autoBortleRef = useRef(autoBortle);

  // Update ref with current autoBortle value
  useEffect(() => {
    autoBortleRef.current = autoBortle;
  }, [autoBortle]);

  const handlePosition = useCallback((latitude: number, longitude: number) => {
    setLocation(latitude, longitude);
    if (autoBortleRef.current) {
      const predicted = predictBortleFromLocation(latitude, longitude);
      setBortleScale(predicted);
    }
  }, [setLocation, setBortleScale]);

  useEffect(() => {
    if (!gpsEnabled || !('geolocation' in navigator)) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setGPSStatus('idle');
      return;
    }

    const opts = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handlePosition(latitude, longitude);
        setGPSStatus('tracking');

        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            handlePosition(latitude, longitude);
          },
          (error) => {
            if (error.code === 2) {
              setGPSStatus('unavailable');
            } else if (error.code === 1 || error.code === 3) {
              console.warn('GPS watch failed:', error);
              setGPSStatus('denied');
            } else {
              console.warn('GPS watch failed:', error);
              setGPSStatus('error');
            }
          },
          opts
        );
      },
      (error) => {
        if (error.code === 2) {
          setGPSStatus('unavailable');
        } else if (error.code === 1 || error.code === 3) {
          console.warn('GPS init failed:', error);
          setGPSStatus('denied');
        } else {
          console.warn('GPS init failed:', error);
          setGPSStatus('error');
        }
      },
      opts
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [gpsEnabled, handlePosition, setGPSStatus]);

  return null;
}
//