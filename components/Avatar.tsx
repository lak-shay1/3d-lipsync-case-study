 'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Bone, Mesh, Object3D, SkinnedMesh } from 'three';
import lipsyncManager from '@/lib/lipsyncManager';

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

// map labels → desired openness (0..1) (used for jaw fallback)
const OPENNESS: Record<string, number> = {
  M: 0.0,
  T: 0.2,
  S: 0.25,
  F: 0.3,
  L: 0.35,
  E: 0.4,
  I: 0.45,
  U: 0.55,
  O: 0.65,
  A: 0.8,
};

// Default letter -> blendshape name mapping. Adjust if your GLB uses different names.
const MOUTH_TO_BLEND: Record<string, string> = {
  A: 'viseme_aa',
  E: 'viseme_E',
  I: 'viseme_ih',
  O: 'viseme_oh',
  U: 'viseme_ou',
  F: 'viseme_FV',
  L: 'viseme_l',
  M: 'viseme_mbp',
  S: 'viseme_s',
  T: 'viseme_t',
};

function AvatarInner() {
  const { scene } = useGLTF('/models/avatar.glb');

  const currentViseme = useRef<{ name: string; weight: number }>({ name: 'M', weight: 0 });

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

  // subscribe to lipsync manager
  useEffect(() => {
    const unsub = lipsyncManager.subscribe((v) => {
      currentViseme.current = { name: String(v.name ?? 'M'), weight: Number(v.weight ?? 1) };
    });
    return () => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // per-frame: apply morph targets or jaw fallback based on currentViseme
  useFrame((_state, delta) => {
    const ud = (scene as unknown as { userData?: AvatarUserData }).userData as AvatarUserData | undefined;
    const morphs = (ud?.morphTargets as Record<string, MorphMesh> | undefined) || {};
    const jaw = ud?.jawBone as Bone | undefined;

    const vis = currentViseme.current;
    const visName = String(vis.name ?? 'M');
    const weight = Number(vis.weight ?? 1);

    const hasMorphs = Object.keys(morphs).length > 0;

    if (hasMorphs) {
      // For each mesh with morphs, compute target influences and lerp toward them
      for (const mesh of Object.values(morphs)) {
        const dict = mesh.morphTargetDictionary || {};
        const infl = mesh.morphTargetInfluences || [];

        // determine blend names to apply: prefer exact viseme name, otherwise map letter -> blend
        const blendCandidates: string[] = [];
        if (dict[visName] !== undefined) blendCandidates.push(visName);
        const letter = visName.length === 1 ? visName : visName.toUpperCase().charAt(0);
        if (MOUTH_TO_BLEND[letter]) blendCandidates.push(MOUTH_TO_BLEND[letter]);

        // build target map
        const target = new Array(infl.length).fill(0);
        for (const b of blendCandidates) {
          const idx = dict[b];
          if (typeof idx === 'number') target[idx] = weight;
        }

        // lerp influences
        for (let i = 0; i < infl.length; i++) {
          const cur = infl[i] ?? 0;
          const nxt = cur + (target[i] - cur) * Math.min(1, delta * 12);
          infl[i] = nxt;
        }
      }
    } else if (jaw) {
      // jaw fallback
      const targetOpen = OPENNESS[visName] ?? 0;
      const maxOpen = 0.35; // radians (~20deg)
      // simple smoothing using damping factor
      const current = jaw.rotation.x || 0;
      const desired = -targetOpen * weight * maxOpen; // negative to open downward on many rigs
      jaw.rotation.x = current + (desired - current) * Math.min(1, delta * 8);
    }
  });

  return <primitive object={scene} />;
}

export default function Avatar() {
  return (
    <Suspense
      fallback={
        <mesh>
          <boxGeometry args={[0.8, 1.6, 0.3]} />
          <meshStandardMaterial />
        </mesh>
      }
    >
      <AvatarInner />
    </Suspense>
  );
}

useGLTF.preload('/models/avatar.glb');
