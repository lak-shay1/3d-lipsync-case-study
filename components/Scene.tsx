'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SpinningBox from './SpinningBox';

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 40 }}>
      {/* lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 2]} intensity={1} />

      {/* demo object (replace with Avatar later) */}
      <SpinningBox />

      {/* nice background lighting */}
      <Environment preset="city" />

      {/* user controls */}
      <OrbitControls enablePan={false} minDistance={1.8} maxDistance={4} />
    </Canvas>
  );
}
