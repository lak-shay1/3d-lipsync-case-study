'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Bone } from 'three';

export type MouthCue = { t: number; mouth: string; weight?: number };

// map labels → desired openness (0..1)
const OPENNESS: Record<string, number> = {
  M: 0.0, // closed
  T: 0.2,
  S: 0.25,
  F: 0.3,
  L: 0.35,
  E: 0.4,
  I: 0.45,
  U: 0.55,
  O: 0.65,
  A: 0.8,  // wide open
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
  const smooth = useRef(0); // current openness for smoothing

  useEffect(() => {
    return () => {
      const morphs = (scene as any).userData.morphTargets || {};
      for (const m of Object.values(morphs) as any[]) m?.morphTargetInfluences?.fill(0);
      const jaw = (scene as any).userData.jawBone as Bone | undefined;
      if (jaw) jaw.rotation.x = 0;
    };
  }, [scene]);

  useFrame((_state, delta) => {
    const morphs = (scene as any).userData.morphTargets || {};
    const jaw = (scene as any).userData.jawBone as Bone | undefined;
    const now = performance.now() / 1000 - startTime;

    // pick cue
    let cue: MouthCue | null = null;
    for (let i = 0; i < activeCues.length; i++) {
      if (activeCues[i].t <= now) cue = activeCues[i];
      else break;
    }
    if (cue !== current.current) {
      current.current = cue;
      // clear morphs if we have them
      for (const m of Object.values(morphs) as any[]) m?.morphTargetInfluences?.fill(0);
      if (cue) {
        const target = MOUTH_TO_BLEND[cue.mouth];
        if (target) {
          for (const m of Object.values(morphs) as any[]) {
            const dict = m.morphTargetDictionary as Record<string, number>;
            const infl = m.morphTargetInfluences as number[];
            const idx = dict?.[target];
            if (idx != null) infl[idx] = cue.weight ?? 1;
          }
        }
      }
    }

    // jaw fallback: ease toward target openness
    const targetOpen = OPENNESS[current.current?.mouth ?? 'M'] ?? 0;
    // smooth (lerp)
    smooth.current += (targetOpen - smooth.current) * Math.min(1, delta * 12);

    if (jaw && !hasAnyMorphs(morphs)) {
      // rotate jaw down a bit; tweak multiplier to fit your rig
      const maxOpen = 0.35; // ~20 degrees
      jaw.rotation.x = -smooth.current * maxOpen; // negative to open downward
    }
  });

  function hasAnyMorphs(m: Record<string, any>) {
    for (const v of Object.values(m) as any[]) {
      if (v?.morphTargetDictionary && v?.morphTargetInfluences) return true;
    }
    return false;
  }

  return null;
}
