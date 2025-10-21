'use client';

import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Bounds,
  useBounds,
} from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import Avatar from './Avatar';
import LipsyncController from './LipsyncController';

function FitOnLoad() {
  const api = useBounds();
  useEffect(() => {
    api.refresh().fit(); // frame everything once
  }, [api]);
  return null;
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1.6, 3], fov: 40, near: 0.1, far: 100 }}>
      {/* lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1.1} />

      {/* auto-fit the content */}
      <Bounds clip observe margin={1.2}>
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
        <FitOnLoad />
      </Bounds>

      {/* environment & ground */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <ContactShadows
        opacity={0.35}
        blur={2.8}
        position={[0, -0.001, 0]}
        scale={10}
        far={6}
      />

      {/* controls: limit tilt so you don't orbit under the floor */}
      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={5}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, 1.0, 0]}
      />

      <LipsyncController />
    </Canvas>
  );
}
