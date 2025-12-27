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
  const catalogData = useRef<any[]>([]);
  const baselineData = useRef<any[]>([]);
  const catalogScales = useRef<Float32Array>(new Float32Array(0));
  const frameCount = useRef(0);
  const loadedRef = useRef<boolean>(false);
  const [baselineReady, setBaselineReady] = useState(false);
  // ULTIMATE STABILITY: Permanent 40,000 Star Procedural Baseline
  const generateBaseline = useCallback(() => {
    if (baselineData.current.length > 0) return;
    const stars: any[] = [];
    for (let i = 0; i < 40000; i++) {
      const ra = Math.random() * 24;
      const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
      const mag = 5.5 + Math.pow(Math.random(), 0.5) * 6.5;
      const bv = (Math.random() - 0.5) * 2.0;
      stars.push({
        pos: radecToVector3(ra, dec, 1500),
        color: new THREE.Color(bvToColor(bv)),
        baseScale: Math.max(0.2, (6.5 - mag) * 0.6),
        mag,
        id: `baseline_${i}`
      });
    }
    baselineData.current = stars;
    setBaselineReady(true);
  }, []);
  const loadCatalogFromDB = useCallback(async () => {
    if (loadedRef.current) return;
    try {
      const allStars = await getStarsByMagnitude(7.2, 8000);
      if (allStars.length < 50) {
        loadedRef.current = true;
        return;
      }
      const stars = allStars.map(star => ({
        pos: radecToVector3(star.ra, star.dec, 1500),
        color: new THREE.Color(bvToColor(star.bv)),
        baseScale: Math.max(0.5, (6.8 - star.mag) * 1.2),
        mag: star.mag,
        id: star.id
      }));
      catalogData.current = stars;
      catalogScales.current = new Float32Array(stars.length);
      loadedRef.current = true;
    } catch (e) {
      loadedRef.current = true;
    }
  }, []);
  useEffect(() => {
    generateBaseline();
  }, [generateBaseline]);
  useEffect(() => {
    if (isCoreReady) loadCatalogFromDB();
  }, [isCoreReady, loadCatalogFromDB]);
  // Sync Baseline (Always present, high performance)
  useEffect(() => {
    if (baselineMeshRef.current && baselineReady) {
      baselineData.current.forEach((star, i) => {
        dummy.position.copy(star.pos);
        const visible = star.mag <= magnitudeLimit + 1.2;
        dummy.scale.setScalar(visible ? star.baseScale : 0);
        dummy.updateMatrix();
        baselineMeshRef.current!.setMatrixAt(i, dummy.matrix);
        baselineMeshRef.current!.setColorAt(i, star.color);
      });
      baselineMeshRef.current.instanceMatrix.needsUpdate = true;
      if (baselineMeshRef.current.instanceColor) baselineMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [magnitudeLimit, baselineReady, dummy]);
  // Sync Catalog (High-value stars, animated entry)
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
  }, [magnitudeLimit, dummy, isCoreReady]);
  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 4 !== 0) return; // Reduce load
    if (!catalogMeshRef.current || !catalogData.current.length) return;
    const EPSILON = 0.01;
    const LERP_FACTOR = 0.08;
    let changed = false;
    for (let i = 0; i < catalogData.current.length; i++) {
      const star = catalogData.current[i];
      const targetScale = (star.mag <= magnitudeLimit) ? star.baseScale : 0;
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
      <instancedMesh ref={baselineMeshRef} args={[null as any, null as any, 40000]}>
        <sphereGeometry args={[1.5, 4, 4]} />
        <meshBasicMaterial transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} fog={true} />
      </instancedMesh>
      <instancedMesh ref={catalogMeshRef} args={[null as any, null as any, 8000]}>
        <sphereGeometry args={[3.2, 8, 8]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={true} />
      </instancedMesh>
    </group>
  );
}