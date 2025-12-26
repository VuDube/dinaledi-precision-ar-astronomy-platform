import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { radecToVector3 } from '@/lib/astronomy-math';
import { useThree } from '@react-three/fiber';
import { ChevronUp } from 'lucide-react';
import * as THREE from 'three';
export function TargetNavigator() {
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const { camera } = useThree();
  const target = selectedStar || selectedDSO;
  const telemetry = useMemo(() => {
    if (!target) return null;
    const targetPos = radecToVector3(target.ra, target.dec, 100).normalize();
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const angle = cameraForward.angleTo(targetPos) * (180 / Math.PI);
    // Check if on screen
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const onScreen = frustum.containsPoint(targetPos.clone().multiplyScalar(100));
    // Calculate relative screen position for arrow
    const screenPos = targetPos.clone().multiplyScalar(100).project(camera);
    const azimuth = Math.atan2(screenPos.x, screenPos.y) * (180 / Math.PI);
    return { angle, onScreen, azimuth };
  }, [target, camera]);
  if (!telemetry || telemetry.onScreen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div className="relative w-64 h-64 border border-starlight/5 rounded-full flex items-center justify-center">
          <motion.div
            style={{ rotate: -telemetry.azimuth }}
            className="absolute"
          >
            <motion.div
              animate={{ y: [-110, -130, -110] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center gap-1"
            >
              <ChevronUp className="w-8 h-8 text-nebula drop-shadow-glow" />
              <div className="bg-space-black/80 backdrop-blur-md border border-nebula/20 px-2 py-0.5 rounded-full text-[10px] font-mono text-nebula font-bold">
                {Math.round(telemetry.angle)}°
              </div>
            </motion.div>
          </motion.div>
          <div className="text-center space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-starlight/40">Target Off-Axis</div>
            <div className="text-xs font-mono text-starlight/60">{target.name}</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}