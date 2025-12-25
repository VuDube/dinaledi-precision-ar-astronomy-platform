import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
const STAR_COUNT = 8000; // Increased density for Phase 2
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const starData = useMemo(() => {
    const data = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const ra = Math.random() * 24;
      const dec = (Math.random() - 0.5) * 180;
      const magnitude = Math.random() * 6.5; 
      const bv = (Math.random() * 2.2) - 0.4;
      const pos = radecToVector3(ra, dec, 1000); // Larger sphere for better depth
      const color = new THREE.Color(bvToColor(bv));
      // Magnitude 0 is bright, 6.5 is limit
      const scale = Math.max(0.2, (7 - magnitude) * 0.4);
      data.push({ pos, color, scale });
    }
    return data;
  }, []);
  // Use layout effect to set matrices only once
  // Since stars are "infinitely" far away, their relative positions in the sky don't change
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    starData.forEach((star, i) => {
      dummy.position.copy(star.pos);
      dummy.scale.setScalar(star.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, star.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [starData]);
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial 
        transparent 
        opacity={1} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}