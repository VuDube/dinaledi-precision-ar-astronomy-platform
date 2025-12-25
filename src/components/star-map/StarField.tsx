import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
const STAR_COUNT = 5000;
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Generate procedural star data
  const starData = useMemo(() => {
    const data = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const ra = Math.random() * 24;
      const dec = (Math.random() - 0.5) * 180;
      const magnitude = Math.random() * 6; // 0 (bright) to 6 (dim)
      const bv = (Math.random() * 2) - 0.4; // -0.4 to 1.6 approx
      const pos = radecToVector3(ra, dec, 500);
      const color = new THREE.Color(bvToColor(bv));
      const scale = Math.max(0.1, (6 - magnitude) * 0.4);
      data.push({ pos, color, scale });
    }
    return data;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    if (!meshRef.current) return;
    starData.forEach((star, i) => {
      dummy.position.copy(star.pos);
      dummy.scale.setScalar(star.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, star.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial transparent opacity={0.9} />
    </instancedMesh>
  );
}