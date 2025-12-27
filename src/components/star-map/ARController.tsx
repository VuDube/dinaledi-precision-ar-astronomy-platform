import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
import { STAR_CATALOG } from '@/data/star-catalog';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { radecToVector3 } from '@/lib/astronomy-math';
export function ARController() {
  const { camera } = useThree();
  const alpha = useAppStore(s => s.orientation.alpha);
  const beta = useAppStore(s => s.orientation.beta);
  const gamma = useAppStore(s => s.orientation.gamma);
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const isSlewing = useAppStore(s => s.isSlewing);
  const isObserving = useAppStore(s => s.isObserving);
  const isDetailOpen = useAppStore(s => s.isDetailOpen);
  const isRadialOpen = useAppStore(s => s.isRadialOpen);
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
    // Physical sensor fusion tracking
    const alphaRad = THREE.MathUtils.degToRad(alpha);
    const betaRad = THREE.MathUtils.degToRad(beta);
    const gammaRad = THREE.MathUtils.degToRad(gamma);
    euler.current.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    targetQuaternion.current.setFromEuler(euler.current);
    camera.quaternion.slerp(targetQuaternion.current, 0.18); // Increased from 0.15 for better response
    // Block targeting loop during UI interactions
    if (isObserving || isSlewing || isDetailOpen || isRadialOpen) return;
    const now = state.clock.getElapsedTime();
    if (now - lastUpdate.current < 0.08) return;
    lastUpdate.current = now;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let closestObject = null;
    let objectType: 'star' | 'dso' | null = null;
    // DSO prioritization with larger hit-box (0.045 rad)
    let minDistance = 0.045; 
    for (const dso of DSO_CATALOG) {
      const dsoPos = radecToVector3(dso.ra, dso.dec, 1).normalize();
      const dist = forward.distanceTo(dsoPos);
      if (dist < minDistance) {
        minDistance = dist;
        closestObject = dso;
        objectType = 'dso';
      }
    }
    // Stars fallback with smaller precision hit-box (0.03 rad)
    if (!closestObject) {
      minDistance = 0.03;
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
    if (closestObject) {
      const isNewTarget = closestObject.id !== lastTargetId.current;
      if (isNewTarget) {
        if (objectType === 'star') {
          setSelectedStar(closestObject as any);
        } else if (objectType === 'dso') {
          setSelectedDSO(closestObject as any);
        }
        if (window.navigator.vibrate) window.navigator.vibrate(30);
        lastTargetId.current = closestObject.id;
      }
      hysteresisTimer.current = now + 0.35;
    } else {
      if (now > hysteresisTimer.current) {
        if (selectedStar || selectedDSO) {
          setSelectedStar(null);
          setSelectedDSO(null);
          lastTargetId.current = null;
        }
      }
    }
  });
  return null;
}