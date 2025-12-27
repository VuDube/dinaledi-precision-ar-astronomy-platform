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
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  const lastUpdate = useRef(0);
  const hysteresisTimer = useRef<number>(0);
  const lastTargetId = useRef<string | null>(null);
  useFrame((state) => {
    if (!isSensorActive) return;
    // Smooth camera rotation
    const alphaRad = THREE.MathUtils.degToRad(orientation.alpha);
    const betaRad = THREE.MathUtils.degToRad(orientation.beta);
    const gammaRad = THREE.MathUtils.degToRad(orientation.gamma);
    euler.current.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    targetQuaternion.current.setFromEuler(euler.current);
    camera.quaternion.slerp(targetQuaternion.current, 0.1);
    // Skip targeting during automated UI states
    if (isObserving || isSlewing) return;
    // Throttle targeting to 10fps
    const now = state.clock.getElapsedTime();
    if (now - lastUpdate.current < 0.1) return;
    lastUpdate.current = now;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let closestObject = null;
    let objectType: 'star' | 'dso' | null = null;
    let minDistance = 0.04; // Targeting threshold approx 2.3 degrees
    // 1. DSOs priority check
    for (const dso of DSO_CATALOG) {
      const dsoPos = radecToVector3(dso.ra, dso.dec, 1).normalize();
      const dist = forward.distanceTo(dsoPos);
      if (dist < minDistance) {
        minDistance = dist;
        closestObject = dso;
        objectType = 'dso';
      }
    }
    // 2. Bright Stars fallback check
    if (!closestObject) {
      for (const star of STAR_CATALOG) {
        const starPos = radecToVector3(star.ra, star.dec, 1).normalize();
        const dist = forward.distanceTo(starPos);
        if (dist < minDistance) {
          minDistance = dist;
          closestObject = star;
          objectType = 'star';
        }
      }
    }
    // Selection management with hysteresis
    if (closestObject) {
      const isNewTarget = closestObject.id !== lastTargetId.current;
      if (isNewTarget) {
        if (objectType === 'star') {
          setSelectedStar(closestObject as any);
          if (selectedDSO) setSelectedDSO(null);
        } else if (objectType === 'dso') {
          setSelectedDSO(closestObject as any);
          if (selectedStar) setSelectedStar(null);
        }
        // Haptic feedback only on primary acquisition
        if (window.navigator.vibrate) window.navigator.vibrate(30);
        lastTargetId.current = closestObject.id;
      }
      hysteresisTimer.current = now + 0.5; // Lock target for 500ms
    } else {
      // Only clear if hysteresis has expired
      if (now > hysteresisTimer.current) {
        if (selectedStar) setSelectedStar(null);
        if (selectedDSO) setSelectedDSO(null);
        lastTargetId.current = null;
      }
    }
  });
  return null;
}