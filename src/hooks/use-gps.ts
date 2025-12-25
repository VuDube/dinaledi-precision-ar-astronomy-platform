import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { predictBortleFromLocation } from '@/lib/astronomy-math';
export function useGPS() {
  const setLocation = useAppStore(s => s.setLocation);
  const setGPSStatus = useAppStore(s => s.setGPSStatus);
  const setBortleScale = useAppStore(s => s.setBortleScale);
  const autoBortle = useAppStore(s => s.autoBortle);
  const gpsEnabled = useAppStore(s => s.gpsEnabled);
  const watchId = useRef<number | null>(null);
  

  useEffect(() => {
    if (!gpsEnabled || !('geolocation' in navigator)) {
      // Clear watch when disabled
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

    // Always clear any existing watch before starting new one
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(latitude, longitude);
        if (autoBortle) {
          const predicted = predictBortleFromLocation(latitude, longitude);
          setBortleScale(predicted);
        }
        setGPSStatus('tracking');

        // Start continuous watch after initial position
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation(latitude, longitude);
            if (autoBortle) {
              const predicted = predictBortleFromLocation(latitude, longitude);
              setBortleScale(predicted);
            }
          },
          (error) => {
            console.warn('GPS watch failed:', error);
            setGPSStatus('error');
          },
          opts
        );
      },
      (error) => {
        console.warn('GPS init failed:', error);
        if (error.code === 1 || error.code === 3) {
          setGPSStatus('denied');
        } else {
          setGPSStatus('error');
        }
      },
      opts
    );

    // Cleanup only on unmount
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
}, [gpsEnabled, autoBortle, setLocation, setGPSStatus, setBortleScale]);
}