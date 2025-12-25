import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
import { STAR_CATALOG } from '@/data/star-catalog';
import { useAppStore } from '@/stores/app-store';
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const faintMeshRef = useRef<THREE.InstancedMesh>(null);
  const magnitudeLimit = useAppStore(s => s.magnitudeLimit);
  // Divide stars into Primary (Bright) and Faint for LOD
  const { primaryStars, faintStars } = useMemo(() => {
    const primary = [];
    const faint = [];
    for (const star of STAR_CATALOG) {
      const data = {
        pos: radecToVector3(star.ra, star.dec, 1000),
        color: new THREE.Color(bvToColor(star.bv)),
        baseScale: Math.max(0.5, (6.5 - star.mag) * 0.8),
        mag: star.mag
      };
      if (star.mag < 4.0) primary.push(data);
      else faint.push(data);
    }
    return { primaryStars: primary, faintStars: faint };
  }, []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    // Update Primary
    if (meshRef.current) {
      primaryStars.forEach((star, i) => {
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(star.mag <= magnitudeLimit ? star.baseScale : 0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, star.color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
    // Update Faint
    if (faintMeshRef.current) {
      faintStars.forEach((star, i) => {
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(star.mag <= magnitudeLimit ? star.baseScale : 0);
        dummy.updateMatrix();
        faintMeshRef.current!.setMatrixAt(i, dummy.matrix);
        faintMeshRef.current!.setColorAt(i, star.color);
      });
      faintMeshRef.current.instanceMatrix.needsUpdate = true;
      if (faintMeshRef.current.instanceColor) faintMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [primaryStars, faintStars, magnitudeLimit]);
  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, primaryStars.length]}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={faintMeshRef} args={[undefined, undefined, faintStars.length]}>
        <sphereGeometry args={[0.8, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}