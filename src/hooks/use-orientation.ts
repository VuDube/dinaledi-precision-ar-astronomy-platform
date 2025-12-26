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
  const filterAlpha = 0.12;
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
    // Apply the calibration offset to the raw alpha heading
    let heading = (a + calibrationOffset) % 360;
    if (heading < 0) heading += 360;
    // Smooth heading using simple low-pass filter
    let diff = heading - lastHeading.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothedHeading = (lastHeading.current + filterAlpha * diff + 360) % 360;
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
    const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
    try {
      let status: PermissionState | 'granted' = 'granted';
      if (typeof requestPermissionFn === 'function') {
        status = await requestPermissionFn();
      }
      if (status === 'granted') {
        setPermissionStatus('granted');
        setSensorActive(true);
        // START Calibration sequence ONLY after permission is granted
        isCalibrating.current = true;
        biasSamples.current = [];
        setCalibrationProgress(0);
        const calibrateDuration = 5000;
        const intervalTime = 100;
        let elapsed = 0;
        const calibrateInterval = setInterval(() => {
          elapsed += intervalTime;
          const progress = Math.min(100, (elapsed / calibrateDuration) * 100);
          setCalibrationProgress(progress);
          if (elapsed >= calibrateDuration) {
            clearInterval(calibrateInterval);
            isCalibrating.current = false;
            if (biasSamples.current.length > 0) {
              const avg = biasSamples.current.reduce((a, b) => a + b, 0) / biasSamples.current.length;
              setCalibrationOffset(-avg);
              setCalibrated(true);
            } else {
              setCalibrationOffset(0);
              setCalibrated(true);
            }
          }
        }, intervalTime);
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (error) {
      console.error('Orientation permission request failed:', error);
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