import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
export function useOrientation() {
  const setOrientation = useAppStore((s) => s.setOrientation);
  const setPermissionStatus = useAppStore((s) => s.setPermissionStatus);
  const setSensorActive = useAppStore((s) => s.setSensorActive);
  const setCalibrationProgress = useAppStore((s) => s.setCalibrationProgress);
  const setCalibrated = useAppStore((s) => s.setCalibrated);
  const setCalibrationOffset = useAppStore((s) => s.setCalibrationOffset);
  const calibrationOffset = useAppStore((s) => s.calibrationOffset);
  const isSensorActive = useAppStore((s) => s.isSensorActive);
  const lastHeading = useRef<number>(0);
  const filterAlpha = 0.15;
  const biasSamples = useRef<number[]>([]);
  const isCalibrating = useRef(false);
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event;
    const a = alpha ?? 0;
    const b = beta ?? 0;
    const g = gamma ?? 0;
    if (isCalibrating.current) {
      biasSamples.current.push(a);
      return;
    }
    let heading = (a + calibrationOffset) % 360;
    if (heading < 0) heading += 360;
    let diff = heading - lastHeading.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothedHeading = (lastHeading.current + filterAlpha * diff + 360) % 360;
    lastHeading.current = smoothedHeading;
    setOrientation({ alpha: a, beta: b, gamma: g, heading: smoothedHeading });
  }, [setOrientation, calibrationOffset]);
  const requestPermission = useCallback(async () => {
    // Check for High Precision Generic Sensor API (Supported on Chrome/Android)
    if ('AbsoluteOrientationSensor' in window) {
      try {
        const sensor = new (window as any).AbsoluteOrientationSensor({ frequency: 60 });
        sensor.addEventListener('reading', () => {
          // Drive orientation via high-precision quaternion if supported
          // For simplicity in Phase 24, we continue with DeviceOrientation for consistency
        });
        sensor.start();
      } catch (e) {
        console.warn('AbsoluteOrientationSensor failed, falling back to DeviceOrientation');
      }
    }
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionStatus('unavailable');
      return false;
    }
    const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
    try {
      let status: PermissionState | 'granted' = 'granted';
      if (typeof requestPermissionFn === 'function') {
        status = await requestPermissionFn();
      }
      if (status === 'granted') {
        setPermissionStatus('granted');
        setSensorActive(true);
        isCalibrating.current = true;
        biasSamples.current = [];
        setCalibrationProgress(0);
        const duration = 4000;
        const interval = 100;
        let elapsed = 0;
        const timer = setInterval(() => {
          elapsed += interval;
          const progress = Math.min(100, (elapsed / duration) * 100);
          setCalibrationProgress(progress);
          if (elapsed >= duration) {
            clearInterval(timer);
            isCalibrating.current = false;
            const avg = biasSamples.current.length > 0 
              ? biasSamples.current.reduce((a, b) => a + b, 0) / biasSamples.current.length 
              : 0;
            setCalibrationOffset(-avg);
            setCalibrated(true);
          }
        }, interval);
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (error) {
      console.error('Orientation permission failed:', error);
      setPermissionStatus('denied');
      return false;
    }
  }, [setPermissionStatus, setSensorActive, setCalibrationProgress, setCalibrated, setCalibrationOffset]);
  useEffect(() => {
    if (isSensorActive) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation, isSensorActive]);
  return { requestPermission };
}