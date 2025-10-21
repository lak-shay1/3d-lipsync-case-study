'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export type MouthCue = { t: number; mouth: string; weight?: number };

// 👉 Map Wawa mouth labels/visemes → your model's blendshape names.
// Edit the RIGHT-HAND side strings to match what you saw in the console log.
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

let activeCues: MouthCue[] = [];
let startTime = 0;

export function setLipsyncCues(cues: MouthCue[]) {
  activeCues = cues ?? [];
  startTime = performance.now() / 1000;
}

export default function LipsyncController() {
  const { scene } = useThree();
  const current = useRef<MouthCue | null>(null);

  useEffect(() => {
    // reset on unmount
    return () => {
      const morphs = (scene as any).userData.morphTargets || {};
      for (const m of Object.values(morphs) as any[]) {
        m?.morphTargetInfluences?.fill(0);
      }
    };
  }, [scene]);

  useFrame(() => {
    const morphs = (scene as any).userData.morphTargets || {};
    const now = performance.now() / 1000 - startTime;

    // pick the latest cue with t <= now
    let cue: MouthCue | null = null;
    for (let i = 0; i < activeCues.length; i++) {
      if (activeCues[i].t <= now) cue = activeCues[i];
      else break;
    }

    if (cue !== current.current) {
      current.current = cue;

      // clear all influences
      for (const m of Object.values(morphs) as any[]) {
        if (m?.morphTargetInfluences) m.morphTargetInfluences.fill(0);
      }

      if (cue) {
        const target = MOUTH_TO_BLEND[cue.mouth] ?? MOUTH_TO_BLEND.A;
        for (const m of Object.values(morphs) as any[]) {
          const dict = m.morphTargetDictionary as Record<string, number>;
          const infl = m.morphTargetInfluences as number[];
          const idx = dict?.[target];
          if (idx != null) infl[idx] = cue.weight ?? 1;
        }
      }
    }
  });

  return null;
}
