import type { MouthCue } from '@/components/LipsyncController';

type MouthCueLike = { t?: number; time?: number; mouth?: string; viseme?: string; weight?: number };

type WawaModule = {
  generateCuesFromText?: (text: string) => Promise<Partial<MouthCueLike>[]>;
  fromText?: (text: string) => Promise<Partial<MouthCueLike>[]>;
  default?: {
    generateCuesFromText?: (text: string) => Promise<Partial<MouthCueLike>[]>;
  };
};

function toMouthCues(raw?: Partial<MouthCueLike>[]): MouthCue[] {
  if (!raw) return [];
  return raw
    .map((c) => ({
      t: Number(c.t ?? c.time ?? 0),
      mouth: String(c.mouth ?? c.viseme ?? 'A'),
      weight: c.weight != null ? Number(c.weight) : 1,
    }))
    .sort((a, b) => a.t - b.t);
}

// fallback generator so demo always works
function fallbackCues(text: string): MouthCue[] {
  const seq = ['M', 'A', 'E', 'O', 'U'];
  const dur = Math.max(0.6, Math.min(2.5, text.length * 0.07));
  const step = 0.08;
  const cues: MouthCue[] = [];
  for (let t = 0, i = 0; t <= dur; t += step, i++) {
    cues.push({ t, mouth: seq[i % seq.length], weight: 1 });
  }
  cues.push({ t: dur + step, mouth: 'M', weight: 1 });
  return cues;
}

export async function cuesFromText(text: string): Promise<MouthCue[]> {
  try {
    const mod = (await import('wawa-lipsync')) as unknown as WawaModule;
    const api =
      mod.generateCuesFromText ??
      mod.fromText ??
      mod.default?.generateCuesFromText;

    if (typeof api === 'function') {
      const raw = await api(text);
      const cues = toMouthCues(raw);
      if (cues.length) return cues;
    }
    return fallbackCues(text);
  } catch {
    return fallbackCues(text);
  }
}
