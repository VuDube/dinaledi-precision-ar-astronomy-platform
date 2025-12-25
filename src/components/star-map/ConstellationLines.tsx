import React, { useMemo } from 'react';
import * as THREE from 'three';
import { radecToVector3 } from '@/lib/astronomy-math';
import { CONSTELLATIONS } from '@/data/constellation-data';
import { useAppStore } from '@/stores/app-store';
export function ConstellationLines() {
  const showConstellations = useAppStore(s => s.showConstellations);
  const linesGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    CONSTELLATIONS.forEach((c) => {
      c.lines.forEach(([ra1, dec1, ra2, dec2]) => {
        // Render at radius 995 (slightly inside stars at 1000) to ensure stars stay on top visually
        // but avoid clipping behind atmospheric effects
        points.push(radecToVector3(ra1, dec1, 995));
        points.push(radecToVector3(ra2, dec2, 995));
      });
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);
  if (!showConstellations) return null;
  return (
    <lineSegments geometry={linesGeometry}>
      <lineBasicMaterial
        color="#EAB308"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        linewidth={1}
      />
    </lineSegments>
  );
}