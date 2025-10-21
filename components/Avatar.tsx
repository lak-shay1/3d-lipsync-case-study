'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

export default function Avatar() {
  const { scene } = useGLTF('/models/avatar.glb');

  // Basic scale/position 
  useEffect(() => {
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
  }, [scene]);

  return <primitive object={scene} />;
}

// Preload for faster first paint
useGLTF.preload('/models/avatar.glb');
