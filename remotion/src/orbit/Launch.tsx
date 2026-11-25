import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, Galaxy, Hud, Label, Mono, Phone, Stars, Wide, fade, ramp, seeded } from "./kit";

// ORBIT launch film — 60 s, 1080×1920, 30 fps. Aerospace-style: black, thin wide type, telemetry HUD.
export const LAUNCH_FRAMES = 1800;
const s = (sec: number) => Math.round(sec * 30);

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
    const mc = Math.round(2 + r() * 90);
    return { n, mc, chg: Math.round((r() * 2 - 1) * 300), age: Math.floor(r() * 59) + 1 };
  });
})();

const Ticker: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const o = fade(frame, from, from + 15, to - 15, to) * 0.3;
  const y = (frame - from) * 9;
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 90, right: 90, top: -y + 300 }}>
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
  const { width } = useVideoConfig();
  const o = fade(frame, from, from + 10, to - 10, to);
  const prog = ramp(frame, from, from + 70);
  const pts: [number, number][] = [];
  const r = seeded(9);
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * (width - 160) + 80;
    const up = i < 44 ? 1250 - i * 14 - r() * 40 : 1250 - 44 * 14 + (i - 44) * 70;
    pts.push([x, Math.min(1500, up)]);
  }
  const n = Math.max(2, Math.round(prog * pts.length));
  const d = pts.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <AbsoluteFill style={{ opacity: o * 0.8 }}>
      <svg width={width} height={1920}>
        <path d={d} fill="none" stroke={n > 46 ? C.down : "rgba(255,255,255,0.55)"} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- scene 4–5: the mark ---------- */
const Mark: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const form = ramp(frame, from, from + s(5.5));
  const ring = ramp(frame, from + s(5), from + s(7.5));
  const core = ramp(frame, from + s(4.5), from + s(6.5));
  const word = ramp(frame, from + s(8), from + s(10));
  const scale = interpolate(local, [0, to - from], [0.92, 1.04]);
  const o = fade(frame, from, from + 6, to - 15, to);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o }}>
      <div style={{ transform: `scale(${scale})`, marginTop: -120 }}>
        <Galaxy size={1000} form={form} ring={ring} core={core} />
      </div>
      <div style={{ position: "absolute", top: 1240, width: "100%", opacity: word }}>
        <Wide size={150} track={interpolate(word, [0, 1], [0.7, 0.42])}>Orbit</Wide>
        <Label size={30} style={{ textAlign: "center", marginTop: 26, opacity: ramp(frame, from + s(9.5), from + s(11)) }}>
          Solana coin intelligence
        </Label>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- scene 6: features with real app screens ---------- */
const FEATURES = [
  { title: "See every new pair", sub: "Trending · new · volume · live", src: "orbit/pairs.png", stat: "200 PAIRS / LIST" },
  { title: "Score the risk", sub: "0–100 safety score in seconds", src: "orbit/report.png", stat: "MINT · FREEZE · HOLDERS · DEV" },
  { title: "Follow the wallets", sub: "What they buy, sell & earn", src: "orbit/wallet.png", stat: "PNL · WIN RATE · LABELS" },
  { title: "Read the chart", sub: "High, low & the volume zone", src: "orbit/chart.png", stat: "5M — 1D" },
  { title: "Practise without risk", sub: "Demo trade with 10 fake SOL", src: "orbit/demo.png", stat: "REAL PRICES · NO RISK" },
];
const Feature: React.FC<{ i: number; from: number; len: number }> = ({ i, from, len }) => {
  const frame = useCurrentFrame();
  const f = FEATURES[i];
  const o = fade(frame, from, from + 10, from + len - 10, from + len);
  const rise = interpolate(ramp(frame, from, from + 22), [0, 1], [120, 0]);
  const scroll = interpolate(frame, [from, from + len], [0, i === 0 ? 260 : i === 2 ? 420 : 80]);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Label size={24} color={C.gold} style={{ position: "absolute", top: 260, width: "100%", textAlign: "center" }}>
        {String(i + 1).padStart(2, "0")} / 05
      </Label>
      <div style={{ position: "absolute", top: 312, width: "100%" }}>
        <Wide size={64} weight={500} track={0.16}>{f.title}</Wide>
        <Label size={28} style={{ textAlign: "center", marginTop: 16 }}>{f.sub}</Label>
      </div>
      <div style={{ position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center", transform: `translateY(${rise}px)` }}>
        <Phone src={f.src} width={560} scroll={scroll} />
      </div>
      <Mono size={24} color={C.ink} style={{ position: "absolute", bottom: 200, width: "100%", textAlign: "center", letterSpacing: "0.2em", opacity: ramp(frame, from + 18, from + 32) }}>
        {f.stat}
      </Mono>
    </AbsoluteFill>
  );
};

/* ---------- scene 7: telemetry + countdown ---------- */
const Telemetry: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const o = fade(frame, from, from + 10, to - 6, to);
  const rows = [
    { k: "PAIRS SCANNED / LIST", v: Math.round(200 * ramp(frame, from, from + 40)) },
    { k: "NEW PAIRS REFRESH", v: `${Math.round(30 * ramp(frame, from + 8, from + 44))} S` },
    { k: "SAFETY SCORE", v: `0–${Math.round(100 * ramp(frame, from + 16, from + 52))}` },
    { k: "WALLET TX READ", v: Math.round(300 * ramp(frame, from + 24, from + 60)) },
  ];
  return (
    <AbsoluteFill style={{ opacity: o, justifyContent: "center", padding: "0 110px" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "34px 0", opacity: ramp(frame, from + i * 8, from + i * 8 + 12) }}>
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
  const flash = interpolate(frame, [from, from + 3, from + 24], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [from, from + 60], [1.9, 1], { extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const word = ramp(frame, from + 30, from + 66);
  const cta = ramp(frame, from + 70, from + 100);
  return (
    <AbsoluteFill>
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
        <div style={{ border: `2px solid ${C.ink}`, padding: "22px 54px", fontFamily: F.thin, fontWeight: 500, fontSize: 34, letterSpacing: "0.3em", color: C.ink, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: C.up, boxShadow: `0 0 18px ${C.up}` }} />
          LIVE NOW
        </div>
        <Mono size={30} color={C.ink2}>orbit-nu-eight-39.vercel.app</Mono>
      </div>
      <Label size={18} color={C.faint} style={{ position: "absolute", bottom: 96, width: "100%", textAlign: "center", opacity: cta }}>
        Not financial advice · DYOR
      </Label>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const OrbitLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const starO = ramp(frame, 0, 45);
  const hudO = ramp(frame, s(1), s(2.5)) * (frame > s(52) ? 1 - ramp(frame, s(52), s(57)) : 1);
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars opacity={starO} drift={frame < s(12) ? 0.4 : 0.15} />
      <Sequence from={0} durationInFrames={s(12)}>
        <Ticker from={s(4)} to={s(8.4)} />
        <RugLine from={s(8)} to={s(12)} />
      </Sequence>
      <Beat lines={["Every minute"]} from={s(1)} to={s(4)} />
      <Beat lines={["Hundreds of", "new coins", "are born"]} from={s(4)} to={s(8.2)} size={78} />
      <Beat lines={["Most are", "built to fall"]} from={s(8.2)} to={s(12)} size={78} color={C.ink} />
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
