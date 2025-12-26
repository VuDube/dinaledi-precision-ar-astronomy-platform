import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
export function useOrientation() {
  const setOrientation = useAppStore((s) => s.setOrientation);
  const setPermissionStatus = useAppStore((s) => s.setPermissionStatus);
  const setSensorActive = useAppStore((s) => s.setSensorActive);
  const setCalibrationProgress = useAppStore((s) => s.setCalibrationProgress);
  const setCalibrated = useAppStore((s) => s.setCalibrated);
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
    let heading = (a + calibrationOffset) % 360;
    if (heading < 0) heading += 360;
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
    // Begin 5s Zero-Motion Calibration
    isCalibrating.current = true;
    biasSamples.current = [];
    setCalibrationProgress(0);
    const calibrateInterval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(calibrateInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    // After 5s, calculate bias
    setTimeout(() => {
      isCalibrating.current = false;
      if (biasSamples.current.length > 0) {
        const avg = biasSamples.current.reduce((a, b) => a + b, 0) / biasSamples.current.length;
        // Logic to store bias can go to app-store if needed
        setCalibrated(true);
      }
      setCalibrationProgress(100);
    }, 5000);
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
  }, [setPermissionStatus, setSensorActive, setCalibrationProgress, setCalibrated]);
  const isIOS = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
  useEffect(() => {
    if (!isIOS && isSensorActive) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation, isSensorActive, isIOS]);
  return { requestPermission };
}