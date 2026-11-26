import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide, fade, ramp } from "./kit";

// ORBIT update: Telegram alerts + community, and every new Pro / Ultra feature. 9:16, voiced, quiet SFX, no emoji.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const DUR = [2.65, 10.22, 4.57, 3.11, 5.93, 6.95, 5.61]; // public/vo/upd_lines.json
const TL = (() => {
  let at = 0.35;
  return DUR.map((d, i) => {
    const start = at;
    at += d + 0.45 + (i === 0 ? 0.35 : 0);
    return { start, len: at - start };
  });
})();
export const UPDATE_FRAMES = s(TL[TL.length - 1].start + TL[TL.length - 1].len + 1.6);
const TG_BLUE = "#6ab3f3";

// element screenshots captured from the live app (tools/orbit/update_capture.cjs), natural widths
const NAT: Record<string, [number, number]> = {
  "u-rug": [1074, 1269],
  "u-dev": [948, 453],
  "u-ins": [1074, 3108],
  "u-trade": [1074, 639],
  "u-bt": [948, 750],
  "u-watch": [1074, 795],
  "u-fresh": [1074, 1752],
  "u-share": [1600, 900],
  "u-tg": [1074, 1170],
  "u-chart-ansem": [948, 1290],
};

/** A captured card, shown big and readable; tall ones scroll slowly */
const Card: React.FC<{ src: string; l: number; len: number; h?: number; w?: number }> = ({ src, l, len, h = 980, w = 960 }) => {
  const [nw, nh] = NAT[src] ?? [1074, 1000];
  const ratio = nw && nh ? nh / nw : 1;
  const imgH = w * ratio;
  const vis = Math.min(h, imgH || h);
  const scroll = imgH > h ? interpolate(l, [s(0.6), Math.max(s(0.7), len - s(0.6))], [0, imgH - h], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ width: w, height: vis, borderRadius: 30, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.2)", background: "#05060a", boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 80px rgba(140,120,255,0.12)" }}>
      <Img src={staticFile(`orbit/update/${src}.png`)} style={{ position: "absolute", width: w, left: 0, top: -scroll }} />
    </div>
  );
};

/** Split a scene into equal parts showing different cards */
const parts = (srcs: string[], h?: number) => (l: number, len: number) => {
  const k = Math.min(srcs.length - 1, Math.floor(l / (len / srcs.length)));
  const pl = l - (len / srcs.length) * k;
  const o = ramp(pl, 0, 8);
  return (
    <div style={{ opacity: o, transform: `scale(${interpolate(o, [0, 1], [0.97, 1])})` }}>
      <Card src={srcs[k]} l={pl} len={len / srcs.length} h={h} />
    </div>
  );
};

/* ---------- Telegram chat mock ---------- */
const MSGS = [
  { t: 0.9, title: "Whale bought $ANSEM", lines: ["$12,400", "Wallet 7xKp…Qe2M"] },
  { t: 3.2, title: "Community buying $POMPOM", lines: ["64 buys vs 9 sells in 5 min", "4.2x the hour's pace · price +6.1%"] },
  { t: 5.6, title: "Wallets rushing into $JIMMY", lines: ["38 different wallets bought in 5 min"] },
  { t: 7.6, title: "$PUMP broke above $0.002650", lines: ["R1 · now $0.002671"] },
];
const TgChat: React.FC<{ l: number }> = ({ l }) => (
  <div style={{ width: 880, height: 1080, borderRadius: 44, overflow: "hidden", background: "#0e1621", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 90px rgba(106,179,243,0.18)", position: "relative" }}>
    <div style={{ height: 120, background: "#17212b", display: "flex", alignItems: "center", gap: 22, padding: "0 34px" }}>
      <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#000", overflow: "hidden", position: "relative", flex: "none" }}>
        <div style={{ position: "absolute", left: -23, top: -23 }}>
          <Galaxy size={120} t={420} glow={1.1} sat={2.5} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 34, color: "#fff", letterSpacing: "0.06em" }}>ORBIT ALERT</div>
        <div style={{ fontFamily: F.thin, fontSize: 24, color: "#7f91a4" }}>bot</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, display: "grid", gap: 20 }}>
      {MSGS.filter((m) => l >= s(m.t)).map((m) => {
        const o = ramp(l, s(m.t), s(m.t) + 9);
        return (
          <div key={m.title} style={{ opacity: o, transform: `translateY(${(1 - o) * 40}px)`, maxWidth: 700 }}>
            <div style={{ background: "#182533", borderRadius: "26px 26px 26px 8px", padding: "22px 28px", fontFamily: F.thin, color: "#e8eaf2", fontSize: 31, lineHeight: 1.35 }}>
              <b style={{ fontWeight: 600 }}>{m.title}</b>
              {m.lines.map((x) => (
                <div key={x} style={{ color: "#c9cde0" }}>{x}</div>
              ))}
            </div>
            <div style={{ marginTop: 8, background: "rgba(24,37,51,0.8)", borderRadius: 16, padding: "14px 0", textAlign: "center", fontFamily: F.thin, fontWeight: 500, fontSize: 26, color: TG_BLUE }}>Open in ORBIT</div>
          </div>
        );
      })}
    </div>
  </div>
);

