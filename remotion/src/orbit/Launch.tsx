import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, Galaxy, Hud, Label, Mono, Phone, Stars, Wide, fade, ramp, seeded } from "./kit";

// ORBIT launch film — 60 s, 30 fps. Renders 9:16 (TikTok) or 16:9 (X) from the same scenes.
export const LAUNCH_FRAMES = 1800;
const s = (sec: number) => Math.round(sec * 30);
const useLand = () => {
  const { width, height } = useVideoConfig();
  return width > height;
};

/* ---------- sound design (no music) ---------- */
const SFX: { at: number; name: string; vol: number; loop?: number }[] = [
  { at: 0, name: "drone", vol: 0.35, loop: s(12) },
  { at: s(1), name: "tick", vol: 0.5 },
  { at: s(4), name: "whoosh", vol: 0.5 },
  { at: s(8.2), name: "glitch", vol: 0.45 },
  { at: s(10.3), name: "bassdrop", vol: 0.7 },
  { at: s(12), name: "whoosh_heavy", vol: 0.55 },
  { at: s(15.5), name: "riser", vol: 0.55 },
  { at: s(16.5), name: "impact", vol: 0.8 },
  { at: s(20), name: "whoosh_heavy", vol: 0.5 },
  { at: s(21.6), name: "shutter", vol: 0.4 },
  ...[0, 1, 2, 3, 4].flatMap((i) => [
    { at: s(24) + i * s(4), name: "whoosh", vol: 0.5 },
    { at: s(24.6) + i * s(4), name: "pop", vol: 0.45 },
  ]),
  ...[0, 1, 2, 3].map((i) => ({ at: s(44) + i * 8, name: "tick", vol: 0.6 })),
  { at: s(49), name: "click", vol: 0.9 },
  { at: s(50), name: "click", vol: 0.9 },
  { at: s(51), name: "riser", vol: 0.7 },
  { at: s(51), name: "click", vol: 0.9 },
  { at: s(52), name: "boom", vol: 0.9 },
  { at: s(54.4), name: "sparkle", vol: 0.5 },
  { at: s(55.5), name: "ding", vol: 0.4 },
];
const Sound: React.FC = () => (
  <>
    {SFX.map((e, i) => (
      <Sequence key={i} from={e.at} durationInFrames={e.loop ?? s(3)} layout="none">
        <Audio src={staticFile(`sfx/${e.name}.wav`)} volume={e.vol} loop={!!e.loop} />
      </Sequence>
    ))}
  </>
);

/* ---------- scene 1–3: the problem ---------- */
const Beat: React.FC<{ lines: string[]; from: number; to: number; size?: number; color?: string }> = ({ lines, from, to, size = 70, color }) => {
  const frame = useCurrentFrame();
  const o = fade(frame, from, from + 12, to - 12, to);
  const track = interpolate(frame, [from, to], [0.42, 0.3]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o, padding: "0 70px" }}>
      {lines.map((l, i) => (
        <Wide key={i} size={size} track={track} color={color} style={{ opacity: ramp(frame, from + i * 8, from + i * 8 + 14), textShadow: "0 0 24px #000, 0 0 48px #000, 0 0 80px #000" }}>
          {l}
        </Wide>
      ))}
    </AbsoluteFill>
  );
};

const PAIRS = (() => {
  const r = seeded(5);
  const syl = ["MO", "ON", "PE", "PE", "DO", "GE", "WIF", "CAT", "BON", "K", "SOL", "AI", "JEN", "SEN", "FRO", "G", "MAX", "GIGA", "NEO", "ZEN", "TRU", "MP", "BRR", "LUNA", "RIZZ"];
  return Array.from({ length: 70 }, () => {
    const n = syl[Math.floor(r() * syl.length)] + syl[Math.floor(r() * syl.length)];
    return { n, mc: Math.round(2 + r() * 90), chg: Math.round((r() * 2 - 1) * 300), age: Math.floor(r() * 59) + 1 };
  });
})();

const Ticker: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const land = useLand();
  const o = fade(frame, from, from + 15, to - 15, to) * 0.3;
  const y = (frame - from) * 9;
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: land ? 420 : 90, right: land ? 420 : 90, top: -y + (land ? 120 : 300) }}>
        {PAIRS.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 30, color: C.faint, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: C.ink2 }}>{p.n}/SOL</span>
            <span>{p.age}m</span>
            <span>${p.mc}K</span>
            <span style={{ color: p.chg >= 0 ? C.up : C.down }}>{p.chg >= 0 ? "+" : ""}{p.chg}%</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const RugLine: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const o = fade(frame, from, from + 10, to - 10, to);
  const prog = ramp(frame, from, from + 70);
  const r = seeded(9);
  const pts: [number, number][] = [];
  const base = height * 0.65, step = height * 0.0073;
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * (width - 160) + 80;
    const y = i < 44 ? base - i * step - r() * height * 0.02 : base - 44 * step + (i - 44) * step * 5;
    pts.push([x, Math.min(height * 0.78, y)]);
  }
  const n = Math.max(2, Math.round(prog * pts.length));
  const d = pts.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <AbsoluteFill style={{ opacity: o * 0.8 }}>
      <svg width={width} height={height}>
        <path d={d} fill="none" stroke={n > 46 ? C.down : "rgba(255,255,255,0.55)"} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- scene 4–5: the mark ---------- */
