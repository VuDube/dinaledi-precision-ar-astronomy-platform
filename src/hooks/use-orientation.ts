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
  const eventRef = useRef<any>(null);
  const calibrationOffsetRef = useRef<number>(useAppStore.getState().calibrationOffset);
  const isPreview = typeof location !== 'undefined' && location.hostname.includes('.workers.dev');
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
      isCalibrating.current = false;
      biasSamples.current = [];
      setCalibrationProgress(100);
      setCalibrationOffset(0);
      calibrationOffsetRef.current = 0;
      setCalibrated(true);
      toast.info('Preview: Mock sensors enabled');
      return true;
    }
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
            const avg = biasSamples.current.length > 0
              ? biasSamples.current.reduce((a, b) => a + b, 0) / biasSamples.current.length
              : 0;
            const finalOffset = -avg;
            calibrationOffsetRef.current = finalOffset;
            setCalibrationOffset(finalOffset);
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
  }, [setPermissionStatus, setSensorActive, setCalibrationProgress, setCalibrated, setCalibrationOffset, isPreview]);
  useEffect(() => {
    if (mockMode.current) {
      const mockLoop = () => {
        const event = new DeviceOrientationEvent('deviceorientation', {
          alpha: (Date.now() / 100 % 360),
          beta: 0 + (Math.sin(Date.now() / 1000) * 5),
          gamma: 0,
          absolute: true
        });
        handleOrientation(event);
        rafRef.current = requestAnimationFrame(mockLoop);
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      mockLoop();
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [handleOrientation]);
  useEffect(() => {
    if (isSensorActive && !mockMode.current) {
      const eventName = 'ondeviceorientationabsolute' in window
        ? 'deviceorientationabsolute'
        : 'deviceorientation';
      eventRef.current = eventName;
      window.addEventListener(eventName as any, handleOrientation);
      return () => {
        if (eventRef.current) {
          window.removeEventListener(eventRef.current as any, handleOrientation);
        }
      };
    }
  }, [handleOrientation, isSensorActive]);
  return { requestPermission };
}