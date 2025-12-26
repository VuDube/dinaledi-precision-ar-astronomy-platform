import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { addHours } from 'date-fns';
export function GestureController() {
  const simulationTime = useAppStore(s => s.simulationTime);
  const setSimulationTime = useAppStore(s => s.setSimulationTime);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const isRadialOpen = useAppStore(s => s.isRadialOpen);
  // Stability: Use refs to capture current state for event listeners
  const timeRef = useRef(simulationTime);
  const sensorRef = useRef(isSensorActive);
  const radialRef = useRef(isRadialOpen);
  useEffect(() => {
    timeRef.current = simulationTime;
    sensorRef.current = isSensorActive;
    radialRef.current = isRadialOpen;
  }, [simulationTime, isSensorActive, isRadialOpen]);
  useEffect(() => {
    let startX = 0;
    let isDragging = false;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        isDragging = true;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (!isDragging || sensorRef.current || radialRef.current) return;
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      if (Math.abs(deltaX) > 10) {
        const intensity = Math.sign(deltaX) * Math.pow(Math.abs(deltaX) / 20, 1.5);
        // Use functional update or ref to calculate next time
        setSimulationTime(addHours(timeRef.current, intensity));
        startX = currentX;
      }
    };
    const onEnd = () => { isDragging = false; };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [setSimulationTime]);
  return null;
}