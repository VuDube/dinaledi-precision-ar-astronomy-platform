import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { predictBortleFromLocation } from '@/lib/astronomy-math';
export function useGPS() {
  const setLocation = useAppStore(s => s.setLocation);
  const setGPSStatus = useAppStore(s => s.setGPSStatus);
  const setBortleScale = useAppStore(s => s.setBortleScale);
  const autoBortle = useAppStore(s => s.autoBortle);
  const watchId = useRef<number | null>(null);
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGPSStatus('error');
      return;
    }
    setGPSStatus('tracking');
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation(latitude, longitude);
        if (autoBortle) {
          const predicted = predictBortleFromLocation(latitude, longitude);
          setBortleScale(predicted);
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        setGPSStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [setLocation, setGPSStatus, setBortleScale, autoBortle]);
}