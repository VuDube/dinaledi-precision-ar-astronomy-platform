import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sky, Stars } from '@react-three/drei';
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
function Atmosphere() {
  const simulationTime = useAppStore(s => s.simulationTime);
  const lat = useAppStore(s => s.latitude);
  const lon = useAppStore(s => s.longitude);
  const bortleScale = useAppStore(s => s.bortleScale);
  const { scene } = useThree();
  const sunPos = useMemo(() => getSunPosition(simulationTime, lat, lon), [simulationTime, lat, lon]);
  const sunAltitude = sunPos.altitude;
  const skyColorStr = useMemo(() => getSkyColor(sunAltitude), [sunAltitude]);
  const skyColorRef = useRef(new THREE.Color());
  skyColorRef.current.set(skyColorStr);
  
  useEffect(() => {
    if (!scene) return;
    scene.background = skyColorRef.current.clone();
    // FOREVER NO BLUE: Precise Horizon Guard
    // Astronomical twilight (-12 to -18) is where the "blue line" usually appears.
    // We ramp up density here to mask the geometry edge.
    const isTwilight = sunAltitude > -18 && sunAltitude < 0;
    const horizonGuardActive = sunAltitude > -18 && sunAltitude < -12;
    const fogDensity = horizonGuardActive ? 0.0022 : isTwilight ? 0.0015 : 0.00045;
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2(skyColorRef.current.clone(), fogDensity);
    } else {
      (scene.fog as THREE.FogExp2).color.copy(skyColorRef.current);
      (scene.fog as THREE.FogExp2).density = fogDensity;
    }
  }, [scene, sunAltitude]);
  const turbidity = THREE.MathUtils.mapLinear(bortleScale, 1, 9, 2, 10);
  const rayleigh = THREE.MathUtils.mapLinear(sunAltitude, -25, 20, 0.1, 4);
  return (
    <Sky
      sunPosition={[
        100 * Math.cos(THREE.MathUtils.degToRad(sunAltitude)) * Math.sin(THREE.MathUtils.degToRad(sunPos.azimuth)),
        100 * Math.sin(THREE.MathUtils.degToRad(sunAltitude)),
        100 * Math.cos(THREE.MathUtils.degToRad(sunAltitude)) * Math.cos(THREE.MathUtils.degToRad(sunPos.azimuth))
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
  const lastTargetRef = useRef<any>(null);
  const lastTelemetryRef = useRef<any>(null);
  useFrame((state) => {
    const target = selectedStar || selectedDSO;
    if (!target) {
      if (lastTelemetryRef.current !== null) {
        setTargetTelemetry(null);
        lastTelemetryRef.current = null;
      }
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
    const newTelemetry = { angle, onScreen, azimuth };
    if (!lastTelemetryRef.current || 
        Math.abs(newTelemetry.angle - lastTelemetryRef.current.angle) > 0.1 ||
        newTelemetry.onScreen !== lastTelemetryRef.current.onScreen) {
      setTargetTelemetry(newTelemetry);
      lastTelemetryRef.current = newTelemetry;
    }
  });
  return null;
}
export function StarScene() {
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const fov = useAppStore(s => s.fov);
  const isCoreReady = useAppStore(s => s.isCoreReady);
  useCatalogLoader();
  return (
    <Canvas
      gl={{ antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance' }}
      dpr={1}
    >
        <PerspectiveCamera makeDefault position={[0, 0, 0.01]} fov={fov} near={0.1} far={200000} />
        <color attach='background' args={['#000000']} />
        <Atmosphere />
        {isCoreReady && (
          <>
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
        <Environment preset="night" />
        <Stars radius={2500} depth={200} count={15000} fade={true} />
        <GestureController />
        {isSensorActive ? (
          <ARController />
        ) : (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            enableDamping
            dampingFactor={0.05}
          />
        )}
        <ambientLight intensity={0.1} />
      </Canvas>
  );
}