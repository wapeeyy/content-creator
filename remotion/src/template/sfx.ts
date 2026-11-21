// Situation-based SFX. Overlays pick a mood; each mood rotates through its variants
// so the same sound never fires twice in a row.

export const SFX_MOODS: Record<string, string[]> = {
  transition: ["whoosh", "whoosh_fast", "swipe"],
  transition_heavy: ["whoosh_heavy"],
  pop: ["pop", "pop2"],
  funny: ["boing", "scratch", "boom"],
  wrong: ["buzzer"],
  right: ["chime", "sparkle"],
  drama: ["heartbeat", "drone"],
  glitch: ["glitch"],
  hit: ["impact", "bassdrop"],
  list: ["tick"],
  typing: ["typewriter"],
  snap: ["shutter"],
  notify: ["notif"],
  end: ["ding"],
  rise: ["riser"],
  key: ["keytap"],
};

const VOLUME: Record<string, number> = {
  whoosh: 0.45, whoosh_fast: 0.45, whoosh_heavy: 0.5, swipe: 0.45,
  pop: 0.5, pop2: 0.5, click: 0.55, tick: 0.55,
  boing: 0.5, scratch: 0.5, boom: 0.38,
  buzzer: 0.4, chime: 0.45, sparkle: 0.45,
  heartbeat: 0.5, drone: 0.4, glitch: 0.45,
  impact: 0.45, bassdrop: 0.4, riser: 0.4,
  typewriter: 0.5, shutter: 0.5, notif: 0.5, ding: 0.45, keytap: 0.3,
};

export type SfxEvent = { at: number; name: string; vol: number };
export type SfxCue = { at: number; mood: string; vol?: number };

export const resolveSfx = (cues: SfxCue[]): SfxEvent[] => {
  const counters: Record<string, number> = {};
  let last = "";
  const out: SfxEvent[] = [];
  for (const c of [...cues].sort((a, b) => a.at - b.at)) {
    // "reveal" = riser that lands on a hit
    if (c.mood === "reveal") {
      out.push({ at: c.at - 1.0, name: "riser", vol: VOLUME.riser });
      out.push({ at: c.at, name: "impact", vol: VOLUME.impact });
      last = "impact";
      continue;
    }
    const pool = SFX_MOODS[c.mood] ?? (VOLUME[c.mood] !== undefined ? [c.mood] : SFX_MOODS.pop);
    let i = counters[c.mood] ?? 0;
    let name = pool[i % pool.length];
    if (name === last && pool.length > 1 && c.mood !== "key") {
      i += 1;
      name = pool[i % pool.length];
    }
    counters[c.mood] = i + 1;
    last = name;
    out.push({ at: Math.max(0, c.at), name, vol: c.vol ?? VOLUME[name] ?? 0.5 });
  }
  return out;
};
