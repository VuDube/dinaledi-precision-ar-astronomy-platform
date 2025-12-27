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
  const frameCount = useRef(0);
  const loadedRef = useRef<boolean>(false);

  const generateProceduralStars = useCallback(() => {
    const primary: any[] = [];
    const faint: any[] = [];
    for (let i = 0; i < 30000; i++) {
      const star = {
        id: `proc_${i}`,
        ra: Math.random() * 24,
        dec: Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90,
        mag: 0.5 + Math.pow(Math.random(), 0.35) * 11.5,
        bv: (Math.random() - 0.5) * 1.4
      };
      const data = {
        pos: radecToVector3(star.ra, star.dec, 1000),
        color: new THREE.Color(bvToColor(star.bv)),
        baseScale: Math.max(0.5, (6.5 - star.mag) * 0.9),
        mag: star.mag,
        id: star.id
      };
      if (star.mag < 5.0) primary.push(data);
      else faint.push(data);
    }
    primaryScales.current = new Float32Array(primary.length);
    setStarsData({ primary, faint });
    console.log(`StarField: Initialized ${primary.length + faint.length} procedural fallback stars.`);
  }, []);
  // Load a fixed high-density range once to avoid IDB calls during Bortle changes
  const loadFromDB = useCallback(async () => {
    if (loadedRef.current) return;
    try {
      const startTime = performance.now();
      const allStars = await Promise.race([
        getStarsByMagnitude(11.0, 30000),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_5s')), 5000))
      ]);
      const queryTime = (performance.now() - startTime).toFixed(1);
      console.log(`StarField DB query: ${queryTime}ms, count ${allStars.length} stars <=11.0`);
      if (allStars.length < 500) {
        console.log('DB count too low <500, skip replacement with procedural fallback.');
        loadedRef.current = true;
        return;
      }
      const primary: any[] = [];
      const faint: any[] = [];
      for (const star of allStars) {
        const data = {
          pos: radecToVector3(star.ra, star.dec, 1000),
          color: new THREE.Color(bvToColor(star.bv)),
          baseScale: Math.max(0.5, (6.5 - star.mag) * 0.9),
          mag: star.mag,
          id: star.id
        };
        if (star.mag < 5.0) primary.push(data);
        else faint.push(data);
      }
      primaryScales.current = new Float32Array(primary.length);
      setStarsData({ primary, faint });
      loadedRef.current = true;
      console.log(`StarField: Loaded ${primary.length + faint.length} real stars, replacing procedural.`);
    } catch (e) {
      loadedRef.current = true;
      if ((e as Error).message === 'TIMEOUT_5s') {
        console.log('StarField: IDB timeout 5s exceeded, permanent procedural fallback, no hang.');
      } else {
        console.error('StarField DB load error:', e);
      }
    }
  }, []);
  useEffect(() => {
    generateProceduralStars();
  }, [generateProceduralStars]);

  useEffect(() => {
    if (isCoreReady || isCatalogReady) loadFromDB();
  }, [isCoreReady, isCatalogReady, loadFromDB]);
  // Initial Sync for faint stars on magnitudeLimit change
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
    }
  }, [starsData.faint, magnitudeLimit, dummy]);
  // Initial Sync for primary stars on magnitudeLimit change
  useEffect(() => {
    if (meshRef.current && starsData.primary.length > 0) {
      starsData.primary.forEach((star, i) => {
        dummy.position.copy(star.pos);
        const visible = star.mag <= magnitudeLimit;
        const scale = visible ? star.baseScale : 0;
        dummy.scale.setScalar(scale);
        if (i < primaryScales.current.length) primaryScales.current[i] = scale;
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, star.color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [starsData.primary, magnitudeLimit, dummy]);
  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    if (!meshRef.current || !starsData.primary.length) return;
    const EPSILON = 0.005;
    const LERP_FACTOR = 0.12;
    let changed = false;
    for (let i = 0; i < starsData.primary.length && i < primaryScales.current.length; i++) {
      const star = starsData.primary[i];
      const isVisible = star.mag <= magnitudeLimit;
      const targetScale = isVisible ? star.baseScale : 0;
      const currentScale = primaryScales.current[i];
      if (Math.abs(currentScale - targetScale) > EPSILON) {
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, LERP_FACTOR);
        primaryScales.current[i] = nextScale;
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(nextScale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        changed = true;
      }
    }
    if (changed) meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      {starsData.primary.length > 0 && (
        <instancedMesh ref={meshRef} args={[undefined, undefined, starsData.primary.length]}>
          <sphereGeometry args={[2.5, 8, 8]} />
          <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </instancedMesh>
      )}
      {starsData.faint.length > 0 && (
        <instancedMesh ref={faintMeshRef} args={[undefined, undefined, starsData.faint.length]}>
          <sphereGeometry args={[1.2, 4, 4]} />
          <meshBasicMaterial transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </instancedMesh>
      )}
    </group>
  );
}