type Scene = { step: string; title: string; sub: string; render: (l: number, n: number) => React.ReactNode };
const SCENES: Scene[] = [
  { step: "Ultra · Telegram", title: "Alerts in a minute", sub: "Whales · buying waves · wallet rushes · even with the app closed", render: (l) => <TgChat l={l} /> },
  { step: "New in Pro", title: "Rug & honeypot check", sub: "A real test trade: can you actually sell?", render: (l, n) => <Card src="u-rug" l={l} len={n} h={1000} /> },
  { step: "New in Pro", title: "Dev wallet tracker", sub: "Every dev sell, flagged and marked on the chart", render: parts(["u-dev", "u-chart-ansem"], 1000) },
  { step: "New in Pro", title: "Fresh · Watchlist · Share", sub: "Pairs under an hour old · your coins · one-tap share image", render: parts(["u-fresh", "u-watch", "u-share"], 1000) },
  { step: "New in Ultra", title: "Deeper than anyone", sub: "Holder flow · launch bundles · track record · trade from your wallet", render: parts(["u-ins", "u-bt", "u-trade"], 1000) },
];

const Sound: React.FC = () => (
  <>
    {TL.map((sc, i) => (
      <React.Fragment key={i}>
        <Sequence from={s(sc.start)} durationInFrames={s(DUR[i] + 0.5)} layout="none">
          <Audio src={staticFile(`vo/upd_${String(i).padStart(2, "0")}.wav`)} />
        </Sequence>
        <Sequence from={Math.max(0, s(sc.start - 0.35))} durationInFrames={s(1.2)} layout="none">
          <Audio src={staticFile(i === 0 || i === TL.length - 1 ? "sfx/whoosh_heavy.wav" : "sfx/whoosh.wav")} volume={0.1} />
        </Sequence>
      </React.Fragment>
    ))}
    {MSGS.map((m) => (
      <Sequence key={m.t} from={s(TL[1].start + m.t) - 6} durationInFrames={s(1)} layout="none">
        <Audio src={staticFile("sfx/notif.wav")} volume={0.14} />
      </Sequence>
    ))}
    <Sequence from={s(TL[TL.length - 1].start + 0.2)} durationInFrames={s(2)} layout="none">
      <Audio src={staticFile("sfx/sparkle.wav")} volume={0.12} />
    </Sequence>
  </>
);

export const OrbitUpdate: React.FC = () => {
  const frame = useCurrentFrame();
  const introEnd = s(TL[0].start + TL[0].len);
  const outroAt = s(TL[TL.length - 1].start) - 6;
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Sound />
      <Stars opacity={0.85} drift={0.14} />
      {/* intro */}
      <AbsoluteFill style={{ opacity: fade(frame, 0, 8, introEnd - 10, introEnd), alignItems: "center" }}>
        <div style={{ marginTop: 280, transform: `scale(${interpolate(frame, [0, introEnd], [1.12, 1])})` }}>
          <Galaxy size={720} glow={1.3} />
        </div>
        <div style={{ position: "absolute", top: 1050, width: "100%", textAlign: "center" }}>
          <Label size={30} color={C.gold} style={{ textAlign: "center", opacity: ramp(frame, s(0.2), s(0.7)) }}>Big update</Label>
          <Wide size={120} track={0.42} style={{ marginTop: 22 }}>Orbit</Wide>
          <div style={{ marginTop: 26, opacity: ramp(frame, s(1.1), s(1.6)), display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
            <span style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 40, color: C.ink2, letterSpacing: "0.3em" }}>NOW ON</span>
            <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 46, color: TG_BLUE, letterSpacing: "0.22em" }}>TELEGRAM</span>
          </div>
        </div>
      </AbsoluteFill>

      {SCENES.map((sc, j) => {
        const i = j + 1;
        const a = s(TL[i].start) - 6, len = s(TL[i].len);
        const l = frame - a;
        if (l < 0 || l > len + 6) return null;
        const o = fade(frame, a, a + 10, a + len - 4, a + len + 6);
        const rise = interpolate(ramp(frame, a, a + 18), [0, 1], [80, 0]);
        const ultra = sc.step.includes("Ultra");
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <div style={{ position: "absolute", top: 150, left: 70, right: 70, textAlign: "center" }}>
              <Label size={26} color={i === 1 ? TG_BLUE : ultra ? C.gold : C.ink2} style={{ textAlign: "center" }}>{sc.step}</Label>
              <Wide size={58} weight={500} track={0.1} style={{ marginTop: 14 }}>{sc.title}</Wide>
              <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 32, lineHeight: 1.3, color: C.ink2, marginTop: 14 }}>{sc.sub}</div>
            </div>
            <div style={{ position: "absolute", top: 440, width: "100%", display: "flex", justifyContent: "center", transform: `translateY(${rise}px)` }}>
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
  const flash = interpolate(frame, [from, from + 3, from + 20], [0, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = ramp(frame, from + s(1.4), from + s(2));
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center" }}>
      <div style={{ marginTop: 170 }}>
        <Galaxy size={520} glow={1.3} />
      </div>
      <div style={{ position: "absolute", top: 740, width: "100%", textAlign: "center", display: "grid", justifyItems: "center", gap: 30 }}>
        <Label size={26} color={TG_BLUE}>Join the community</Label>
        <div style={{ fontFamily: F.mono, fontSize: 64, color: C.ink }}>t.me/orbitonsol</div>
        <div style={{ width: 520, height: 1, background: "rgba(255,255,255,0.15)", margin: "10px 0" }} />
        <div style={{ opacity: b, display: "grid", justifyItems: "center", gap: 26 }}>
          <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 92, color: C.ink, lineHeight: 1 }}>
            Pro free <span style={{ color: C.gold }}>7 days</span>
          </div>
          <div style={{ background: "linear-gradient(90deg,#f3d9a4,#fff1cf)", color: "#000", fontFamily: F.thin, fontWeight: 500, fontSize: 34, letterSpacing: "0.32em", padding: "24px 56px 24px 68px" }}>LINK IN BIO</div>
          <Mono size={28} color={C.ink2}>orbitonsol.com</Mono>
          <Label size={18} color={C.faint}>Not financial advice</Label>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
