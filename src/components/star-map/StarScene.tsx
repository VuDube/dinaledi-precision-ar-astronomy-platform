import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { ARController } from './ARController';
import { useAppStore } from '@/stores/app-store';
export function StarScene() {
  const isSensorActive = useAppStore(s => s.isSensorActive);
  const orientation = useAppStore(s => s.orientation);
  // Dynamic light intensity based on tilt (brighter near horizon)
  const ambientIntensity = Math.max(0.2, 0.8 - Math.abs(orientation.beta / 180));
  return (
    <div className="absolute inset-0 bg-[#020617]">
      <Canvas
        gl={{ antialias: true, stencil: false, depth: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} far={2000} />
        <Suspense fallback={null}>
          <StarField />
          <Stars
            radius={300}
            depth={60}
            count={15000}
            factor={7}
            saturation={0}
            fade
            speed={1}
          />
        </Suspense>
        {isSensorActive ? (
          <ARController />
        ) : (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isSensorActive}
            autoRotateSpeed={0.5}
            rotateSpeed={-0.4}
          />
        )}
        <ambientLight intensity={ambientIntensity} />
      </Canvas>
    </div>
  );
}