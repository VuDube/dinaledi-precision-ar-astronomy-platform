import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
import { STAR_CATALOG } from '@/data/star-catalog';
import { useAppStore } from '@/stores/app-store';
const STAR_COUNT = STAR_CATALOG.length;
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const magnitudeLimit = useAppStore(s => s.magnitudeLimit);
  const starData = useMemo(() => {
    return STAR_CATALOG.map((star) => {
      const pos = radecToVector3(star.ra, star.dec, 1000);
      const color = new THREE.Color(bvToColor(star.bv));
      // Base scale based on magnitude
      const baseScale = Math.max(0.5, (6.5 - star.mag) * 0.8);
      return { pos, color, baseScale, mag: star.mag };
    });
  }, []);
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    starData.forEach((star, i) => {
      dummy.position.copy(star.pos);
      // Filter by magnitude limit: If star is dimmer than limit, scale to 0
      const isVisible = star.mag <= magnitudeLimit;
      dummy.scale.setScalar(isVisible ? star.baseScale : 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, star.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [starData, magnitudeLimit]);
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}