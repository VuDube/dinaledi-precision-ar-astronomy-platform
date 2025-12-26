import React, { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
import { addHours, addDays } from 'date-fns';
export function GestureController() {
  const fov = useAppStore(s => s.fov);
  const setFOV = useAppStore(s => s.setFOV);
  const simulationTime = useAppStore(s => s.simulationTime);
  const setSimulationTime = useAppStore(s => s.setSimulationTime);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const isRadialOpen = useAppStore(s => s.isRadialOpen);
  const lastPinchDist = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRadialOpen) return;
    // Pinch-to-zoom simulation (standard DOM PointerEvents doesn't easily expose multiple pointers as a list)
    // For simplicity in Phase 21, we use scroll wheel for zoom and horizontal drags for time
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (isRadialOpen) return;
    const delta = e.deltaY * 0.05;
    setFOV(fov + delta);
  };
  // Horizontal scrub for time travel when NOT in AR mode
  // This is handled via the window listener to capture drags better
  React.useEffect(() => {
    let startX = 0;
    let isDragging = false;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        isDragging = true;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (!isDragging || isSensorActive || isRadialOpen) return;
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      if (Math.abs(deltaX) > 10) {
        // Map deltaX to time jump
        // 1px = 1 hour roughly, exponential for large movements
        const intensity = Math.sign(deltaX) * Math.pow(Math.abs(deltaX) / 20, 1.5);
        setSimulationTime(addHours(simulationTime, intensity));
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
  }, [isSensorActive, isRadialOpen, simulationTime, setSimulationTime]);
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-auto touch-none"
      onWheel={handleWheel}
    />
  );
}