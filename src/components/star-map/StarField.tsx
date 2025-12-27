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
  const loadFromDB = useCallback(async () => {
    const allStars = await getStarsByMagnitude(10.5);
    const primary = [];
    const faint = [];
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
    console.log(`StarField: primary ${primary.length} (mag<5) faint ${faint.length} total ${primary.length + faint.length} magLimit=${magnitudeLimit}`);
  }, []);
  useEffect(() => {
    if (isCoreReady) loadFromDB();
  }, [isCoreReady, loadFromDB]);
  useEffect(() => {
    if (isCatalogReady) loadFromDB();
  }, [isCatalogReady, loadFromDB]);
  // Initial Sync for faint stars
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
  // Initial Sync for primary stars
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
    // Throttle Primary instance updates for 30fps transition logic on 60fps loop
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    if (!meshRef.current || !starsData.primary.length) return;
    const EPSILON = 0.005;
    let changed = false;
    for (let i = 0; i < starsData.primary.length && i < primaryScales.current.length; i++) {
      const star = starsData.primary[i];
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