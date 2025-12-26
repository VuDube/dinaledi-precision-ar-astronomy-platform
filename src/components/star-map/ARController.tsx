import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { radecToVector3 } from '@/lib/astronomy-math';
export function ARController() {
  const { camera } = useThree();
  const orientation = useAppStore(s => s.orientation);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const isSlewing = useAppStore(s => s.isSlewing);
  const isObserving = useAppStore(s => s.isObserving);
  const setSelectedStar = useAppStore(s => s.setSelectedStar);
  const setSelectedDSO = useAppStore(s => s.setSelectedDSO);
  const currentSelectedStar = useAppStore(s => s.selectedStar);
  const currentSelectedDSO = useAppStore(s => s.selectedDSO);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  useFrame(() => {
    if (!isSensorActive) return;
    const alphaRad = THREE.MathUtils.degToRad(orientation.alpha);
    const betaRad = THREE.MathUtils.degToRad(orientation.beta);
    const gammaRad = THREE.MathUtils.degToRad(orientation.gamma);
    euler.current.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    targetQuaternion.current.setFromEuler(euler.current);
    camera.quaternion.slerp(targetQuaternion.current, 0.1);
    if (isObserving || isSlewing) return;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let closestObject = null;
    let objectType: 'star' | 'dso' | null = null;
    let minDistance = Infinity;
    const threshold = 0.05;
    // Check DSOs first (priority)
    for (const dso of DSO_CATALOG) {
      const dsoPos = radecToVector3(dso.ra, dso.dec, 1).normalize();
      const dist = forward.distanceTo(dsoPos);
      if (dist < threshold && dist < minDistance) {
        minDistance = dist;
        closestObject = dso;
        objectType = 'dso';
      }
    }
    // Check Stars if no DSO found
    if (!closestObject) {
      for (const star of STAR_CATALOG) {
        const starPos = radecToVector3(star.ra, star.dec, 1).normalize();
        const dist = forward.distanceTo(starPos);
        if (dist < threshold && dist < minDistance) {
          minDistance = dist;
          closestObject = star;
          objectType = 'star';
        }
      }
    }
    // Stability: Only update store if selection changed
    if (objectType === 'star') {
      if (closestObject && closestObject.id !== currentSelectedStar?.id) {
        setSelectedStar(closestObject as any);
      }
      if (currentSelectedDSO !== null) setSelectedDSO(null);
    } else if (objectType === 'dso') {
      if (closestObject && closestObject.id !== currentSelectedDSO?.id) {
        setSelectedDSO(closestObject as any);
      }
      if (currentSelectedStar !== null) setSelectedStar(null);
    } else {
      if (currentSelectedStar !== null) setSelectedStar(null);
      if (currentSelectedDSO !== null) setSelectedDSO(null);
    }
  });
  return null;
}