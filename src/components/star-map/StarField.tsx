import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
import { useAppStore } from '@/stores/app-store';
import { getStarsByMagnitude } from '@/lib/db';
export function StarField() {
  const catalogMeshRef = useRef<THREE.InstancedMesh>(null);
  const baselineMeshRef = useRef<THREE.InstancedMesh>(null);
  const magnitudeLimit = useAppStore(s => s.magnitudeLimit);
  const isCoreReady = useAppStore(s => s.isCoreReady);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // High-performance data refs to avoid React state reconciliation on 100k+ updates
  const catalogData = useRef<any[]>([]);
  const baselineData = useRef<any[]>([]);
  const catalogScales = useRef<Float32Array>(new Float32Array(0));
  const frameCount = useRef(0);
  const loadedRef = useRef<boolean>(false);
  // Implement Permanent 30,000 Star Procedural Baseline
  const generateBaseline = useCallback(() => {
    if (baselineData.current.length > 0) return;
    const stars: any[] = [];
    for (let i = 0; i < 30000; i++) {
      const ra = Math.random() * 24;
      const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
      const mag = 6.0 + Math.pow(Math.random(), 0.5) * 6.0;
      const bv = (Math.random() - 0.5) * 1.8;
      stars.push({
        pos: radecToVector3(ra, dec, 1000),
        color: new THREE.Color(bvToColor(bv)),
        baseScale: Math.max(0.3, (6.5 - mag) * 0.7),
        mag,
        id: `baseline_${i}`
      });
    }
    baselineData.current = stars;
  }, []);
  const loadCatalogFromDB = useCallback(async () => {
    if (loadedRef.current) return;
    try {
      const allStars = await getStarsByMagnitude(7.0, 5000);
      if (allStars.length < 100) return;
      const stars = allStars.map(star => ({
        pos: radecToVector3(star.ra, star.dec, 1000),
        color: new THREE.Color(bvToColor(star.bv)),
        baseScale: Math.max(0.6, (6.5 - star.mag) * 1.1),
        mag: star.mag,
        id: star.id
      }));
      catalogData.current = stars;
      catalogScales.current = new Float32Array(stars.length);
      loadedRef.current = true;
    } catch (e) {
      console.warn('StarField: Catalog DB load failed, relying on baseline.', e);
      loadedRef.current = true;
    }
  }, []);
  useEffect(() => {
    generateBaseline();
  }, [generateBaseline]);
  useEffect(() => {
    if (isCoreReady) loadCatalogFromDB();
  }, [isCoreReady, loadCatalogFromDB]);
  // Sync Baseline (Permanent background stars)
  useEffect(() => {
    if (baselineMeshRef.current && baselineData.current.length > 0) {
      baselineData.current.forEach((star, i) => {
        dummy.position.copy(star.pos);
        const visible = star.mag <= magnitudeLimit + 1.0;
        dummy.scale.setScalar(visible ? star.baseScale : 0);
        dummy.updateMatrix();
        baselineMeshRef.current!.setMatrixAt(i, dummy.matrix);
        baselineMeshRef.current!.setColorAt(i, star.color);
      });
      baselineMeshRef.current.instanceMatrix.needsUpdate = true;
      if (baselineMeshRef.current.instanceColor) baselineMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [magnitudeLimit, dummy]);
  // Sync Catalog (High-value stars)
  useEffect(() => {
    if (catalogMeshRef.current && catalogData.current.length > 0) {
      catalogData.current.forEach((star, i) => {
        dummy.position.copy(star.pos);
        const isVisible = star.mag <= magnitudeLimit;
        const scale = isVisible ? star.baseScale : 0;
        dummy.scale.setScalar(scale);
        if (i < catalogScales.current.length) catalogScales.current[i] = scale;
        dummy.updateMatrix();
        catalogMeshRef.current!.setMatrixAt(i, dummy.matrix);
        catalogMeshRef.current!.setColorAt(i, star.color);
      });
      catalogMeshRef.current.instanceMatrix.needsUpdate = true;
      if (catalogMeshRef.current.instanceColor) catalogMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [magnitudeLimit, dummy]);
  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return; // Reduce frame pressure
    if (!catalogMeshRef.current || !catalogData.current.length) return;
    const EPSILON = 0.01;
    const LERP_FACTOR = 0.1;
    let changed = false;
    for (let i = 0; i < catalogData.current.length; i++) {
      const star = catalogData.current[i];
      const isVisible = star.mag <= magnitudeLimit;
      const targetScale = isVisible ? star.baseScale : 0;
      const currentScale = catalogScales.current[i];
      if (Math.abs(currentScale - targetScale) > EPSILON) {
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, LERP_FACTOR);
        catalogScales.current[i] = nextScale;
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(nextScale);
        dummy.updateMatrix();
        catalogMeshRef.current!.setMatrixAt(i, dummy.matrix);
        changed = true;
      }
    }
    if (changed) catalogMeshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      {/* Baseline stars: Lower detail, high performance fallback */}
      <instancedMesh ref={baselineMeshRef} args={[undefined, undefined, 30000]}>
        <sphereGeometry args={[1.0, 4, 4]} />
        <meshBasicMaterial transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} fog={true} />
      </instancedMesh>
      {/* Catalog stars: High detail, animated entry */}
      <instancedMesh ref={catalogMeshRef} args={[undefined, undefined, 5000]}>
        <sphereGeometry args={[2.8, 8, 8]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={true} />
      </instancedMesh>
    </group>
  );
}