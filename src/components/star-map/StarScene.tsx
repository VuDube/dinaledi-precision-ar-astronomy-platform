import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
export function StarScene() {
  return (
    <div className="absolute inset-0 bg-[#020617]">
      <Canvas
        gl={{ antialias: false, stencil: false, depth: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} far={2000} />
        <Suspense fallback={null}>
          <StarField />
          {/* Faint galaxy background */}
          <Stars 
            radius={300} 
            depth={60} 
            count={20000} 
            factor={7} 
            saturation={0} 
            fade 
            speed={1} 
          />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          rotateSpeed={-0.4} 
        />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}