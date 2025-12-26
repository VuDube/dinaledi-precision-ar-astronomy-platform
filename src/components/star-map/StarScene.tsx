import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment, Sky } from '@react-three/drei';
import { StarField } from './StarField';
import { ARController } from './ARController';
import { DeepSkyObjects } from './DeepSkyObjects';
import { ConstellationLines } from './ConstellationLines';
import { ConstellationBoundaries } from './ConstellationBoundaries';
import { SolarSystem } from './SolarSystem';
import { useAppStore } from '@/stores/app-store';
import { getSunPosition, getSkyColor } from '@/lib/astronomy-math';
import { useCatalogLoader } from '@/hooks/use-catalog-loader';
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
function Atmosphere() {
  const simulationTime = useAppStore(s => s.simulationTime);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  const bortleScale = useAppStore(s => s.bortleScale);
  const sunPos = useMemo(() => getSunPosition(simulationTime, lat, lon), [simulationTime, lat, lon]);
  // Adapt turbidity based on light pollution
  const turbidity = THREE.MathUtils.mapLinear(bortleScale, 1, 9, 2, 20);
  const rayleigh = THREE.MathUtils.mapLinear(sunPos.altitude, -20, 20, 0.1, 4);
  return (
    <Sky
      sunPosition={[
        100 * Math.cos(THREE.MathUtils.degToRad(sunPos.altitude)) * Math.sin(THREE.MathUtils.degToRad(sunPos.azimuth)),
        100 * Math.sin(THREE.MathUtils.degToRad(sunPos.altitude)),
        100 * Math.cos(THREE.MathUtils.degToRad(sunPos.altitude)) * Math.cos(THREE.MathUtils.degToRad(sunPos.azimuth))
      ]}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  );
}
export function StarScene() {
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const simulationTime = useAppStore(s => s.simulationTime);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  useCatalogLoader();
  const sunPos = useMemo(() => getSunPosition(simulationTime, lat, lon), [simulationTime, lat, lon]);
  const ambientIntensity = Math.max(0.05, THREE.MathUtils.mapLinear(sunPos.altitude, -18, 10, 0.1, 1));
  const skyColor = getSkyColor(sunPos.altitude);
  return (
    <div className="absolute inset-0 transition-colors duration-1000" style={{ backgroundColor: skyColor }}>
      <Canvas
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={60} far={3000} />
        <Suspense fallback={null}>
          <Atmosphere />
          <StarField />
          <SolarSystem />
          <DeepSkyObjects />
          <ConstellationLines />
          <ConstellationBoundaries />
          <Stars radius={600} depth={60} count={5000} factor={4} saturation={0.5} fade speed={0.5} />
          <CelestialGrid />
          <Environment preset="night" />
        </Suspense>
        {isSensorActive ? (
          <ARController />
        ) : (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isSensorActive && sunPos.altitude < -12}
            autoRotateSpeed={0.1}
            rotateSpeed={-0.3}
          />
        )}
        <fog attach="fog" args={[skyColor, 800, 2800]} />
        <ambientLight intensity={ambientIntensity} />
      </Canvas>
    </div>
  );
}