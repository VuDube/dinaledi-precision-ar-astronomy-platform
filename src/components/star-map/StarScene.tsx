import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment, Sky, Html } from '@react-three/drei';
import { StarField } from './StarField';
import { ARController } from './ARController';
import { GestureController } from './GestureController';
import { DeepSkyObjects } from './DeepSkyObjects';
import { ConstellationLines } from './ConstellationLines';
import { ConstellationBoundaries } from './ConstellationBoundaries';
import { SolarSystem } from './SolarSystem';
import { SlewController } from './SlewController';
import { MilkyWay } from './MilkyWay';
import { useAppStore } from '@/stores/app-store';
import { getSunPosition, getSkyColor, radecToVector3 } from '@/lib/astronomy-math';
import { useCatalogLoader } from '@/hooks/use-catalog-loader';
import * as THREE from 'three';
function LoadingIndicator({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.x += delta * 0.3;
    }
  });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.1, 8, 32]} />
        <meshStandardMaterial
          color="#EAB308"
          emissive="#EAB308"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      <Html center style={{
        color: '#EAB308',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 10px #EAB308',
        animation: 'pulse 1.5s infinite',
        width: '300px',
        textAlign: 'center'
      }}>
        Loading Skies... {Math.round(progress)}%
      </Html>
    </group>
  );
}
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
  const turbidity = THREE.MathUtils.mapLinear(bortleScale, 1, 9, 2, 12);
  const rayleigh = THREE.MathUtils.mapLinear(sunPos.altitude, -25, 15, 0.05, 5);
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
function TargetTelemetry() {
  const selectedStar = useAppStore(s => s.selectedStar);
  const selectedDSO = useAppStore(s => s.selectedDSO);
  const setTargetTelemetry = useAppStore(s => s.setTargetTelemetry);
  useFrame((state) => {
    const camera = state.camera;
    const target = selectedStar || selectedDSO;
    if(!target || !camera) {
      setTargetTelemetry(null);
      return;
    }
    const targetPos = radecToVector3(target.ra, target.dec, 100).normalize();
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const angle = cameraForward.angleTo(targetPos) * (180 / Math.PI);
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const onScreen = frustum.containsPoint(targetPos.clone().multiplyScalar(100));
    const screenPos = targetPos.clone().multiplyScalar(100).project(camera);
    const azimuth = Math.atan2(screenPos.x, screenPos.y) * (180 / Math.PI);
    setTargetTelemetry({ angle, onScreen, azimuth });
  });
  return null;
}
export function StarScene() {
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const simulationTime = useAppStore(s => s.simulationTime);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  const fov = useAppStore(s => s.fov);
  const isCoreReady = useAppStore(s => s.isCoreReady);
  const catalogLoadingProgress = useAppStore(s => s.catalogLoadingProgress);
  const rotateSpeed = useMemo(() => -0.2 * (fov / 55), [fov]);

  useEffect(() => {
    console.log('StarScene debug: isCoreReady=', isCoreReady, 'catalogProgress=', catalogLoadingProgress);
  }, [isCoreReady, catalogLoadingProgress]);
  useCatalogLoader();
  const sunPos = useMemo(() => getSunPosition(simulationTime, lat, lon), [simulationTime, lat, lon]);
  // Refined ambient logic to boost visibility during twilight
  const ambientIntensity = useMemo(() => {
    if (sunPos.altitude > 0) return 1.2;
    if (sunPos.altitude > -18) return THREE.MathUtils.mapLinear(sunPos.altitude, -18, 0, 0.1, 0.8);
    return 0.08;
  }, [sunPos.altitude]);
  return (
    <div className="absolute inset-0 transition-colors duration-1000" style={{ backgroundColor: '#000000' }}>
      <Canvas
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true }}
        dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={fov} near={0.01} far={6000} />
        <color attach='background' args={['#000000']} />
        {!isCoreReady ? (
          <LoadingIndicator progress={catalogLoadingProgress} />
        ) : (
          <>
            <Atmosphere />
            <MilkyWay />
            <StarField />
            <SolarSystem />
            <DeepSkyObjects />
            <ConstellationLines />
            <ConstellationBoundaries />
            <SlewController />
          </>
        )}
        <Stars radius={1500} depth={80} count={20000} factor={4} saturation={0} fade speed={1} />
        <CelestialGrid />
        {isCoreReady && <TargetTelemetry />}
        <Environment preset="night" />
        <GestureController />
        {isSensorActive ? (
          <ARController />
        ) : (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isSensorActive}
            autoRotateSpeed={0.06}
            rotateSpeed={rotateSpeed}
            enableDamping
            dampingFactor={0.05}
          />
        )}

        <ambientLight intensity={ambientIntensity} />
      </Canvas>
    </div>
  );
}