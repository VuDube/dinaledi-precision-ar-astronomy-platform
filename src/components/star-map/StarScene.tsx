import React, { useRef, useMemo } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
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
    }
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <torusGeometry args={[1.2, 0.05, 16, 64]} />
        <meshStandardMaterial color="#EAB308" emissive="#EAB308" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <Html center>
        <div className="text-nebula text-xl font-black uppercase tracking-widest animate-pulse whitespace-nowrap">
          Hydrating Sky {Math.round(progress)}%
        </div>
      </Html>
    </group>
  );
}
function Atmosphere() {
  const simulationTime = useAppStore(s => s.simulationTime);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  const bortleScale = useAppStore(s => s.bortleScale);
  const sunPos = useMemo(() => getSunPosition(simulationTime, lat, lon), [simulationTime, lat, lon]);
  const turbidity = THREE.MathUtils.mapLinear(bortleScale, 1, 9, 2, 10);
  const rayleigh = THREE.MathUtils.mapLinear(sunPos.altitude, -25, 15, 0.1, 4);
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
    const target = selectedStar || selectedDSO;
    if(!target) {
      setTargetTelemetry(null);
      return;
    }
    const targetPos = radecToVector3(target.ra, target.dec, 100).normalize();
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion).normalize();
    const angle = cameraForward.angleTo(targetPos) * (180 / Math.PI);
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse));
    const onScreen = frustum.containsPoint(targetPos.clone().multiplyScalar(100));
    const screenPos = targetPos.clone().multiplyScalar(100).project(state.camera);
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
  useCatalogLoader();
  const sunPos = useMemo(() => getSunPosition(simulationTime, lat, lon), [simulationTime, lat, lon]);
  const skyColor = useMemo(() => getSkyColor(sunPos.altitude), [sunPos.altitude]);
  const ambientIntensity = useMemo(() => {
    if (sunPos.altitude > 0) return 1.0;
    if (sunPos.altitude > -18) return THREE.MathUtils.mapLinear(sunPos.altitude, -18, 0, 0.05, 0.6);
    return 0.05; // Lowered for better MW contrast
  }, [sunPos.altitude]);
  return (
    <div className="absolute inset-0" style={{ backgroundColor: skyColor }}>
      <Canvas
        gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
        dpr={window.devicePixelRatio > 1 ? 2 : 1}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={fov} near={0.1} far={8000} />
        <color attach='background' args={[skyColor]} />
        <fog attach="fog" args={[skyColor, 1500, 6000]} />
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
            <TargetTelemetry />
          </>
        )}
        <Stars radius={1500} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />
        <GestureController />
        {isSensorActive ? (
          <ARController />
        ) : (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isSensorActive}
            autoRotateSpeed={0.05}
            enableDamping
            dampingFactor={0.05}
          />
        )}
        <ambientLight intensity={ambientIntensity} />
      </Canvas>
    </div>
  );
}