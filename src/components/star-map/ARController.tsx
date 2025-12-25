import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { radecToVector3 } from '@/lib/astronomy-math';
export function ARController() {
  const { camera } = useThree();
  const orientation = useAppStore((s) => s.orientation);
  const isSensorActive = useAppStore((s) => s.isSensorActive);
  const setSelectedStar = useAppStore((s) => s.setSelectedStar);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  const raycaster = useRef(new THREE.Raycaster());
  const centerVector = useRef(new THREE.Vector2(0, 0));
  useFrame(() => {
    if (!isSensorActive) return;
    const alphaRad = THREE.MathUtils.degToRad(orientation.alpha);
    const betaRad = THREE.MathUtils.degToRad(orientation.beta);
    const gammaRad = THREE.MathUtils.degToRad(orientation.gamma);
    // Standard mobile orientation mapping
    euler.current.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    targetQuaternion.current.setFromEuler(euler.current);
    camera.quaternion.slerp(targetQuaternion.current, 0.1);
    // Target Acquisition (Check center of view for stars)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let closestStar = null;
    let minDistance = Infinity;
    // Small threshold for identification (approx 3 degrees)
    const threshold = 0.05; 
    STAR_CATALOG.forEach(star => {
      const starPos = radecToVector3(star.ra, star.dec, 1).normalize();
      const dist = forward.distanceTo(starPos);
      if (dist < threshold && dist < minDistance) {
        minDistance = dist;
        closestStar = star;
      }
    });
    // Update store only on change to avoid unnecessary re-renders
    if (closestStar !== useAppStore.getState().selectedStar) {
      setSelectedStar(closestStar);
    }
  });
  return null;
}