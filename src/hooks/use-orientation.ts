import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
export function useOrientation() {
  const setOrientation = useAppStore((s) => s.setOrientation);
  const setPermissionStatus = useAppStore((s) => s.setPermissionStatus);
  const setSensorActive = useAppStore((s) => s.setSensorActive);
  const calibrationOffset = useAppStore((s) => s.calibrationOffset);
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event;
    // Normalize values
    const a = alpha || 0;
    const b = beta || 0;
    const g = gamma || 0;
    // Simple heading calculation
    const heading = (a + calibrationOffset) % 360;
    setOrientation({
      alpha: a,
      beta: b,
      gamma: g,
      heading: heading < 0 ? heading + 360 : heading
    });
  }, [setOrientation, calibrationOffset]);
  const requestPermission = useCallback(async () => {
    // Check if DeviceOrientationEvent exists
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionStatus('unavailable');
      return false;
    }
    // iOS 13+ requires explicit permission
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
        // Non-iOS or older versions
        setPermissionStatus('granted');
        setSensorActive(true);
        return true;
      }
    } catch (error) {
      console.error('Error requesting orientation permission:', error);
      setPermissionStatus('denied');
      return false;
    }
  }, [setPermissionStatus, setSensorActive]);
  useEffect(() => {
    const isIOS = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    const eventName = 'deviceorientation'; // Use standard event for simplicity in Phase 2
    // Only auto-start if not on iOS (which requires user gesture)
    if (!isIOS) {
      window.addEventListener(eventName, handleOrientation);
    }
    return () => {
      window.removeEventListener(eventName, handleOrientation);
    };
  }, [handleOrientation]);
  useEffect(() => {
    // Re-attach listener if sensor becomes active
    const isActive = useAppStore.getState().isSensorActive;
    if (isActive) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation]);
  return { requestPermission };
}