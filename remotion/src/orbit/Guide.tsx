import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide, fade, ramp } from "./kit";
import SIZES from "./guide-sizes.json";
import LINES from "../../public/vo/gd_lines.json";

// ORBIT A–Z tutorial of the latest update: ORBIT Verified picks, the trading-app coin page, the live chart,
// Txns, demo on the chart, TP / SL, Telegram whale alerts. 9:16 + 1:1, Michael voice, captions, no emoji.
// Captures: tools/orbit/guide_capture.cjs
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const DUR = (LINES as { dur: number }[]).map((l) => l.dur);
const TEXT = (LINES as { text: string }[]).map((l) => l.text);
const TL = (() => {
  let at = 0.3;
  return DUR.map((d, i) => {
    const start = at;
    at += d + (i === 0 || i === 1 ? 0.55 : 0.4);
    return { start, len: at - start };
  });
})();
export const GUIDE_FRAMES = s(TL[TL.length - 1].start + TL[TL.length - 1].len + 1.2);
const TG_BLUE = "#6ab3f3";
const NAT = SIZES as unknown as Record<string, [number, number]>;

/** A captured card from the live app, readable; tall ones scroll slowly */
const Card: React.FC<{ src: string; l: number; len: number; h?: number; w?: number }> = ({ src, l, len, h = 800, w = 900 }) => {
  const [nw, nh] = NAT[src] ?? [1074, 1000];
  const imgH = (w * nh) / nw;
  const vis = Math.min(h, imgH);
  const scroll = imgH > h ? interpolate(l, [s(0.5), Math.max(s(0.6), len - s(0.5))], [0, imgH - h], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ width: w, height: vis, borderRadius: 30, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.2)", background: "#05060a", boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 80px rgba(140,120,255,0.12)" }}>
      <Img src={staticFile(`orbit/guide/${src}.png`)} style={{ position: "absolute", width: w, left: 0, top: -scroll }} />
    </div>
  );
};
/** full phone screens: shown whole, smaller */
const Screen: React.FC<{ src: string; l: number; len: number }> = (p) => <Card {...p} w={470} h={800} />;

const parts = (items: ((l: number, len: number) => React.ReactNode)[]) => (l: number, len: number) => {
  const k = Math.min(items.length - 1, Math.floor(l / (len / items.length)));
  const pl = l - (len / items.length) * k;
  const o = ramp(pl, 0, 8);
  return <div style={{ opacity: o, transform: `scale(${interpolate(o, [0, 1], [0.97, 1])})` }}>{items[k](pl, len / items.length)}</div>;
};
const card = (src: string, h?: number) => (l: number, len: number) => <Card src={src} l={l} len={len} h={h} />;
const screen = (src: string) => (l: number, len: number) => <Screen src={src} l={l} len={len} />;

