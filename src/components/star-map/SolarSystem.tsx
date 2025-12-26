import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { radecToVector3, getPlanetaryPosition, applyPrecession } from '@/lib/astronomy-math';
import { useAppStore } from '@/stores/app-store';
const PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
export function SolarSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const simulationTime = useAppStore(s => s.simulationTime);
  const showPlanets = useAppStore(s => s.showPlanets);
  const showISS = useAppStore(s => s.showISS);
  const yearsOffset = simulationTime.getFullYear() - 2000;
  const planetData = useMemo(() => {
    return PLANETS.map(name => {
      const posData = getPlanetaryPosition(name, simulationTime);
      const adj = applyPrecession(posData.ra, posData.dec, yearsOffset);
      return {
        name,
        pos: radecToVector3(adj.ra, adj.dec, 980),
        color: new THREE.Color(posData.color)
      };
    });
  }, [simulationTime, yearsOffset]);
  useFrame(({ clock }) => {
    if (!meshRef.current || !showPlanets) return;
    const dummy = new THREE.Object3D();
    const time = clock.getElapsedTime();
    planetData.forEach((planet, i) => {
      dummy.position.copy(planet.pos);
      const scale = 3.5 + Math.sin(time + i) * 0.3;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, planet.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });
  if (!showPlanets) return null;
  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, planetData.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      {showISS && (
        <ISSMailer time={simulationTime} />
      )}
    </group>
  );
}
function ISSMailer({ time }: { time: Date }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * 0.2;
    // Circular path simulation for ISS
    const ra = (t * 24) % 24;
    const dec = Math.sin(t * 5) * 51; // ISS Inclination approx 51.6
    const pos = radecToVector3(ra, dec, 975);
    meshRef.current.position.copy(pos);
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
}