import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
import { useAppStore } from '@/stores/app-store';
import { getStarsByMagnitude } from '@/lib/db';
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const faintMeshRef = useRef<THREE.InstancedMesh>(null);
  const magnitudeLimit = useAppStore(s => s.magnitudeLimit);
  const isCoreReady = useAppStore(s => s.isCoreReady);
  const isCatalogReady = useAppStore(s => s.isCatalogReady);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [starsData, setStarsData] = useState<{ primary: any[], faint: any[] }>({ primary: [], faint: [] });
  const primaryScales = useRef<Float32Array>(new Float32Array(0));
  const lastMagLimit = useRef<number>(0);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);
  const loadFromDB = useCallback(async () => {
    const allStars = await getStarsByMagnitude(11.0);
    if (!isMounted.current) return;
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
      if (star.mag < 3.5) primary.push(data);
      else faint.push(data);
    }
    primaryScales.current = new Float32Array(primary.length);
    setStarsData({ primary, faint });
    console.log('StarField: loaded primary=', primary.length, 'faint=', faint.length);
  }, []);
  useEffect(() => {
    if (isCoreReady) loadFromDB();
  }, [isCoreReady, loadFromDB]);
  useEffect(() => {
    if (isCatalogReady) loadFromDB();
  }, [isCatalogReady, loadFromDB]);
  // Batched update for faint stars to avoid UI jank
  useEffect(() => {
    if (faintMeshRef.current && starsData.faint.length > 0) {
      // Small threshold to skip redundant heavy updates
      if (Math.abs(magnitudeLimit - lastMagLimit.current) < 0.05 && lastMagLimit.current !== magnitudeLimit) {
        lastMagLimit.current = magnitudeLimit;
        return;
      }
      const count = starsData.faint.length;
      for (let i = 0; i < count; i++) {
        const star = starsData.faint[i];
        dummy.position.copy(star.pos);
        const visible = star.mag <= magnitudeLimit;
        dummy.scale.setScalar(visible ? star.baseScale : 0);
        dummy.updateMatrix();
        faintMeshRef.current!.setMatrixAt(i, dummy.matrix);
        faintMeshRef.current!.setColorAt(i, star.color);
      }
      faintMeshRef.current.instanceMatrix.needsUpdate = true;
      if (faintMeshRef.current.instanceColor) faintMeshRef.current.instanceColor.needsUpdate = true;
      lastMagLimit.current = magnitudeLimit;
    }
  }, [dummy, starsData.faint, magnitudeLimit]);
  useEffect(() => {
    if (meshRef.current && starsData.primary.length > 0 && primaryScales.current.length === starsData.primary.length) {
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
    }
  }, [dummy, starsData.primary]);
  useFrame(() => {
    if (!isCoreReady || !meshRef.current || starsData.primary.length === 0 || primaryScales.current.length !== starsData.primary.length) return;
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
          <sphereGeometry args={[1.0, 4, 4]} />
          <meshBasicMaterial transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </instancedMesh>
      )}
    </group>
  );
}