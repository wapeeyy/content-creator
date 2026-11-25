import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide, fade, ramp } from "./kit";

// ORBIT Pro / Ultra package: a voiced 9:16 video per plan + a 4:5 package card per plan.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const URL = "orbitonsol.com";
type Tier = "pro" | "ultra";

// voice-over durations (tools/orbit/pkg_vo.py → public/vo/pkg_lines.json)
const DUR: Record<Tier, number[]> = {
  pro: [3.05, 8.45, 5.14, 6.76, 5.91, 5.78],
  ultra: [2.94, 6.44, 6.4, 3.29, 7.42, 6.76],
};
const GAP = 0.55;
function timeline(t: Tier) {
  let at = 0.4;
  return DUR[t].map((d, i) => {
    const start = at;
    at += d + GAP + (i === 0 ? 0.4 : 0);
    return { start, len: at - start };
  });
}
export const pkgFrames = (t: Tier) => {
  const tl = timeline(t);
  const last = tl[tl.length - 1];
  return s(last.start + last.len + 1.4);
};

const ACCENT: Record<Tier, string> = { pro: "#ffffff", ultra: C.gold };
const PRICE: Record<Tier, number> = { pro: 23, ultra: 59 };
const TAG: Record<Tier, string> = { pro: "Read the chart. Avoid the rugs.", ultra: "See what the whales do — first." };

// screenshot positions (CSS px in a 390-wide iPhone capture)
const POS = {
  "pkg-pro": { chart: 211, read: 660, alerts: 1648 },
  "pkg-ultra": { chart: 211, read: 655, mtf: 1534, alerts: 1768, whales: 2089 },
};
const NAT: Record<string, number> = { "orbit/pkg-pro.png": 1170, "orbit/pkg-ultra.png": 1170, "orbit/report.png": 1074, "orbit/wallet.png": 1170, "orbit/demo.png": 1170 };

/** Zoomed, readable crop of an app screenshot that scrolls from `from` to `to` (CSS px) */
const Panel: React.FC<{ src: string; from: number; to: number; l: number; len: number; h?: number }> = ({ src, from, to, l, len, h = 960 }) => {
  const W = 980, IMG = 1110;
  const k = IMG / (NAT[src] / 3); // CSS px -> panel px
  const y = interpolate(l, [s(0.3), Math.max(s(0.4), len - s(0.6))], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: W, height: h, borderRadius: 34, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.22)", background: "#000", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(140,120,255,0.12)" }}>
      <img src={staticFile(src)} style={{ position: "absolute", width: IMG, left: (W - IMG) / 2, top: -(y * k) + 24 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: "linear-gradient(rgba(0,0,0,0), #000)" }} />
    </div>
  );
};
const shot = (src: string, from: number, to: number, l: number, len: number) => <Panel src={"orbit/" + src} from={from} to={to} l={l} len={len} />;

type Scene = { step: string; title: string; sub?: string; render: (l: number, len: number) => React.ReactNode };


const Bullets: React.FC<{ items: string[]; l: number; color: string; soon?: boolean }> = ({ items, l, color, soon }) => (
  <div style={{ display: "grid", gap: 26, width: 860 }}>
    {items.map((t, i) => {
      const o = ramp(l, s(0.4 + i * 1.4), s(0.9 + i * 1.4));
      return (
        <div key={t} style={{ opacity: o, transform: `translateX(${(1 - o) * 60}px)`, display: "flex", alignItems: "center", gap: 26, border: `1px solid ${soon ? "rgba(255,255,255,0.16)" : color}`, borderRadius: 18, padding: "30px 34px", background: "rgba(0,0,0,0.6)" }}>
          <span style={{ fontFamily: F.mono, fontSize: 30, color }}>{soon ? "◌" : "✓"}</span>
          <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 40, color: C.ink, flex: 1, lineHeight: 1.25 }}>{t}</span>
          {soon && <span style={{ fontFamily: F.narrow, fontSize: 22, letterSpacing: "0.2em", color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 99, padding: "6px 14px" }}>SOON</span>}
        </div>
      );
    })}
  </div>
);

