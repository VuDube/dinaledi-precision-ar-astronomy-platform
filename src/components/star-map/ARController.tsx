import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { radecToVector3 } from '@/lib/astronomy-math';
export function ARController() {
  const { camera } = useThree();
  const orientation = useAppStore((s) => s.orientation);
  const isSensorActive = useAppStore((s) => s.isSensorActive);
  const setSelectedStar = useAppStore((s) => s.setSelectedStar);
  const setSelectedDSO = useAppStore((s) => s.setSelectedDSO);
  const isObserving = useAppStore((s) => s.isObserving);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  useFrame(() => {
    if (!isSensorActive) return;
    const alphaRad = THREE.MathUtils.degToRad(orientation.alpha);
    const betaRad = THREE.MathUtils.degToRad(orientation.beta);
    const gammaRad = THREE.MathUtils.degToRad(orientation.gamma);
    // Standard mobile orientation mapping
    euler.current.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    targetQuaternion.current.setFromEuler(euler.current);
    camera.quaternion.slerp(targetQuaternion.current, 0.1);
    // Skip acquisition if user is currently filling out a form
    if (isObserving) return;
    // Target Acquisition (Check center of view for objects)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let closestObject = null;
    let objectType: 'star' | 'dso' | null = null;
    let minDistance = Infinity;
    // Small threshold for identification (approx 3 degrees)
    const threshold = 0.05;
    // Check Stars
    STAR_CATALOG.forEach(star => {
      const starPos = radecToVector3(star.ra, star.dec, 1).normalize();
      const dist = forward.distanceTo(starPos);
      if (dist < threshold && dist < minDistance) {
        minDistance = dist;
        closestObject = star;
        objectType = 'star';
      }
    });
    // Check DSOs
    DSO_CATALOG.forEach(dso => {
      const dsoPos = radecToVector3(dso.ra, dso.dec, 1).normalize();
      const dist = forward.distanceTo(dsoPos);
      if (dist < threshold && dist < minDistance) {
        minDistance = dist;
        closestObject = dso;
        objectType = 'dso';
      }
    });
    // Update store only on change to avoid unnecessary re-renders
    if (objectType === 'star') {
      if (closestObject !== useAppStore.getState().selectedStar) {
        setSelectedStar(closestObject as any);
      }
    } else if (objectType === 'dso') {
      if (closestObject !== useAppStore.getState().selectedDSO) {
        setSelectedDSO(closestObject as any);
      }
    } else {
      // Clear selection if nothing is in center
      if (useAppStore.getState().selectedStar !== null) setSelectedStar(null);
      if (useAppStore.getState().selectedDSO !== null) setSelectedDSO(null);
    }
  });
  return null;
}