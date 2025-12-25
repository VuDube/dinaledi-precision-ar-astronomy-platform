import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
export function useOrientation() {
  const setOrientation = useAppStore((s) => s.setOrientation);
  const setPermissionStatus = useAppStore((s) => s.setPermissionStatus);
  const setSensorActive = useAppStore((s) => s.setSensorActive);
  const calibrationOffset = useAppStore((s) => s.calibrationOffset);
  const isSensorActive = useAppStore((s) => s.isSensorActive);
  const lastHeading = useRef<number>(0);
  const filterAlpha = 0.15; // EWMA Smoothing factor
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event;
    const a = alpha || 0;
    const b = beta || 0;
    const g = gamma || 0;
    // Smooth heading with EWMA to reduce jitter
    let heading = (a + calibrationOffset) % 360;
    if (heading < 0) heading += 360;
    const smoothedHeading = lastHeading.current + filterAlpha * (heading - lastHeading.current);
    lastHeading.current = smoothedHeading;
    setOrientation({
      alpha: a,
      beta: b,
      gamma: g,
      heading: smoothedHeading
    });
  }, [setOrientation, calibrationOffset]);
  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionStatus('unavailable');
      return false;
    }
    // High Precision API Check (Chrome/Android)
    if ('AbsoluteOrientationSensor' in window) {
      try {
        const sensor = new (window as any).AbsoluteOrientationSensor({ frequency: 60 });
        sensor.addEventListener('reading', () => {
          // Manual Quat to Euler conversion would go here if needed
          // For now, we fallback to DeviceOrientation for compatibility but log potential
          console.debug('High precision sensor available');
        });
        sensor.start();
        sensor.stop(); // Test availability only, don't run permanently
      } catch (e) {
        console.debug('AbsoluteOrientationSensor unavailable (expected on desktop), falling back', e);
      }
    }
    const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
    try {
      if (typeof requestPermissionFn === 'function') {
        const response = await requestPermissionFn();
        if (response === 'granted') {
          setPermissionStatus('granted');
          setSensorActive(true);
          return true;
        } else {
          setPermissionStatus('denied');
          setSensorActive(false);
          return false;
        }
      } else {
        setPermissionStatus('granted');
        setSensorActive(true);
        return true;
      }
    } catch (error) {
      setPermissionStatus('denied');
      return false;
    }
  }, [setPermissionStatus, setSensorActive]);
  const isIOS = typeof (DeviceOrientationEvent as any).requestPermission === 'function';

  useEffect(() => {
    if (!isIOS && isSensorActive) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation, isSensorActive]);
  // Removed duplicate listener effect - first effect handles non-iOS case correctly
  return { requestPermission };
}