'use client';

import { useGLTF } from '@react-three/drei';
import type { Bone, Mesh, Object3D, SkinnedMesh } from 'three';
import { useEffect, useMemo } from 'react';

type MorphMesh = (Mesh | SkinnedMesh) & {
  morphTargetDictionary: Record<string, number>;
  morphTargetInfluences: number[];
};

function isMorphMesh(o: Object3D): o is MorphMesh {
  const m = o as Partial<MorphMesh> & { isMesh?: boolean };
  // three attaches isMesh on Mesh/SkinnedMesh; check it without using `any`
  return !!(
    m.isMesh &&
    m.morphTargetDictionary &&
    m.morphTargetInfluences
  );
}

function isBone(o: Object3D): o is Bone {
  return (o as Bone).isBone === true;
}

type AvatarUserData = {
  morphTargets: Record<string, MorphMesh>;
  jawBone?: Bone | null;
  headBone?: Bone | null;
};

export default function Avatar() {
  const { scene } = useGLTF('/models/avatar.glb');

  const info = useMemo(() => {
    const morphTargets: Record<string, MorphMesh> = {};
    const bones: Bone[] = [];

    scene.traverse((o: Object3D) => {
      if (isBone(o)) bones.push(o);
      if (isMorphMesh(o)) morphTargets[o.name] = o;
    });

    const jaw =
      bones.find((b) => /jaw/i.test(b.name)) ||
      bones.find((b) => /chin/i.test(b.name)) ||
      null;

    const head =
      bones.find((b) => /head/i.test(b.name)) ||
      bones.find((b) => /neck/i.test(b.name)) ||
      null;

    return { morphTargets, bones, jaw, head };
  }, [scene]);

  useEffect(() => {
    // face camera
    scene.rotation.set(0, Math.PI, 0);
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    const ud: AvatarUserData = (scene.userData as AvatarUserData) ?? {
      morphTargets: {},
    };
    ud.morphTargets = info.morphTargets;
    ud.jawBone = info.jaw;
    ud.headBone = info.head;
    scene.userData = ud;

    if (process.env.NODE_ENV !== 'production') {
      const names = new Set<string>();
      Object.values(info.morphTargets).forEach((m) => {
        Object.keys(m.morphTargetDictionary).forEach((k) => names.add(k));
      });
      console.log('[Avatar] morph targets:', Array.from(names));
      console.log('[Avatar] jaw:', info.jaw?.name ?? 'not found', 'head:', info.head?.name ?? 'not found');
    }
  }, [scene, info]);

  return <primitive object={scene} />;
}

useGLTF.preload('/models/avatar.glb');