const Mark: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const land = useLand();
  const form = ramp(frame, from, from + s(5.5));
  const ring = ramp(frame, from + s(5), from + s(7.5));
  const core = ramp(frame, from + s(4.5), from + s(6.5));
  const word = ramp(frame, from + s(8), from + s(10));
  const scale = interpolate(frame - from, [0, to - from], [0.92, 1.04]);
  const o = fade(frame, from, from + 6, to - 15, to);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o }}>
      <div style={{ transform: `scale(${scale})`, marginTop: land ? -230 : -120 }}>
        <Galaxy size={land ? 700 : 1000} form={form} ring={ring} core={core} />
      </div>
      <div style={{ position: "absolute", top: land ? 690 : 1240, width: "100%", opacity: word }}>
        <Wide size={land ? 120 : 150} track={interpolate(word, [0, 1], [0.7, 0.42])}>Orbit</Wide>
        <Label size={land ? 26 : 30} style={{ textAlign: "center", marginTop: 22, opacity: ramp(frame, from + s(9.5), from + s(11)) }}>
          Solana coin intelligence
        </Label>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- scene 6: features with real app screens ---------- */
const FEATURES: { title: string; sub: string; src: string; stat: string; scroll: [number, number] }[] = [
  { title: "See every new pair", sub: "Trending · new · volume · live", src: "orbit/pairs.png", stat: "200 PAIRS / LIST", scroll: [0, 420] },
  { title: "Score the risk", sub: "0–100 safety score in seconds", src: "orbit/report.png", stat: "MINT · FREEZE · HOLDERS · DEV", scroll: [0, 140] },
  { title: "Follow the wallets", sub: "What they buy, sell & earn", src: "orbit/wallet.png", stat: "PNL · WIN RATE · LABELS", scroll: [580, 1250] },
  { title: "Read the chart", sub: "High, low & the volume zone", src: "orbit/chart.png", stat: "5M — 1D", scroll: [0, 200] },
  { title: "Practise without risk", sub: "Demo trade with 10 fake SOL", src: "orbit/demo.png", stat: "REAL PRICES · NO RISK", scroll: [560, 980] },
];
const Feature: React.FC<{ i: number; from: number; len: number }> = ({ i, from, len }) => {
  const frame = useCurrentFrame();
  const land = useLand();
  const f = FEATURES[i];
  const o = fade(frame, from, from + 10, from + len - 10, from + len);
  const rise = interpolate(ramp(frame, from, from + 22), [0, 1], [120, 0]);
  const pw = land ? 430 : 560;
  const k = pw / 560; // scroll values are tuned for the 560 px phone
  const scroll = interpolate(frame, [from + 8, from + len], [f.scroll[0] * k, f.scroll[1] * k], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const align = land ? ("left" as const) : ("center" as const);
  const step = (
    <Label size={24} color={C.gold} style={{ textAlign: align }}>
      {String(i + 1).padStart(2, "0")} / 05
    </Label>
  );
  const title = (
    <Wide size={land ? 76 : 64} weight={500} track={0.16} style={{ marginTop: 14, textAlign: align, ...(land ? { paddingLeft: 0 } : {}) }}>
      {f.title}
    </Wide>
  );
  const sub = <Label size={28} style={{ textAlign: align, marginTop: 16 }}>{f.sub}</Label>;
  const stat = (
    <Mono size={24} color={C.ink} style={{ textAlign: align, letterSpacing: "0.2em", opacity: ramp(frame, from + 18, from + 32) }}>
      {f.stat}
    </Mono>
  );
  const phone = <Phone src={f.src} width={pw} scroll={scroll} />;
  if (land)
    return (
      <AbsoluteFill style={{ opacity: o }}>
        <div style={{ position: "absolute", left: 180, top: 0, bottom: 0, width: 900, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {step}
          {title}
          {sub}
          <div style={{ marginTop: 60 }}>{stat}</div>
        </div>
        <div style={{ position: "absolute", right: 330, top: 95, transform: `translateY(${rise}px)` }}>{phone}</div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", top: 260, width: "100%" }}>
        {step}
        {title}
        {sub}
      </div>
      <div style={{ position: "absolute", top: 530, width: "100%", display: "flex", justifyContent: "center", transform: `translateY(${rise}px)` }}>{phone}</div>
      <div style={{ position: "absolute", bottom: 150, width: "100%" }}>{stat}</div>
    </AbsoluteFill>
  );
};

/* ---------- scene 7: telemetry + countdown ---------- */
const Telemetry: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const land = useLand();
  const o = fade(frame, from, from + 10, to - 6, to);
  const rows = [
    { k: "PAIRS SCANNED / LIST", v: Math.round(200 * ramp(frame, from, from + 40)) },
    { k: "NEW PAIRS REFRESH", v: `${Math.round(30 * ramp(frame, from + 8, from + 44))} S` },
    { k: "SAFETY SCORE", v: `0–${Math.round(100 * ramp(frame, from + 16, from + 52))}` },
    { k: "WALLET TX READ", v: Math.round(300 * ramp(frame, from + 24, from + 60)) },
  ];
  return (
    <AbsoluteFill style={{ opacity: o, justifyContent: "center", padding: land ? "0 460px" : "0 110px" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(255,255,255,0.12)", padding: land ? "24px 0" : "34px 0", opacity: ramp(frame, from + i * 8, from + i * 8 + 12) }}>
          <Label size={26}>{r.k}</Label>
          <Mono size={58} color={C.ink}>{r.v}</Mono>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Countdown: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const n = 3 - Math.floor((frame - from) / 30);
  if (frame < from || n < 1) return null;
  const local = (frame - from) % 30;
  const o = interpolate(local, [0, 4, 22, 29], [0, 1, 1, 0]);
  const sc = interpolate(local, [0, 29], [1.12, 0.94]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o }}>
      <Label size={28} color={C.ink2}>T-minus</Label>
      <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 420, color: C.ink, transform: `scale(${sc})`, lineHeight: 1 }}>{n}</div>
    </AbsoluteFill>
  );
};

/* ---------- scene 8: ignition + end card ---------- */
const Finale: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const land = useLand();
  const flash = interpolate(frame, [from, from + 3, from + 24], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [from, from + 60], [1.9, 1], { extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const word = ramp(frame, from + 30, from + 66);
  const cta = ramp(frame, from + 70, from + 100);
  const live = (
    <div style={{ border: `2px solid ${C.ink}`, padding: "22px 54px", fontFamily: F.thin, fontWeight: 500, fontSize: 34, letterSpacing: "0.3em", color: C.ink, display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: C.up, boxShadow: `0 0 18px ${C.up}` }} />
      LIVE NOW
    </div>
  );
  return (
    <AbsoluteFill>
      {land ? (
        <>
          <div style={{ position: "absolute", left: 120, top: 140, transform: `scale(${zoom})` }}>
            <Galaxy size={800} glow={1.3} />
          </div>
          <div style={{ position: "absolute", left: 1000, right: 120, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 26 }}>
            <div style={{ opacity: word }}>
              <Wide size={140} track={0.42} style={{ textAlign: "left", paddingLeft: 0 }}>Orbit</Wide>
              <Label size={28} style={{ marginTop: 20 }}>Solana coin intelligence</Label>
            </div>
            <div style={{ opacity: cta, display: "grid", gap: 24, marginTop: 40, justifyItems: "start" }}>
              {live}
              <Mono size={30} color={C.ink2}>orbitonsol.com</Mono>
            </div>
          </div>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ transform: `scale(${zoom})`, marginTop: -260 }}>
              <Galaxy size={880} glow={1.3} />
            </div>
          </AbsoluteFill>
          <div style={{ position: "absolute", top: 1180, width: "100%", opacity: word }}>
            <Wide size={150} track={0.42}>Orbit</Wide>
            <Label size={30} style={{ textAlign: "center", marginTop: 26 }}>Solana coin intelligence</Label>
          </div>
          <div style={{ position: "absolute", top: 1490, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: cta }}>
            {live}
            <Mono size={30} color={C.ink2}>orbitonsol.com</Mono>
          </div>
        </>
      )}
      <Label size={18} color={C.faint} style={{ position: "absolute", bottom: land ? 60 : 96, width: "100%", textAlign: "center", opacity: cta }}>
        Not financial advice · DYOR
      </Label>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const OrbitLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const land = useLand();
  const starO = ramp(frame, 0, 45);
  const hudO = ramp(frame, s(1), s(2.5)) * (frame > s(52) ? 1 - ramp(frame, s(52), s(57)) : 1);
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Sound />
      <Stars opacity={starO} drift={frame < s(12) ? 0.4 : 0.15} />
      <Sequence from={0} durationInFrames={s(12)} layout="none">
        <Ticker from={s(4)} to={s(8.4)} />
        <RugLine from={s(8)} to={s(12)} />
      </Sequence>
      <Beat lines={["Every minute"]} from={s(1)} to={s(4)} />
      <Beat lines={land ? ["Hundreds of new coins", "are born"] : ["Hundreds of", "new coins", "are born"]} from={s(4)} to={s(8.2)} size={78} />
      <Beat lines={land ? ["Most are built to fall"] : ["Most are", "built to fall"]} from={s(8.2)} to={s(12)} size={78} color={C.ink} />
      <Sequence from={s(12)} durationInFrames={s(12)}>
        <Mark from={0} to={s(12)} />
      </Sequence>
      {FEATURES.map((_, i) => (
        <Feature key={i} i={i} from={s(24) + i * s(4)} len={s(4)} />
      ))}
      <Telemetry from={s(44)} to={s(49)} />
      <Countdown from={s(49)} />
      {frame >= s(52) && <Finale from={s(52)} />}
      <Hud total={LAUNCH_FRAMES} opacity={hudO} />
    </AbsoluteFill>
  );
};
