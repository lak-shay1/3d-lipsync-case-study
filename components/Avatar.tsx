"use client";

import { useGLTF } from '@react-three/drei';
import { Bone } from 'three';
import { useEffect, useMemo } from 'react';

export default function Avatar() {
  const { scene } = useGLTF('/models/avatar.glb');

  // collect morph targets (will be empty on this model) + try to find a jaw bone
  const info = useMemo(() => {
    const morphTargets: Record<string, any> = {};
    const bones: Bone[] = [];

    scene.traverse((o: any) => {
      if (o?.morphTargetDictionary && o?.morphTargetInfluences) morphTargets[o.name] = o;
      if (o.isBone) bones.push(o as Bone);
    });

    // heuristics: common jaw names (Mixamo uses "mixamorig:Jaw")
    const jaw =
      bones.find(b => /jaw/i.test(b.name)) ||
      bones.find(b => /chin/i.test(b.name)) ||
      null;

    return { morphTargets, bones, jaw };
  }, [scene]);

  useEffect(() => {
    (scene as any).userData.morphTargets = info.morphTargets;
    (scene as any).userData.jawBone = info.jaw;

    console.log('[Avatar] morph targets:', Object.keys(info.morphTargets)); // likely []
    console.log('[Avatar] jaw bone:', info.jaw?.name ?? 'not found');
    if (!info.jaw) {
      console.log('[Avatar] bone list:', (info.bones || []).map(b => b.name));
    }
  }, [scene, info]);

  return <primitive object={scene} />;
}

useGLTF.preload('/models/avatar.glb');
