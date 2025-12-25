import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '@/stores/app-store';
export function ARController() {
  const { camera } = useThree();
  const orientation = useAppStore((s) => s.orientation);
  const isSensorActive = useAppStore((s) => s.isSensorActive);
  // Use quaternions to avoid gimbal lock
  const targetQuaternion = useRef(new THREE.Quaternion());
  const currentQuaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  useFrame(() => {
    if (!isSensorActive) return;
    // Convert degrees to radians
    // Device Orientation coordinates:
    // alpha: rotation around Z axis [0, 360]
    // beta: rotation around X axis [-180, 180]
    // gamma: rotation around Y axis [-90, 90]
    const alphaRad = THREE.MathUtils.degToRad(orientation.alpha);
    const betaRad = THREE.MathUtils.degToRad(orientation.beta);
    const gammaRad = THREE.MathUtils.degToRad(orientation.gamma);
    // Apply rotations in ZXY order (typical for mobile device orientation)
    euler.current.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    targetQuaternion.current.setFromEuler(euler.current);
    // Smoothly interpolate (lerp) to the target orientation to reduce sensor noise
    camera.quaternion.slerp(targetQuaternion.current, 0.1);
  });
  return null;
}