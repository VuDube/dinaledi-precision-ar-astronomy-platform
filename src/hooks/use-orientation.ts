import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
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
    const alpha = (event as any).webkitCompassHeading ?? (event.absolute ? event.alpha : event.alpha);
    const { beta, gamma } = event;
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
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionStatus('unavailable');
      toast.error('Sensors Unavailable', { description: 'Device Orientation API not supported.' });
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
            // Safety Check: Default to 0 if no samples collected to prevent NaN offset
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
        toast.error('Access Denied', { description: 'Enable motion sensors in browser settings.' });
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
      // Prioritize absolute orientation event if available
      const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(eventName as any, handleOrientation);
      return () => window.removeEventListener(eventName as any, handleOrientation);
    }
  }, [handleOrientation, isSensorActive]);
  return { requestPermission };
}