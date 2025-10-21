import type { MouthCue } from '@/components/LipsyncController';

// naive fallback generator: cycles M→A→E→O→U across the text length
function fallbackCues(text: string): MouthCue[] {
  const seq = ['M', 'A', 'E', 'O', 'U'];
  const dur = Math.max(0.6, Math.min(2.5, text.length * 0.07)); // 0.07s per char
  const step = 0.08; // 80ms steps
  const cues: MouthCue[] = [];
  for (let t = 0, i = 0; t <= dur; t += step, i++) {
    cues.push({ t, mouth: seq[i % seq.length], weight: 1 });
  }
  cues.push({ t: dur + step, mouth: 'M', weight: 1 }); // close at end
  return cues;
}

export async function cuesFromText(text: string): Promise<MouthCue[]> {
  try {
    // Adjust import/name to match the Wawa package you installed
    const wawa: any = await import('wawa-lipsync');
    // Try a couple of common shapes
    const api = wawa?.generateCuesFromText || wawa?.fromText || wawa?.default?.generateCuesFromText;
    if (typeof api === 'function') {
      const raw = await api(text);
      const cues = (raw ?? []).map((c: any) => ({
        t: Number(c.t ?? c.time ?? 0),
        mouth: String(c.mouth ?? c.viseme ?? 'A'),
        weight: Number(c.weight ?? 1),
      }));
  if (cues.length) return cues.sort((a: MouthCue, b: MouthCue) => a.t - b.t);
    }
    console.warn('[Wawa] API not found, using fallback');
    return fallbackCues(text);
  } catch (e) {
    console.warn('[Wawa] import failed, using fallback', e);
    return fallbackCues(text);
  }
}
