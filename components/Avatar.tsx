'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';

export default function Avatar() {
  const { scene } = useGLTF('/models/avatar.glb');

  // Collect all meshes that have morph targets
  const morphTargets = useMemo(() => {
    const t: Record<string, any> = {};
    scene.traverse((o: any) => {
      if (o?.morphTargetDictionary && o?.morphTargetInfluences) t[o.name] = o;
    });
    return t;
  }, [scene]);

  useEffect(() => {
    // Attach for the controller to read
    (scene as any).userData.morphTargets = morphTargets;

    // Optional: one-time debug to inspect available blendshape names
    const names = new Set<string>();
    Object.values(morphTargets).forEach((m: any) => {
      const dict = m.morphTargetDictionary || {};
      Object.keys(dict).forEach((k) => names.add(k));
    });
    console.log('[Avatar] morph targets:', Array.from(names));
  }, [scene, morphTargets]);

   scene.rotation.x = -Math.PI / 2;

  return <primitive object={scene} />;
}

useGLTF.preload('/models/avatar.glb');
