import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
export function MilkyWay() {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(() => {
    const count = 25000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const szs = new Float32Array(count);
    const galacticPlaneRotation = new THREE.Euler(
      THREE.MathUtils.degToRad(62.87),
      0,
      THREE.MathUtils.degToRad(282.25)
    );
    const quat = new THREE.Quaternion().setFromEuler(galacticPlaneRotation);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      // Central bulge logic: more stars closer to the center (radius 0)
      const distFactor = Math.pow(Math.random(), 2);
      const radius = 950 + (Math.random() - 0.5) * 60;
      // Thickness increases at center for the bulge
      const centerProximity = Math.exp(-Math.pow(angle - Math.PI, 2) * 0.5); 
      const thickness = (Math.random() - 0.5) * (140 + 100 * centerProximity) * Math.exp(-Math.pow(Math.random() * 2.5, 2));
      const v = new THREE.Vector3(
        radius * Math.cos(angle),
        thickness,
        radius * Math.sin(angle)
      );
      v.applyQuaternion(quat);
      pos[i3] = v.x;
      pos[i3 + 1] = v.y;
      pos[i3 + 2] = v.z;
      const mix = Math.random();
      cols[i3] = 0.5 + mix * 0.5;      // R
      cols[i3 + 1] = 0.6 + mix * 0.4;  // G
      cols[i3 + 2] = 0.8 + mix * 0.2;  // B
      szs[i] = Math.random() * 3.0 + 0.5;
    }
    return { positions: pos, colors: cols, sizes: szs };
  }, []);
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.y = t * 0.02;
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
        size={1.5}
        transparent
        vertexColors
        opacity={0.12}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}