/* ---------- big statement (no screenshot) ---------- */
const Steps: React.FC<{ l: number; items: [string, string][]; gold?: boolean }> = ({ l, items, gold }) => (
  <div style={{ width: 900, display: "grid", gap: 34 }}>
    {items.map(([a, b], i) => {
      const o = ramp(l, s(0.4 + i * 1.4), s(0.4 + i * 1.4) + 10);
      return (
        <div key={a} style={{ opacity: o, transform: `translateX(${(1 - o) * 60}px)`, display: "flex", gap: 36, alignItems: "center", padding: "34px 40px", borderRadius: 26, border: `1px solid ${gold && i === items.length - 1 ? "rgba(243,217,164,0.6)" : "rgba(255,255,255,0.16)"}`, background: "rgba(10,11,18,0.85)" }}>
          <div style={{ fontFamily: F.mono, fontSize: 54, color: C.gold, width: 70 }}>{i + 1}</div>
          <div>
            <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 48, color: C.ink }}>{a}</div>
            <div style={{ fontFamily: F.thin, fontSize: 31, color: C.ink2, marginTop: 6 }}>{b}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const Price: React.FC<{ l: number; tier: string; price: string; note: string; gold?: boolean }> = ({ l, tier, price, note, gold }) => {
  const o = ramp(l, 6, 20);
  return (
    <div style={{ opacity: o, transform: `scale(${interpolate(o, [0, 1], [0.94, 1])})`, width: 860, padding: "70px 60px", borderRadius: 34, textAlign: "center", border: `1px solid ${gold ? "rgba(243,217,164,0.55)" : "rgba(255,255,255,0.2)"}`, background: gold ? "linear-gradient(180deg,rgba(243,217,164,0.10),rgba(10,11,18,0.9))" : "rgba(10,11,18,0.88)", boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}>
      <Label size={30} color={gold ? C.gold : C.ink2} style={{ textAlign: "center" }}>{tier}</Label>
      <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 150, color: C.ink, lineHeight: 1.1, marginTop: 20 }}>{price}</div>
      <div style={{ fontFamily: F.thin, fontSize: 36, color: C.ink2 }}>per month</div>
      <div style={{ marginTop: 40, fontFamily: F.thin, fontWeight: 500, fontSize: 38, color: gold ? C.gold : C.up, opacity: ramp(l, s(1.6), s(2.2)) }}>{note}</div>
    </div>
  );
};

/* ---------- Telegram chat mock (the real ORBIT alert texts) ---------- */
type Msg = { t: number; title: string; lines: string[]; ca?: boolean };
const WHALE: Msg[] = [
  { t: 0.4, title: "Whale bought $SPCX  $43K", lines: ["Wallet DmCi…Pv3b · MC $13.80M · Liq $2.39M"] },
  { t: 2.2, title: "SPCXxcqXj6e5dJDVNovHN8744zkbhM2bYudU45BimGb", lines: [], ca: true },
];
const PICKS: Msg[] = [
  { t: 0.5, title: "/picks", lines: [], ca: true },
  { t: 1.8, title: "ORBIT Hold pick: $CATE", lines: ["ORBIT score 75 · Bullish +30 · Up to 30 days", "Entry zone  $0.0160 – $0.0179", "Target  $0.0220 · Stop  $0.0155", "Passed all 8 checks"] },
];

const TgChat: React.FC<{ l: number; msgs: Msg[] }> = ({ l, msgs }) => (
  <div style={{ width: 860, height: 800, borderRadius: 44, overflow: "hidden", background: "#0e1621", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 90px rgba(106,179,243,0.18)", position: "relative" }}>
    <div style={{ height: 112, background: "#17212b", display: "flex", alignItems: "center", gap: 22, padding: "0 34px" }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#000", overflow: "hidden", position: "relative", flex: "none" }}>
        <div style={{ position: "absolute", left: -25, top: -25 }}>
          <Galaxy size={120} t={420} glow={1.1} sat={2.5} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 32, color: "#fff", letterSpacing: "0.06em" }}>ORBIT ALERT</div>
        <div style={{ fontFamily: F.thin, fontSize: 23, color: "#7f91a4" }}>bot</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, display: "grid", gap: 18 }}>
      {msgs.filter((m) => l >= s(m.t)).map((m) => {
        const o = ramp(l, s(m.t), s(m.t) + 9);
        return (
          <div key={m.title} style={{ opacity: o, transform: `translateY(${(1 - o) * 40}px)`, maxWidth: 760 }}>
            <div style={{ background: "#182533", borderRadius: "26px 26px 26px 8px", padding: "20px 26px", fontFamily: m.ca ? F.mono : F.thin, color: m.ca ? "#7fb2e5" : "#e8eaf2", fontSize: m.ca ? 24 : 30, wordBreak: "break-all", lineHeight: 1.38 }}>
              <b style={{ fontWeight: m.ca ? 400 : 600 }}>{m.title}</b>
              {m.lines.map((x) => (
                <div key={x} style={{ color: "#c9cde0" }}>{x}</div>
              ))}
            </div>
            {!m.ca && <div style={{ marginTop: 8, background: "rgba(24,37,51,0.8)", borderRadius: 16, padding: "12px 0", textAlign: "center", fontFamily: F.thin, fontWeight: 500, fontSize: 25, color: TG_BLUE }}>Open in ORBIT</div>}
          </div>
        );
      })}
    </div>
  </div>
);

type Scene = { step: string; title: string; sub: string; tone?: "pro" | "ultra" | "free" | "tg"; render: (l: number, n: number) => React.ReactNode };
// scene i+1 belongs to voice line i+1 (line 0 is the intro)
const SCENES: Scene[] = [
  {
    step: "Step 1",
    title: "Install ORBIT",
    sub: "Free app from the browser · no store needed",
    render: (l) => <Steps l={l} items={[["iPhone · Safari", "orbitonsol.com → Share → Add to Home Screen"], ["Android · Chrome", "orbitonsol.com → menu → Install app"], ["Open from your home screen", "Full screen, like any app"]]} />,
  },
  { step: "Discover", title: "Every Solana pair", sub: "All pairs · ORBIT picks · Scalp & Hold", render: screen("g-discover") },
  { step: "New · ORBIT picks", title: "ORBIT Verified", sub: "Real traders only · failed coins show why", tone: "free", render: parts([card("g-picks-card"), card("g-picks-fail")]) },
  { step: "New · coin page", title: "Like a trading app", sub: "Info · Chart+Txns · Chart · Txns", render: parts([screen("g-chart-clean"), screen("g-both-clean"), screen("g-txns"), screen("g-info")]) },
  { step: "New · chart", title: "Live chart", sub: "Last candle moves every 3 seconds", tone: "free", render: card("g-chart-clean-card") },
  { step: "Chart", title: "1m to 1D · refresh · layers", sub: "Structure, levels, whales, dev, EMA, RSI", render: screen("g-chart-clean") },
  { step: "Chart", title: "DexScreener tab", sub: "The original live chart, every trade", tone: "tg", render: card("g-dex") },
  { step: "New · Txns", title: "Every buy and sell", sub: "Filters · whale and dev tags · tap to trace", tone: "free", render: screen("g-txns") },
  { step: "Info", title: "Every ORBIT check", sub: "Safety check · Report · RugCheck · holders · dev", render: parts([screen("g-info"), card("g-safety")]) },
  { step: "New · demo", title: "Your own balance", sub: "0.1 to 100,000 fake SOL · Reset demo", tone: "pro", render: parts([card("g-demo-reset"), card("g-demo-balance")]) },
  { step: "New · demo", title: "Your own amount", sub: "Quick buttons or type any amount", tone: "pro", render: card("g-demo-buy") },
  { step: "New · demo", title: "Your trades on the chart", sub: "Buys, sells, average entry, break-even", tone: "pro", render: card("g-chart-card") },
  { step: "New · demo", title: "Take-profit & stop-loss", sub: "One tap · the demo sells for you", tone: "pro", render: card("g-demo-pos") },
  { step: "New · demo", title: "Your track record", sub: "Win rate · best and worst trade", tone: "pro", render: card("g-demo-stats") },
  { step: "ORBIT Ultra", title: "Scalp & Hold", sub: "Every check passed · entry, target, stop", tone: "ultra", render: screen("g-signals") },
  { step: "Telegram", title: "Connect in the Pro tab", sub: "Alerts even when the app is closed", tone: "tg", render: card("g-tg-card") },
  { step: "New · Telegram", title: "Whales on all pairs", sub: "On / off · Only ORBIT Verified · whale size", tone: "tg", render: card("g-tg-prefs") },
  { step: "New · Telegram", title: "Alert, then the CA", sub: "Tap the second message to copy", tone: "tg", render: (l) => <TgChat l={l} msgs={WHALE} /> },
  { step: "New · Telegram", title: "Opens inside Telegram", sub: "Signed in · /picks any time", tone: "tg", render: (l) => <TgChat l={l} msgs={PICKS} /> },
];

const toneColor = (t?: Scene["tone"]) => (t === "ultra" ? C.gold : t === "tg" ? TG_BLUE : t === "free" ? C.up : C.ink2);

const Sound: React.FC = () => (
  <>
    {TL.map((sc, i) => (
      <React.Fragment key={i}>
        <Sequence from={s(sc.start)} durationInFrames={s(DUR[i] + 0.5)} layout="none">
          <Audio src={staticFile(`vo/gd_${String(i).padStart(2, "0")}.wav`)} volume={1.15} />
        </Sequence>
        {i > 0 && i < TL.length - 1 && (
          <Sequence from={Math.max(0, s(sc.start - 0.3))} durationInFrames={s(1.2)} layout="none">
            <Audio src={staticFile(i === 1 || i === 20 ? "sfx/whoosh_heavy.wav" : i % 2 ? "sfx/whoosh.wav" : "sfx/swipe.wav")} volume={0.08} />
          </Sequence>
        )}
      </React.Fragment>
    ))}
    {[...WHALE.map((m) => TL[18].start + m.t), ...PICKS.map((m) => TL[19].start + m.t)].map((t) => (
      <Sequence key={t} from={s(t) - 6} durationInFrames={s(1)} layout="none">
        <Audio src={staticFile("sfx/notif.wav")} volume={0.11} />
      </Sequence>
    ))}
    <Sequence from={s(TL[20].start + 0.2)} durationInFrames={s(2)} layout="none">
      <Audio src={staticFile("sfx/sparkle.wav")} volume={0.1} />
    </Sequence>
  </>
);

/** caption: the voice line, short and readable on mute */
const Caption: React.FC<{ text: string; l: number; len: number; sq?: boolean }> = ({ text, l, len, sq }) => (
  <div style={{ position: "absolute", left: sq ? 70 : 80, right: sq ? 70 : 160, top: sq ? 880 : 1290, fontSize: sq ? 31 : 36, opacity: fade(l, 0, 8, len - 8, len), fontFamily: F.thin, fontWeight: 500, lineHeight: 1.35, color: C.ink, textAlign: "center", textShadow: "0 2px 18px rgba(0,0,0,0.9)" }}>
    {text}
  </div>
);

/** sq: 1:1 square (1080x1080) layout of the same video */
export const OrbitGuide: React.FC<{ sq?: boolean }> = ({ sq }) => {
  const frame = useCurrentFrame();
  const introEnd = s(TL[0].start + TL[0].len);
  const outroAt = s(TL[20].start) - 6;
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Sound />
      <Stars opacity={0.85} drift={0.14} />
      {/* hook */}
      <AbsoluteFill style={{ opacity: fade(frame, 0, 2, introEnd - 10, introEnd), alignItems: "center" }}>
        <div style={{ marginTop: sq ? -60 : 230, transform: `scale(${interpolate(frame, [0, introEnd], [1.15, 1]) * (sq ? 0.75 : 1)})` }}>
          <Galaxy size={640} glow={1.3} />
        </div>
        <div style={{ position: "absolute", top: sq ? 610 : 930, left: 90, right: 90, textAlign: "center" }}>
          <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: sq ? 74 : 86, lineHeight: 1.1, color: C.ink }}>
            Everything new in <span style={{ color: C.gold }}>ORBIT</span>, from A to Z.
          </div>
        </div>
      </AbsoluteFill>

      {SCENES.map((sc, j) => {
        const i = j + 1;
        const a = s(TL[i].start) - 6,
          len = s(TL[i].len);
        const l = frame - a;
        if (l < 0 || l > len + 6) return null;
        const o = fade(frame, a, a + 10, a + len - 4, a + len + 6);
        const rise = interpolate(ramp(frame, a, a + 18), [0, 1], [70, 0]);
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <div style={{ position: "absolute", top: sq ? 50 : 160, left: 70, right: 70, textAlign: "center" }}>
              <Label size={26} color={toneColor(sc.tone)} style={{ textAlign: "center" }}>{sc.step}</Label>
              <Wide size={56} weight={500} track={0.1} style={{ marginTop: 12 }}>{sc.title}</Wide>
              <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 31, lineHeight: 1.3, color: C.ink2, marginTop: 12 }}>{sc.sub}</div>
            </div>
            <div style={{ position: "absolute", top: sq ? 240 : 440, height: sq ? 620 : 820, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", transform: `translateY(${rise}px)` }}>
              <div style={{ transform: sq ? "scale(0.74)" : undefined }}>{sc.render(l, len)}</div>
            </div>
            <Caption text={TEXT[i]} l={l} len={len} sq={sq} />
          </AbsoluteFill>
        );
      })}

      {frame >= outroAt && <Outro from={outroAt} sq={sq} />}
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ from: number; sq?: boolean }> = ({ from, sq }) => {
  const frame = useCurrentFrame();
  const o = ramp(frame, from, from + 14);
  const flash = interpolate(frame, [from, from + 3, from + 20], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line = (k: number) => ramp(frame, from + s(0.3 + k * 1.0), from + s(0.3 + k * 1.0) + 10);
  const b = ramp(frame, from + s(4.2), from + s(4.8));
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center" }}>
      <div style={{ marginTop: sq ? -40 : 160, transform: sq ? "scale(0.6)" : undefined }}>
        <Galaxy size={480} glow={1.3} />
      </div>
      <div style={{ position: "absolute", top: sq ? 330 : 700, width: "100%", textAlign: "center", display: "grid", justifyItems: "center", gap: 18, transform: sq ? "scale(0.86)" : undefined, transformOrigin: "top center" }}>
        <Wide size={96} track={0.42}>Orbit</Wide>
        {["Try it free.", "Prove it in demo.", "Then trade with confidence."].map((t, k) => (
          <div key={t} style={{ opacity: line(k), fontFamily: F.thin, fontWeight: 300, fontSize: 58, color: k === 2 ? C.gold : C.ink }}>{t}</div>
        ))}
        <div style={{ opacity: b, display: "grid", justifyItems: "center", gap: 22, marginTop: 26 }}>
          <div style={{ background: "linear-gradient(90deg,#f3d9a4,#fff1cf)", color: "#000", fontFamily: F.thin, fontWeight: 500, fontSize: 34, letterSpacing: "0.32em", padding: "24px 56px 24px 68px" }}>LINK IN BIO</div>
          <Mono size={30} color={C.ink2}>orbitonsol.com</Mono>
          <Label size={18} color={C.faint}>Not financial advice</Label>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const OrbitGuideSquare: React.FC = () => <OrbitGuide sq />;
