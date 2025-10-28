// Lightweight lipsync manager: uses wawa-lipsync when present, otherwise
// provides a simple cue-based fallback. Consumers can subscribe to
// viseme updates, call connectAudio(audioEl) or setCues(cues).

type Viseme = { name: string; weight: number };
type MouthCue = { t: number; mouth: string; weight?: number };

class LipsyncManager {
  private subs = new Set<(v: Viseme) => void>();
  private current: Viseme = { name: 'M', weight: 0 };
  private raf = 0;
  private cues: MouthCue[] = [];
  private start = 0;
  // optional wawa manager returned by wawa-lipsync
  private wawaManager: unknown = undefined;

  constructor() {
    // try to import wawa-lipsync dynamically; if present, instantiate
    // and expose connectAudio. This is best-effort and non-blocking.
    (async () => {
      try {
        const mod = await import('wawa-lipsync');
        // The library may export a constructor (Lipsync) or default; try a few shapes
        const m = mod as unknown;
        const asRecord = m as Record<string, unknown>;
        const candidate = (asRecord.Lipsync ?? asRecord.default ?? m) as unknown;
        if (typeof candidate === 'function') {
          const Ctor = candidate as unknown as new (...args: unknown[]) => unknown;
          this.wawaManager = new Ctor();
          const wm = this.wawaManager as Record<string, unknown> | undefined;
          if (wm && typeof wm.on === 'function') {
            (wm.on as unknown as (evt: string, cb: (v: unknown) => void) => void)('viseme', (v: unknown) => {
              const vis: Viseme = { name: String((v as Record<string, unknown>)?.name ?? 'M'), weight: Number((v as Record<string, unknown>)?.weight ?? 1) };
              this.setCurrent(vis);
            });
          }
        }
      } catch {
        // not available — manager will use cue fallback
      }
    })();
  }

  private setCurrent(v: Viseme) {
    this.current = v;
    for (const s of this.subs) s(v);
  }

  subscribe(cb: (v: Viseme) => void) {
    this.subs.add(cb);
    // immediately send the current state
    cb(this.current);
    return () => this.subs.delete(cb);
  }

  connectAudio(audioEl: HTMLMediaElement) {
    const wm = this.wawaManager as Record<string, unknown> | undefined;
    if (wm && typeof wm.connectAudio === 'function') {
      try {
        (wm.connectAudio as unknown as (el: HTMLMediaElement) => void)(audioEl);
        return true;
      } catch {
        // fall through
      }
    }
    return false;
  }

  // set a cue timeline: array of {t: seconds, mouth: label, weight}
  setCues(cues: MouthCue[]) {
    this.cues = (cues || []).slice().sort((a, b) => a.t - b.t);
    this.start = performance.now() / 1000;
    this.startRaf();
  }

  private startRaf() {
    if (this.raf) return;
    const loop = () => {
      const now = performance.now() / 1000 - this.start;
      // find latest cue <= now
      let sel: MouthCue | null = null;
      for (let i = 0; i < this.cues.length; i++) {
        if (this.cues[i].t <= now) sel = this.cues[i];
        else break;
      }
      if (sel) {
        this.setCurrent({ name: String(sel.mouth ?? 'M'), weight: Number(sel.weight ?? 1) });
      } else {
        // if no cue yet, set closed mouth
        this.setCurrent({ name: 'M', weight: 0 });
      }
      // stop when past cues
      if (now > (this.cues.length ? this.cues[this.cues.length - 1].t + 1 : 0)) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        return;
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
}

const lipsyncManager = new LipsyncManager();

export default lipsyncManager;
