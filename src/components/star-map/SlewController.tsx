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
  const targetQuat = useRef(new THREE.Quaternion());
  const lookAtMatrix = useRef(new THREE.Matrix4());
  const hasTarget = useRef(false);
  useEffect(() => {
    const target = selectedStar || selectedDSO;
    if (target && !isSensorActive) {
      // Corrected: Mapping RA/Dec to Vector3 usually places the camera at origin
      // The camera should rotate to look at the point on the celestial sphere
      const pos = radecToVector3(target.ra, target.dec, 10); 
      // We look from origin (0,0,0) towards the star position
      lookAtMatrix.current.lookAt(new THREE.Vector3(0, 0, 0), pos, new THREE.Vector3(0, 1, 0));
      targetQuat.current.setFromRotationMatrix(lookAtMatrix.current);
      hasTarget.current = true;
    } else {
      hasTarget.current = false;
    }
  }, [selectedStar, selectedDSO, isSensorActive]);
  useFrame(() => {
    if (!isSlewing || isSensorActive || !hasTarget.current) return;
    // Slew towards target orientation
    camera.quaternion.slerp(targetQuat.current, 0.05);
    // Stop slewing when close enough
    if (camera.quaternion.angleTo(targetQuat.current) < 0.005) {
      setSlewing(false);
    }
  });
  return null;
}