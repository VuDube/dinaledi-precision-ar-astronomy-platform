import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { radecToVector3, applyPrecession } from '@/lib/astronomy-math';
import { DSO_CATALOG } from '@/data/dso-catalog';
import { useAppStore } from '@/stores/app-store';
export function DeepSkyObjects() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const simulationTime = useAppStore(s => s.simulationTime);
  const yearsOffset = simulationTime.getFullYear() - 2000;
  const dsoData = useMemo(() => {
    return DSO_CATALOG.map((dso) => {
      const adj = applyPrecession(dso.ra, dso.dec, yearsOffset);
      const pos = radecToVector3(adj.ra, adj.dec, 990);
      let color = new THREE.Color("#EAB308"); // Yellow/Nebula Gold
      if (dso.type === 'Galaxy') color = new THREE.Color("#f093fb");
      if (dso.type === 'Cluster') color = new THREE.Color("#4facfe");
      return { pos, color, type: dso.type };
    });
  }, [yearsOffset]);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const time = clock.getElapsedTime();
    dsoData.forEach((dso, i) => {
      dummy.position.copy(dso.pos);
      // Pulsating effect for DSOs
      const s = 1.5 + Math.sin(time * 2 + i) * 0.2;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, dso.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DSO_CATALOG.length]}>
      <ringGeometry args={[0.8, 1.2, 16]} />
      <meshBasicMaterial 
        transparent 
        opacity={0.8} 
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}