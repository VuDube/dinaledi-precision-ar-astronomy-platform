import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
import { radecToVector3 } from '@/lib/astronomy-math';
export function SlewController() {
  const { camera } = useThree();
  const isSlewing = useAppStore(s => s.isSlewing);
  const setSlewing = useAppStore(s => s.setSlewing);
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const targetQuat = useRef(new THREE.Quaternion());
  const lookAtMatrix = useRef(new THREE.Matrix4());
  useEffect(() => {
    const target = selectedStar || selectedDSO;
    if (target && !isSensorActive) {
      const pos = radecToVector3(target.ra, target.dec, 10).normalize().multiplyScalar(-1);
      targetPosition.current = pos;
      lookAtMatrix.current.lookAt(camera.position, pos, camera.up);
      targetQuat.current.setFromRotationMatrix(lookAtMatrix.current);
    } else {
      targetPosition.current = null;
    }
  }, [selectedStar, selectedDSO, isSensorActive, camera]);
  useFrame(() => {
    if (!isSlewing || isSensorActive || !targetPosition.current) return;
    // Slew towards target orientation
    camera.quaternion.slerp(targetQuat.current, 0.05);
    // Stop slewing when close enough
    if (camera.quaternion.angleTo(targetQuat.current) < 0.005) {
      setSlewing(false);
    }
  });
  return null;
}