const SCENES: Record<Tier, Scene[]> = {
  pro: [
    { step: "", title: "", render: () => null },
    { step: "01 · Pro chart", title: "Structure, marked", sub: "HH · HL · LH · LL · BOS · CHoCH · S/R · Volume profile", render: (l, n) => shot("pkg-pro.png", POS["pkg-pro"].chart - 30, POS["pkg-pro"].chart + 60, l, n) },
    { step: "02 · ORBIT Read", title: "Bias & key levels", sub: "What to watch next — on every timeframe", render: (l, n) => shot("pkg-pro.png", POS["pkg-pro"].read - 10, POS["pkg-pro"].read + 300, l, n) },
    { step: "03 · ORBIT Report", title: "Safety score 0–100", sub: "Dev, insider & fresh wallets flagged", render: (l, n) => shot("report.png", 0, 260, l, n) },
    {
      step: "04 · Trade smarter",
      title: "Trace · Practise · Alert",
      sub: "Wallet trace · 10 fake SOL demo · 5 price alerts",
      render: (l, n) => {
        const third = n / 3;
        return l < third ? (
          <Panel src="orbit/wallet.png" from={640} to={900} l={l} len={third} />
        ) : l < third * 2 ? (
          <Panel src="orbit/demo.png" from={580} to={820} l={l - third} len={third} />
        ) : (
          <Panel src="orbit/pkg-pro.png" from={POS["pkg-pro"].alerts - 20} to={POS["pkg-pro"].alerts - 20} l={l - 2 * third} len={third} />
        );
      },
    },
    { step: "", title: "", render: () => null },
  ],
  ultra: [
    { step: "", title: "", render: () => null },
    {
      step: "01 · Whales",
      title: "Every whale, on the chart",
      sub: "Big buys & sells pinned · tap to trace the wallet",
      render: (l, n) =>
        l < n * 0.5 ? (
          <Panel src="orbit/pkg-ultra.png" from={POS["pkg-ultra"].chart - 30} to={POS["pkg-ultra"].chart - 30} l={l} len={n * 0.5} />
        ) : (
          <Panel src="orbit/pkg-ultra.png" from={POS["pkg-ultra"].whales - 20} to={POS["pkg-ultra"].whales + 140} l={l - n * 0.5} len={n * 0.5} />
        ),
    },
    { step: "02 · Multi-timeframe", title: "5m · 1h · 4h · 1D", sub: "The ORBIT Read for every timeframe, one screen", render: (l, n) => shot("pkg-ultra.png", POS["pkg-ultra"].mtf - 20, POS["pkg-ultra"].mtf - 20, l, n) },
    { step: "03 · Alerts", title: "Unlimited alerts", sub: "+ everything in Pro", render: (l, n) => shot("pkg-ultra.png", POS["pkg-ultra"].alerts - 20, POS["pkg-ultra"].alerts - 20, l, n) },
    {
      step: "04 · Coming next",
      title: "Built for Ultra",
      render: (l) => <Bullets l={l} color={C.gold} soon items={["Smart-money watchlist alerts", "Alerts when the app is closed", "Buy & sell from your own wallet"]} />,
    },
    { step: "", title: "", render: () => null },
  ],
};

const Sound: React.FC<{ t: Tier }> = ({ t }) => {
  const tl = timeline(t);
  return (
    <>
      {tl.map((sc, i) => (
        <React.Fragment key={i}>
          <Sequence from={s(sc.start)} durationInFrames={s(DUR[t][i] + 0.5)} layout="none">
            <Audio src={staticFile(`vo/pkg_${t}_${String(i).padStart(2, "0")}.wav`)} volume={1} />
          </Sequence>
          <Sequence from={Math.max(0, s(sc.start - 0.35))} durationInFrames={s(1.2)} layout="none">
            <Audio src={staticFile(i === 0 || i === tl.length - 1 ? "sfx/whoosh_heavy.wav" : "sfx/whoosh.wav")} volume={0.22} />
          </Sequence>
        </React.Fragment>
      ))}
      <Sequence from={s(tl[tl.length - 1].start + 0.3)} durationInFrames={s(2)} layout="none">
        <Audio src={staticFile("sfx/sparkle.wav")} volume={0.28} />
      </Sequence>
    </>
  );
};

