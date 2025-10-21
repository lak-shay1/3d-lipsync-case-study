'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Avatar from './Avatar';
import LipsyncController from './LipsyncController';

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 2]} intensity={1} />
      <Avatar />
      <Environment preset="city" />
      <OrbitControls enablePan={false} minDistance={1.8} maxDistance={4} />
      <LipsyncController />
    </Canvas>
  );
}

