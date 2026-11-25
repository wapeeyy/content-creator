import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide, fade, ramp } from "./kit";

// ORBIT promo #1 (9:16, voiced): features of the latest app + "7-day free trial, link in bio". No emoji.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const DUR = [3.43, 6.23, 5.14, 5.87, 5.97, 4.18]; // public/vo/promo1_lines.json
const GAP = 0.5;
const TL = (() => {
  let at = 0.35;
  return DUR.map((d, i) => {
    const start = at;
    at += d + GAP + (i === 0 ? 0.3 : 0);
    return { start, len: at - start };
  });
})();
export const PROMO1_FRAMES = s(TL[TL.length - 1].start + TL[TL.length - 1].len + 1.6);

// positions (CSS px, 390-wide iPhone capture) from tools/orbit/promo_capture.cjs → public/orbit/promo-pos.json
const P = { chart: 2714, read: 3168, mtf: 3959, alerts: 4194, whales: 4409 };
const NAT: Record<string, number> = { "orbit/promo-coin.png": 1170, "orbit/wallet.png": 1170, "orbit/demo.png": 1170 };

const Panel: React.FC<{ src: string; from: number; to: number; l: number; len: number; h?: number }> = ({ src, from, to, l, len, h = 960 }) => {
  const W = 980, IMG = 1110;
  const k = IMG / (NAT[src] / 3);
  const y = interpolate(l, [s(0.3), Math.max(s(0.4), len - s(0.6))], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: W, height: h, borderRadius: 34, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.22)", background: "#000", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(140,120,255,0.12)" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", width: IMG, left: (W - IMG) / 2, top: -(y * k) + 24 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: "linear-gradient(rgba(0,0,0,0), #000)" }} />
    </div>
  );
};

