import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { radecToVector3, bvToColor } from '@/lib/astronomy-math';
import { STAR_CATALOG } from '@/data/star-catalog';
import { useAppStore } from '@/stores/app-store';
export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const faintMeshRef = useRef<THREE.InstancedMesh>(null);
  const magnitudeLimit = useAppStore(s => s.magnitudeLimit);
  const { camera } = useThree();
  const frustum = useRef(new THREE.Frustum());
  const projScreenMatrix = useRef(new THREE.Matrix4());
  const { primaryStars, faintStars } = useMemo(() => {
    const primary = [];
    const faint = [];
    // In Phase 10 we use the available subset; the full catalog expands this via IDB
    for (const star of STAR_CATALOG) {
      const data = {
        pos: radecToVector3(star.ra, star.dec, 1000),
        color: new THREE.Color(bvToColor(star.bv)),
        baseScale: Math.max(0.6, (6.5 - star.mag) * 0.9),
        mag: star.mag,
        id: star.id
      };
      if (star.mag < 3.5) primary.push(data);
      else faint.push(data);
    }
    return { primaryStars: primary, faintStars: faint };
  }, []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    if (meshRef.current) {
      primaryStars.forEach((star, i) => {
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(star.baseScale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, star.color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
    if (faintMeshRef.current) {
      faintStars.forEach((star, i) => {
        dummy.position.copy(star.pos);
        dummy.scale.setScalar(star.baseScale);
        dummy.updateMatrix();
        faintMeshRef.current!.setMatrixAt(i, dummy.matrix);
        faintMeshRef.current!.setColorAt(i, star.color);
      });
      faintMeshRef.current.instanceMatrix.needsUpdate = true;
      if (faintMeshRef.current.instanceColor) faintMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [primaryStars, faintStars]);
  useFrame(() => {
    // Dynamic Magnitude & Frustum Filtering
    projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projScreenMatrix.current);
    const dummy = new THREE.Object3D();
    if (meshRef.current) {
      primaryStars.forEach((star, i) => {
        const isVisible = star.mag <= magnitudeLimit && frustum.current.containsPoint(star.pos);
        meshRef.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.scale.setScalar(isVisible ? star.baseScale : 0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (faintMeshRef.current) {
      faintStars.forEach((star, i) => {
        const isVisible = star.mag <= magnitudeLimit && frustum.current.containsPoint(star.pos);
        faintMeshRef.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.scale.setScalar(isVisible ? star.baseScale : 0);
        dummy.updateMatrix();
        faintMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      faintMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, primaryStars.length]}>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={faintMeshRef} args={[undefined, undefined, faintStars.length]}>
        <sphereGeometry args={[1.0, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}