const TierBadge: React.FC<{ t: Tier; size: number }> = ({ t, size }) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: F.thin,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: "0.5em",
      paddingLeft: "0.5em",
      color: t === "ultra" ? "#000" : "#000",
      background: t === "ultra" ? "linear-gradient(90deg,#f3d9a4,#fff1cf,#f3d9a4)" : "#fff",
      borderRadius: size * 0.2,
      padding: `${size * 0.22}px ${size * 0.5}px ${size * 0.22}px ${size * 1}px`,
      boxShadow: t === "ultra" ? "0 0 60px rgba(243,217,164,0.45)" : "0 0 50px rgba(255,255,255,0.25)",
    }}
  >
    {t.toUpperCase()}
  </div>
);

export const PkgVideo: React.FC<{ tier: Tier }> = ({ tier }) => {
  const frame = useCurrentFrame();
  const tl = timeline(tier);
  const sc = SCENES[tier];
  const total = pkgFrames(tier);
  const intro = tl[0], outro = tl[tl.length - 1];
  const introEnd = s(intro.start + intro.len);
  const outroAt = s(outro.start) - 6;
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Sound t={tier} />
      <Stars opacity={0.85} drift={0.14} />
      {/* intro */}
      <AbsoluteFill style={{ opacity: fade(frame, 0, 8, introEnd - 10, introEnd), alignItems: "center" }}>
        <div style={{ marginTop: 300, transform: `scale(${interpolate(frame, [0, introEnd], [1.08, 1])})` }}>
          <Galaxy size={760} glow={tier === "ultra" ? 1.4 : 1.2} />
        </div>
        <div style={{ position: "absolute", top: 1100, width: "100%", textAlign: "center" }}>
          <Wide size={130} track={0.42}>Orbit</Wide>
          <div style={{ marginTop: 40, opacity: ramp(frame, s(0.6), s(1.2)), transform: `scale(${interpolate(ramp(frame, s(0.6), s(1.2)), [0, 1], [1.3, 1])})` }}>
            <TierBadge t={tier} size={64} />
          </div>
          <Label size={30} color={ACCENT[tier]} style={{ textAlign: "center", marginTop: 50, opacity: ramp(frame, s(1.4), s(2)) }}>{TAG[tier]}</Label>
        </div>
      </AbsoluteFill>

      {/* feature scenes */}
      {sc.slice(1, -1).map((scene, j) => {
        const i = j + 1;
        const a = s(tl[i].start) - 6, len = s(tl[i].len);
        const l = frame - a;
        if (l < 0 || l > len + 6) return null;
        const o = fade(frame, a, a + 10, a + len - 4, a + len + 6);
        const rise = interpolate(ramp(frame, a, a + 18), [0, 1], [80, 0]);
        const bullets = tier === "ultra" && i === 4;
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <div style={{ position: "absolute", top: 160, left: 70, right: 70, textAlign: "center" }}>
              <Label size={26} color={tier === "ultra" ? C.gold : C.ink2} style={{ textAlign: "center" }}>{scene.step}</Label>
              <Wide size={62} weight={500} track={0.1} style={{ marginTop: 14 }}>{scene.title}</Wide>
              {scene.sub && <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 34, lineHeight: 1.3, color: C.ink2, marginTop: 16 }}>{scene.sub}</div>}
            </div>
            <div style={{ position: "absolute", top: bullets ? 640 : 470, width: "100%", display: "flex", justifyContent: "center", transform: `translateY(${rise}px)` }}>
              {scene.render(l, len)}
            </div>
          </AbsoluteFill>
        );
      })}

      {/* price card */}
      {frame >= outroAt && <PriceEnd tier={tier} from={outroAt} total={total} />}
    </AbsoluteFill>
  );
};

const PriceEnd: React.FC<{ tier: Tier; from: number; total: number }> = ({ tier, from }) => {
  const frame = useCurrentFrame();
  const o = ramp(frame, from, from + 14);
  const flash = interpolate(frame, [from, from + 3, from + 20], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cta = ramp(frame, from + s(1.4), from + s(2));
  const gold = tier === "ultra";
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center" }}>
      <div style={{ marginTop: 230 }}>
        <Galaxy size={600} glow={1.3} />
      </div>
      <div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center" }}>
        <Wide size={110} track={0.42}>Orbit</Wide>
        <div style={{ marginTop: 34 }}>
          <TierBadge t={tier} size={52} />
        </div>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 170, color: gold ? C.gold : C.ink, marginTop: 40, lineHeight: 1 }}>
          ${PRICE[tier]}
          <span style={{ fontSize: 44, color: C.ink2 }}> / month</span>
        </div>
        <div style={{ opacity: cta, marginTop: 50, display: "grid", justifyItems: "center", gap: 26 }}>
          <div style={{ border: `2px solid ${gold ? C.gold : C.ink}`, padding: "22px 54px", fontFamily: F.thin, fontWeight: 500, fontSize: 34, letterSpacing: "0.3em", color: gold ? C.gold : C.ink }}>
            GET {tier.toUpperCase()}
          </div>
          <Mono size={34} color={C.ink}>{URL}</Mono>
          <Label size={20} color={C.faint}>Pay with USDC or SOL · Not financial advice</Label>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const PkgProVideo: React.FC = () => <PkgVideo tier="pro" />;
