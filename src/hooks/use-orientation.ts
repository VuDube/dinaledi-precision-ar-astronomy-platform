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
  const isSensorActive = useAppStore((s) => s.isSensorActive);
  const lastHeading = useRef<number>(0);
  const filterAlpha = 0.15;
  const biasSamples = useRef<number[]>([]);
  const isCalibrating = useRef(false);
  const mockMode = useRef(false);
  const rafRef = useRef<number>(0);
  const activeEventName = useRef<string | null>(null);
  const calibrationTimerRef = useRef<any>(null);
  const calibrationOffsetRef = useRef<number>(useAppStore.getState().calibrationOffset);
  const isPreview = typeof location !== 'undefined' && (
    location.hostname.includes('.workers.dev') ||
    location.hostname.includes('build-preview')
  );
  const handleOrientation = useCallback((event: DeviceOrientationEvent & {webkitCompassHeading?: number}) => {
    const alpha = event.webkitCompassHeading ?? (event.absolute ? event.alpha : event.alpha) ?? 0;
    const { beta, gamma } = event;
    const a = alpha;
    const b = beta ?? 0;
    const g = gamma ?? 0;
    if (isCalibrating.current) {
      biasSamples.current.push(a);
      return;
    }
    let heading = (a + calibrationOffsetRef.current) % 360;
    if (heading < 0) heading += 360;
    let diff = heading - lastHeading.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothedHeading = (lastHeading.current + filterAlpha * diff + 360) % 360;
    lastHeading.current = smoothedHeading;
    setOrientation({ alpha: a, beta: b, gamma: g, heading: smoothedHeading });
  }, [setOrientation]);
  const requestPermission = useCallback(async () => {
    if (isPreview) {
      mockMode.current = true;
      setPermissionStatus('granted');
      setSensorActive(true);
      setCalibrationProgress(100);
      setCalibrated(true);
      return true;
    }
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionStatus('unavailable');
      toast.error('Sensors Unsupported');
      return false;
    }
    const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
    try {
      let status: PermissionState | 'granted' = 'granted';
      if (typeof requestPermissionFn === 'function') {
        status = await requestPermissionFn();
      }
      if (status === 'granted') {
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        setPermissionStatus('granted');
        setSensorActive(true);
        isCalibrating.current = true;
        biasSamples.current = [];
        setCalibrationProgress(0);
        if (calibrationTimerRef.current) clearInterval(calibrationTimerRef.current);
        const duration = 4000;
        const interval = 100;
        let elapsed = 0;
        calibrationTimerRef.current = setInterval(() => {
          elapsed += interval;
          const progress = Math.min(100, (elapsed / duration) * 100);
          setCalibrationProgress(progress);
          if (elapsed >= duration) {
            if (calibrationTimerRef.current) clearInterval(calibrationTimerRef.current);
            isCalibrating.current = false;
            const count = biasSamples.current.length;
            const avg = count >= 20
              ? biasSamples.current.reduce((a, b) => a + b, 0) / count
              : 0;
            const finalOffset = -avg;
            calibrationOffsetRef.current = finalOffset;
            setCalibrationOffset(finalOffset);
            setCalibrated(true);
            if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
          }
        }, interval);
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (error) {
      setPermissionStatus('denied');
      return false;
    }
  }, [setPermissionStatus, setSensorActive, setCalibrationProgress, setCalibrated, setCalibrationOffset, isPreview]);
  useEffect(() => {
    if (mockMode.current) {
      const mockLoop = () => {
        const now = Date.now();
        const event = new DeviceOrientationEvent('deviceorientation', {
          alpha: (now / 100 % 360),
          beta: -25 + (Math.sin(now / 1000) * 15),
          gamma: (Math.cos(now / 800) * 5),
          absolute: true
        });
        handleOrientation(event);
        rafRef.current = requestAnimationFrame(mockLoop);
      };
      mockLoop();
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [handleOrientation]);
  useEffect(() => {
    if (isSensorActive && !mockMode.current) {
      const eventName = 'ondeviceorientationabsolute' in window
        ? 'deviceorientationabsolute'
        : 'deviceorientation';
      activeEventName.current = eventName;
      window.addEventListener(eventName as any, handleOrientation);
      return () => {
        if (activeEventName.current) {
          window.removeEventListener(activeEventName.current as any, handleOrientation);
          activeEventName.current = null;
        }
        if (calibrationTimerRef.current) clearInterval(calibrationTimerRef.current);
      };
    }
  }, [handleOrientation, isSensorActive]);
  return { requestPermission };
}