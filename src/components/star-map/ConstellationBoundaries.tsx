import React, { useMemo } from 'react';
import * as THREE from 'three';
import { radecToVector3 } from '@/lib/astronomy-math';
import { CONSTELLATIONS } from '@/data/constellation-data';
import { useAppStore } from '@/stores/app-store';
export function ConstellationBoundaries() {
  const showBoundaries = useAppStore(s => s.showBoundaries);
  const linesGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    CONSTELLATIONS.forEach((c) => {
      if (!c.boundaries) return;
      for (let i = 0; i < c.boundaries.length - 1; i++) {
        const [ra1, dec1] = c.boundaries[i];
        const [ra2, dec2] = c.boundaries[i + 1];
        points.push(radecToVector3(ra1, dec1, 992));
        points.push(radecToVector3(ra2, dec2, 992));
      }
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);
  if (!showBoundaries || linesGeometry.attributes.position.count === 0) return null;
  return (
    <lineSegments geometry={linesGeometry}>
      <lineBasicMaterial
        color="#F8FAFC"
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}