export const PkgUltraVideo: React.FC = () => <PkgVideo tier="ultra" />;

/* ---------- package cards (4:5) ---------- */
const CARD: Record<Tier, { items: string[]; soon?: string[] }> = {
  pro: {
    items: [
      "Pro chart: HH/HL, BOS & CHoCH, S/R zones, volume profile, fib",
      "ORBIT Read: bias, key levels, what to watch",
      "ORBIT Report: 0–100 safety score, dev & insiders",
      "Wallet trace: buys, sells, PnL, win rate",
      "Demo trading with 10 fake SOL",
      "All ORBIT picks + 5 price alerts",
    ],
  },
  ultra: {
    items: [
      "Everything in Pro",
      "🐋 Whale trades on the chart — tap to trace",
      "Multi-timeframe Read: 5m · 1h · 4h · 1D",
      "Unlimited price alerts",
      "Private Ultra group + priority support",
    ],
    soon: ["Smart-money watchlist", "Alerts when the app is closed", "Buy & sell from your wallet"],
  },
};

export const PkgCard: React.FC<{ tier: Tier }> = ({ tier }) => {
  const { width } = useVideoConfig();
  const gold = tier === "ultra";
  const acc = gold ? C.gold : C.ink;
  const card = CARD[tier];
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars density={1.1} k={width / 1080} />
      <AbsoluteFill style={{ background: gold ? "radial-gradient(ellipse at 50% 10%, rgba(243,217,164,0.14), rgba(0,0,0,0) 55%)" : "radial-gradient(ellipse at 50% 10%, rgba(140,120,255,0.12), rgba(0,0,0,0) 55%)" }} />
      <div style={{ position: "absolute", top: 40, left: (width - 470) / 2 }}>
        <Galaxy size={470} t={420} glow={1.3} sat={2.5} />
      </div>
      <div style={{ position: "absolute", top: 430, width: "100%", textAlign: "center" }}>
        <Wide size={78} track={0.42}>Orbit</Wide>
        <div style={{ marginTop: 22 }}>
          <TierBadge t={tier} size={38} />
        </div>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 100, color: acc, marginTop: 22, lineHeight: 1 }}>
          ${PRICE[tier]}
          <span style={{ fontSize: 30, color: C.ink2 }}> / month</span>
        </div>
        <Label size={22} color={gold ? C.gold : C.ink2} style={{ textAlign: "center", marginTop: 14 }}>{TAG[tier]}</Label>
      </div>
      <div style={{ position: "absolute", top: gold ? 790 : 810, left: 90, right: 90, display: "grid", gap: 0 }}>
        {card.items.map((t) => (
          <div key={t} style={{ display: "flex", gap: 18, alignItems: "baseline", padding: "13px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontFamily: F.mono, fontSize: 24, color: gold ? C.gold : C.up }}>✓</span>
            <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 27, color: C.ink, lineHeight: 1.25 }}>{t}</span>
          </div>
        ))}
        {card.soon && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
            {card.soon.map((t) => (
              <span key={t} style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 19, color: C.ink2, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 99, padding: "6px 14px" }}>
                ◌ {t} <span style={{ color: C.gold, letterSpacing: "0.14em", fontSize: 15 }}>SOON</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 56, width: "100%", display: "grid", justifyItems: "center", gap: 14 }}>
        <Mono size={30} color={C.ink}>{URL}</Mono>
        <Label size={16} color={C.faint}>Pay with USDC or SOL · Not financial advice</Label>
      </div>
    </AbsoluteFill>
  );
};
export const PkgCardPro: React.FC = () => <PkgCard tier="pro" />;
export const PkgCardUltra: React.FC = () => <PkgCard tier="ultra" />;
