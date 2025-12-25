import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import { StarField } from './StarField';
import { ARController } from './ARController';
import { DeepSkyObjects } from './DeepSkyObjects';
import { ConstellationLines } from './ConstellationLines';
import { useAppStore } from '@/stores/app-store';
import * as THREE from 'three';
function CelestialGrid() {
  const showGrid = useAppStore(s => s.showGrid);
  const gridRef = useRef<THREE.GridHelper>(null);
  useEffect(() => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.LineBasicMaterial;
      material.transparent = true;
      material.opacity = 0.05;
      material.depthWrite = false;
    }
  }, [showGrid]);
  if (!showGrid) return null;
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <gridHelper ref={gridRef} args={[2000, 24, '#F8FAFC', '#F8FAFC']} />
    </group>
  );
}
export function StarScene() {
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const orientation = useAppStore(s => s.orientation);
  const simulationTime = useAppStore(s => s.simulationTime);
  // Dynamic ambient light based on altitude (beta)
  const ambientIntensity = Math.max(0.1, 0.4 - Math.abs(orientation.beta / 180));
  return (
    <div className="absolute inset-0 bg-[#020617]">
      <Canvas
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={60} far={3000} />
        <Suspense fallback={null}>
          <StarField />
          <DeepSkyObjects />
          <ConstellationLines />
          <Stars
            radius={600}
            depth={60}
            count={7000}
            factor={6}
            saturation={0.5}
            fade
            speed={0.5}
          />
          <CelestialGrid />
          <Environment preset="night" />
        </Suspense>
        {isSensorActive ? (
          <ARController />
        ) : (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isSensorActive}
            autoRotateSpeed={0.15}
            rotateSpeed={-0.4}
          />
        )}
        <fog attach="fog" args={['#020617', 500, 2500]} />
        <ambientLight intensity={ambientIntensity} />
      </Canvas>
    </div>
  );
}