type Scene = { step: string; title: string; sub: string; render: (l: number, n: number) => React.ReactNode };
const SCENES: Scene[] = [
  { step: "01 · Pro chart", title: "Every chart, marked", sub: "Structure · support & resistance · volume profile", render: (l, n) => (
      <div style={{ width: 980, borderRadius: 34, overflow: "hidden", border: "1px solid rgba(255,255,255,0.22)", background: "#05060a", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(140,120,255,0.12)" }}>
        <Img src={staticFile("orbit/promo-chart.png")} style={{ width: "100%", display: "block", transform: `scale(${interpolate(l, [0, n], [1, 1.06])})`, transformOrigin: "70% 40%" }} />
      </div>
    ) },
  { step: "02 · ORBIT Read", title: "Bias & key levels", sub: "And exactly what to watch next", render: (l, n) => <Panel src="orbit/promo-coin.png" from={P.read - 10} to={P.read + 330} l={l} len={n} /> },
  {
    step: "03 · Ultra",
    title: "Whales & every timeframe",
    sub: "Big trades pinned · 5m · 1h · 4h · 1D at once",
    render: (l, n) =>
      l < n * 0.5 ? (
        <Panel src="orbit/promo-coin.png" from={P.whales - 10} to={P.whales + 120} l={l} len={n * 0.5} />
      ) : (
        <Panel src="orbit/promo-coin.png" from={P.mtf - 20} to={P.mtf - 20} l={l - n * 0.5} len={n * 0.5} />
      ),
  },
  {
    step: "04 · Trade smarter",
    title: "Alerts · Wallets · Demo",
    sub: "Price alerts · wallet trace · 10 fake SOL",
    render: (l, n) => {
      const t = n / 3;
      return l < t ? (
        <Panel src="orbit/promo-coin.png" from={P.alerts - 20} to={P.alerts - 20} l={l} len={t} />
      ) : l < 2 * t ? (
        <Panel src="orbit/wallet.png" from={640} to={900} l={l - t} len={t} />
      ) : (
        <Panel src="orbit/demo.png" from={580} to={820} l={l - 2 * t} len={t} />
      );
    },
  },
];

const Sound: React.FC = () => (
  <>
    {TL.map((sc, i) => (
      <React.Fragment key={i}>
        <Sequence from={s(sc.start)} durationInFrames={s(DUR[i] + 0.5)} layout="none">
          <Audio src={staticFile(`vo/promo1_${String(i).padStart(2, "0")}.wav`)} />
        </Sequence>
        <Sequence from={Math.max(0, s(sc.start - 0.35))} durationInFrames={s(1.2)} layout="none">
          <Audio src={staticFile(i === 0 || i === TL.length - 1 ? "sfx/whoosh_heavy.wav" : "sfx/whoosh.wav")} volume={0.22} />
        </Sequence>
      </React.Fragment>
    ))}
    <Sequence from={s(TL[TL.length - 1].start + 0.2)} durationInFrames={s(2)} layout="none">
      <Audio src={staticFile("sfx/sparkle.wav")} volume={0.28} />
    </Sequence>
  </>
);

export const OrbitPromo1: React.FC = () => {
  const frame = useCurrentFrame();
  const introEnd = s(TL[0].start + TL[0].len);
  const outroAt = s(TL[TL.length - 1].start) - 6;
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Sound />
      <Stars opacity={0.85} drift={0.14} />
      {/* intro */}
      <AbsoluteFill style={{ opacity: fade(frame, 0, 8, introEnd - 10, introEnd), alignItems: "center" }}>
        <div style={{ marginTop: 300, transform: `scale(${interpolate(frame, [0, introEnd], [1.1, 1])})` }}>
          <Galaxy size={760} glow={1.25} />
        </div>
        <div style={{ position: "absolute", top: 1100, width: "100%", textAlign: "center" }}>
          <Label size={26} color={C.gold} style={{ textAlign: "center", opacity: ramp(frame, s(0.2), s(0.8)) }}>Meet</Label>
          <Wide size={140} track={0.42} style={{ marginTop: 18 }}>Orbit</Wide>
          <Label size={28} style={{ textAlign: "center", marginTop: 40, opacity: ramp(frame, s(1.2), s(1.8)) }}>The smarter way to read Solana coins</Label>
        </div>
      </AbsoluteFill>

      {SCENES.map((sc, j) => {
        const i = j + 1;
        const a = s(TL[i].start) - 6, len = s(TL[i].len);
        const l = frame - a;
        if (l < 0 || l > len + 6) return null;
        const o = fade(frame, a, a + 10, a + len - 4, a + len + 6);
        const rise = interpolate(ramp(frame, a, a + 18), [0, 1], [80, 0]);
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <div style={{ position: "absolute", top: 160, left: 70, right: 70, textAlign: "center" }}>
              <Label size={26} color={i === 3 ? C.gold : C.ink2} style={{ textAlign: "center" }}>{sc.step}</Label>
              <Wide size={60} weight={500} track={0.1} style={{ marginTop: 14 }}>{sc.title}</Wide>
              <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 34, lineHeight: 1.3, color: C.ink2, marginTop: 16 }}>{sc.sub}</div>
            </div>
            <div style={{ position: "absolute", top: 470, width: "100%", display: "flex", justifyContent: "center", transform: `translateY(${rise}px)` }}>
              {sc.render(l, len)}
            </div>
          </AbsoluteFill>
        );
      })}

      {frame >= outroAt && <Outro from={outroAt} />}
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const o = ramp(frame, from, from + 14);
  const flash = interpolate(frame, [from, from + 3, from + 20], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = ramp(frame, from + 6, from + 22);
  const cta = ramp(frame, from + s(1.6), from + s(2.2));
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center" }}>
      <div style={{ marginTop: 200 }}>
        <Galaxy size={560} glow={1.3} />
      </div>
      <div style={{ position: "absolute", top: 800, width: "100%", textAlign: "center" }}>
        <Label size={26} color={C.gold} style={{ textAlign: "center" }}>ORBIT Pro</Label>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 200, lineHeight: 1, color: C.ink, marginTop: 24, transform: `scale(${interpolate(big, [0, 1], [1.15, 1])})`, opacity: big }}>
          7 days
        </div>
        <Wide size={62} track={0.42} style={{ marginTop: 20, color: C.gold }}>Free</Wide>
        <div style={{ opacity: cta, marginTop: 70, display: "grid", justifyItems: "center", gap: 28 }}>
          <div style={{ background: "linear-gradient(90deg,#f3d9a4,#fff1cf)", color: "#000", fontFamily: F.thin, fontWeight: 500, fontSize: 36, letterSpacing: "0.32em", padding: "26px 60px 26px 72px" }}>LINK IN BIO</div>
          <Mono size={30} color={C.ink2}>orbitonsol.com</Mono>
          <Label size={18} color={C.faint}>No payment for the trial · not financial advice</Label>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
