import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
import { useAppStore } from '@/stores/app-store';
import { getStarsByMagnitude } from '@/lib/db';
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const faintMeshRef = useRef<THREE.InstancedMesh>(null);
  const magnitudeLimit = useAppStore(s => s.magnitudeLimit);
  const isCoreReady = useAppStore(s => s.isCoreReady);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const { camera } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [starsData, setStarsData] = useState<{ primary: any[], faint: any[] }>({ primary: [], faint: [] });
  const primaryScales = useRef<Float32Array>(new Float32Array(0));
  const lastMagLimit = useRef<number>(magnitudeLimit);
  const loadFromDB = useCallback(async () => {
    // We load up to magnitude 11.0 for the full set
    const allStars = await getStarsByMagnitude(11.0);
    const primary = [];
    const faint = [];
    for (const star of allStars) {
      const data = {
        pos: radecToVector3(star.ra, star.dec, 1000),
        color: new THREE.Color(bvToColor(star.bv)),
        baseScale: Math.max(0.4, (7.0 - star.mag) * 0.8),
        mag: star.mag,
        id: star.id
      };
      // Primary bright stars (mag < 3.5) are updated per frame for twinkling/smoothing
      if (star.mag < 3.5) primary.push(data);
      else faint.push(data);
    }
    primaryScales.current = new Float32Array(primary.length);
    setStarsData({ primary, faint });
  }, []);
  // Initial load when core is ready (10k stars)
  useEffect(() => {
    if (isCoreReady) {
      loadFromDB();
    }
  }, [isCoreReady, loadFromDB]);
  // Secondary refresh when background hydration finishes (125k stars)
  useEffect(() => {
    if (isCatalogReady) {
      loadFromDB();
    }
  }, [isCatalogReady, loadFromDB]);
  // Optimized static update for faint stars
  useEffect(() => {
    if (faintMeshRef.current && starsData.faint.length > 0) {
      starsData.faint.forEach((star, i) => {
        dummy.position.copy(star.pos);
        const visible = star.mag <= magnitudeLimit;
        dummy.scale.setScalar(visible ? star.baseScale : 0);
        dummy.updateMatrix();
        faintMeshRef.current!.setMatrixAt(i, dummy.matrix);
        faintMeshRef.current!.setColorAt(i, star.color);
      });
      faintMeshRef.current.instanceMatrix.needsUpdate = true;
      if (faintMeshRef.current.instanceColor) faintMeshRef.current.instanceColor.needsUpdate = true;
      faintMeshRef.current.geometry.computeBoundingSphere();
      lastMagLimit.current = magnitudeLimit;
    }
  }, [dummy, starsData.faint, magnitudeLimit]);
  // Initial update for primary stars
  useEffect(() => {
    if (meshRef.current && starsData.primary.length > 0) {
      starsData.primary.forEach((star, i) => {
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(star.baseScale);
        primaryScales.current[i] = star.baseScale;
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, star.color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
      meshRef.current.geometry.computeBoundingSphere();
    }
  }, [dummy, starsData.primary]);
  // Per-frame smoothing for bright stars
  useFrame(() => {
    if (!isCoreReady || !meshRef.current || starsData.primary.length === 0) return;
    const EPSILON = 0.005;
    let changed = false;
    starsData.primary.forEach((star, i) => {
      const isVisible = star.mag <= magnitudeLimit;
      const targetScale = isVisible ? star.baseScale : 0;
      const currentScale = primaryScales.current[i];
      if (Math.abs(currentScale - targetScale) > EPSILON) {
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
        primaryScales.current[i] = nextScale;
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(nextScale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        changed = true;
      }
    });
    if (changed) meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      {starsData.primary.length > 0 && (
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, starsData.primary.length]}
          frustumCulled={true}
        >
          <sphereGeometry args={[2.5, 8, 8]} />
          <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </instancedMesh>
      )}
      {starsData.faint.length > 0 && (
        <instancedMesh
          ref={faintMeshRef}
          args={[undefined, undefined, starsData.faint.length]}
          frustumCulled={true}
        >
          <sphereGeometry args={[1.5, 4, 4]} />
          <meshBasicMaterial transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} fog={true} />
        </instancedMesh>
      )}
    </group>
  );
}