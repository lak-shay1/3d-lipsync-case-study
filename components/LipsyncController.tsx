'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Bone, Mesh, SkinnedMesh } from 'three';

export type MouthCue = { t: number; mouth: string; weight?: number };

type MorphMesh = (Mesh | SkinnedMesh) & {
  morphTargetDictionary: Record<string, number>;
  morphTargetInfluences: number[];
};

type AvatarUserData = {
  morphTargets?: Record<string, MorphMesh>;
  jawBone?: Bone | null;
  headBone?: Bone | null;
};

// openness per viseme label (0..1)
const OPENNESS: Record<string, number> = {
  M: 0.0, T: 0.2, S: 0.25, F: 0.3, L: 0.35,
  E: 0.4, I: 0.45, U: 0.55, O: 0.65, A: 0.8,
};

const MOUTH_TO_BLEND: Record<string, string> = {
  A:'viseme_aa', E:'viseme_E', I:'viseme_ih', O:'viseme_oh',
  U:'viseme_ou', F:'viseme_FV', L:'viseme_l', M:'viseme_mbp',
  S:'viseme_s',  T:'viseme_t'
};

let activeCues: MouthCue[] = [];
let startTime = 0;

export function setLipsyncCues(cues: MouthCue[]) {
  activeCues = cues ?? [];
  startTime = performance.now() / 1000;
}

export default function LipsyncController() {
  const { scene } = useThree();
  const current = useRef<MouthCue | null>(null);
  const smooth = useRef(0);

  useEffect(() => {
    return () => {
      const ud = scene.userData as AvatarUserData;
      const morphs = ud.morphTargets ?? {};
      Object.values(morphs).forEach((m) => m.morphTargetInfluences.fill(0));
      if (ud.jawBone) ud.jawBone.rotation.x = 0;
    };
  }, [scene]);

  useFrame((_state, delta) => {
    const ud = scene.userData as AvatarUserData;
    const morphs = ud.morphTargets ?? {};
    const jaw = ud.jawBone ?? undefined;
    const head = ud.headBone ?? undefined;

    const now = performance.now() / 1000 - startTime;

    let cue: MouthCue | null = null;
    for (let i = 0; i < activeCues.length; i++) {
      if (activeCues[i].t <= now) cue = activeCues[i];
      else break;
    }

    if (cue !== current.current) {
      current.current = cue;
      Object.values(morphs).forEach((m) => m.morphTargetInfluences.fill(0));

      if (cue) {
        const target = MOUTH_TO_BLEND[cue.mouth];
        if (target) {
          Object.values(morphs).forEach((m) => {
            const idx = m.morphTargetDictionary[target];
            if (idx != null) m.morphTargetInfluences[idx] = cue.weight ?? 1;
          });
        }
      }
    }

    // jaw fallback
    const targetOpen = OPENNESS[current.current?.mouth ?? 'M'] ?? 0;
    smooth.current += (targetOpen - smooth.current) * Math.min(1, delta * 12);
    if (jaw && !hasAnyMorphs(morphs)) {
      const maxOpen = 0.35; // radians
      jaw.rotation.x = -smooth.current * maxOpen;
    }

    // tiny head motion (optional)
    if (head) head.rotation.y = Math.sin(now * 1.5) * 0.03 * (0.2 + smooth.current);
  });

  return null;
}

function hasAnyMorphs(m: Record<string, MorphMesh>): boolean {
  for (const mesh of Object.values(m)) {
    if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) return true;
  }
  return false;
}
