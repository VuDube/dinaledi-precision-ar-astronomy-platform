import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
export function MilkyWay() {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(() => {
    const count = 18000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const szs = new Float32Array(count);
    const galacticPlaneRotation = new THREE.Euler(
      THREE.MathUtils.degToRad(62.87), // Tilted relative to celestial equator
      0,
      THREE.MathUtils.degToRad(282.25)
    );
    const quat = new THREE.Quaternion().setFromEuler(galacticPlaneRotation);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute points in a disk-like shape
      const angle = Math.random() * Math.PI * 2;
      const radius = 950 + (Math.random() - 0.5) * 40;
      // Spread points mostly along a plane with some thickness
      const thickness = (Math.random() - 0.5) * 120 * Math.exp(-Math.pow(Math.random() * 2, 2));
      const v = new THREE.Vector3(
        radius * Math.cos(angle),
        thickness,
        radius * Math.sin(angle)
      );
      // Rotate to galactic coordinates
      v.applyQuaternion(quat);
      pos[i3] = v.x;
      pos[i3 + 1] = v.y;
      pos[i3 + 2] = v.z;
      // Colors: vary from deep blue to starlight white
      const mix = Math.random();
      const r = 0.6 + mix * 0.4;
      const g = 0.7 + mix * 0.3;
      const b = 0.9 + mix * 0.1;
      cols[i3] = r;
      cols[i3 + 1] = g;
      cols[i3 + 2] = b;
      szs[i] = Math.random() * 2.5 + 0.5;
    }
    return { positions: pos, colors: cols, sizes: szs };
  }, []);
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Subtle shimmer effect
      const t = clock.getElapsedTime() * 0.1;
      pointsRef.current.rotation.y = t * 0.05;
    }
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        transparent
        vertexColors
        opacity={0.15}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}