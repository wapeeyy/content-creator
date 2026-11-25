import React from "react";
import { AbsoluteFill, Audio, interpolate, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, Galaxy, Label, Mono, Phone, Stars, Wide, fade, ramp } from "./kit";

// ORBIT tutorial — install + how to use. 1080×1920, 30 fps, captions only (no voice-over).
const s = (sec: number) => Math.round(sec * 30);

// click sounds for every tap (scene start + tap offset), whoosh at each scene
const TAPS: Record<number, number[]> = {
  1: [1.2, 4, 5.2],
  2: [1.0, 3.0, 5.0],
  3: [2, 4.5, 7],
  8: [4],
};
const TutSound: React.FC = () => (
  <>
    {SCENES.map((sc, i) => (
      <React.Fragment key={i}>
        <Sequence from={sc.at} durationInFrames={s(1)} layout="none">
          <Audio src={staticFile(i === 0 || i === SCENES.length - 1 ? "sfx/whoosh_heavy.wav" : "sfx/whoosh.wav")} volume={0.45} />
        </Sequence>
        {(TAPS[i] ?? []).map((t) => (
          <Sequence key={t} from={sc.at + s(t)} durationInFrames={s(0.5)} layout="none">
            <Audio src={staticFile("sfx/click.wav")} volume={0.8} />
          </Sequence>
        ))}
      </React.Fragment>
    ))}
    <Sequence from={SCENES[SCENES.length - 1].at + s(0.6)} durationInFrames={s(1.2)} layout="none">
      <Audio src={staticFile("sfx/sparkle.wav")} volume={0.4} />
    </Sequence>
  </>
);

type Scene = { at: number; len: number; step: string; title: string; text: string; render: (local: number) => React.ReactNode };

/* ---------- tap indicator ---------- */
const Tap: React.FC<{ x: number; y: number; at: number; local: number }> = ({ x, y, at, local }) => {
  const t = local - at;
  if (t < 0 || t > 26) return null;
  const r = interpolate(t, [0, 26], [20, 70]);
  const o = interpolate(t, [0, 6, 26], [0, 1, 0]);
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: "4px solid #fff", opacity: o, boxShadow: "0 0 30px rgba(255,255,255,0.6)" }} />
  );
};

/* ---------- drawn iPhone Safari share flow ---------- */
const SafariMock: React.FC<{ local: number }> = ({ local }) => {
  const sheet = ramp(local, s(2), s(2.6));
  const added = local > s(5.2);
  const home = ramp(local, s(6.4), s(7));
  return (
    <div style={{ width: 620, height: 1270, borderRadius: 70, border: "2px solid rgba(255,255,255,0.28)", background: "#0b0b0d", padding: 16, position: "relative" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 56, overflow: "hidden", position: "relative", background: "#000" }}>
        <Img src={staticFile("orbit/discover.png")} style={{ width: "100%", opacity: 1 - home }} />
        {/* Safari bottom bar */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "rgba(28,28,30,0.96)", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 16, opacity: 1 - home }}>
          <div style={{ width: "86%", height: 50, borderRadius: 14, background: "#3a3a3c", display: "grid", placeItems: "center", fontFamily: "system-ui", fontSize: 22, color: "#ddd" }}>orbit-nu-eight-39.vercel.app</div>
          <div style={{ display: "flex", justifyContent: "space-around", width: "86%", fontSize: 34, color: "#0a84ff" }}>
            <span>‹</span><span>›</span>
            <span style={{ fontSize: 30, border: "3px solid #0a84ff", borderRadius: 6, width: 34, height: 34, display: "grid", placeItems: "center", lineHeight: 1 }}>↑</span>
            <span>□</span>
          </div>
        </div>
        {/* share sheet */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 640, background: "#1c1c1e", borderRadius: "28px 28px 0 0", transform: `translateY(${(1 - sheet) * 660}px)`, padding: 28, fontFamily: "system-ui", color: "#fff", opacity: 1 - home }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 26 }}>
            <Img src={staticFile("orbit/icon.png")} style={{ width: 64, height: 64, borderRadius: 14 }} />
            <div style={{ fontSize: 24 }}>ORBIT<br /><span style={{ color: "#8e8e93", fontSize: 19 }}>orbit-nu-eight-39.vercel.app</span></div>
          </div>
          {["Copy", "Add to Reading List", "Add to Home Screen", "Find on Page"].map((t, i) => (
            <div key={t} style={{ padding: "22px 18px", background: i === 2 && local > s(4) ? "#3a3a3c" : "#2c2c2e", borderRadius: i === 0 ? "14px 14px 0 0" : i === 3 ? "0 0 14px 14px" : 0, borderTop: i ? "1px solid #3a3a3c" : 0, fontSize: 26, display: "flex", justifyContent: "space-between" }}>
              {t}
              <span style={{ color: "#8e8e93" }}>{i === 2 ? "⊞" : ""}</span>
            </div>
          ))}
          {added && <div style={{ position: "absolute", top: 24, right: 30, color: "#0a84ff", fontSize: 26, fontWeight: 600 }}>Add</div>}
        </div>
        {/* home screen */}
        <div style={{ position: "absolute", inset: 0, opacity: home, background: "linear-gradient(160deg,#1b2340,#05060a)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", alignContent: "start", gap: 30, padding: "120px 40px" }}>
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} style={{ display: "grid", justifyItems: "center", gap: 8 }}>
              {i === 10 ? (
                <Img src={staticFile("orbit/icon.png")} style={{ width: 104, height: 104, borderRadius: 24, transform: `scale(${1 + 0.15 * Math.sin(local * 0.2) * home})`, boxShadow: "0 0 30px rgba(140,120,255,0.6)" }} />
              ) : (
                <div style={{ width: 104, height: 104, borderRadius: 24, background: "rgba(255,255,255,0.12)" }} />
              )}
              <span style={{ fontFamily: "system-ui", fontSize: 18, color: "#fff" }}>{i === 10 ? "ORBIT" : ""}</span>
            </div>
          ))}
        </div>
      </div>
      <Tap x={385} y={1205} at={s(1.2)} local={local} />
      <Tap x={300} y={980} at={s(4)} local={local} />
      <Tap x={555} y={680} at={s(5.2)} local={local} />
    </div>
  );
};

/* ---------- drawn Android Chrome install ---------- */
const ChromeMock: React.FC<{ local: number }> = ({ local }) => {
  const menu = ramp(local, s(1.6), s(2.1));
  const dlg = ramp(local, s(3.6), s(4.1));
  return (
    <div style={{ width: 620, height: 1270, borderRadius: 50, border: "2px solid rgba(255,255,255,0.28)", background: "#0b0b0d", padding: 16 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", position: "relative", background: "#000" }}>
        <div style={{ height: 92, background: "#202124", display: "flex", alignItems: "center", gap: 14, padding: "0 20px", fontFamily: "system-ui" }}>
          <div style={{ flex: 1, height: 54, borderRadius: 27, background: "#303134", color: "#e8eaed", fontSize: 22, display: "flex", alignItems: "center", paddingLeft: 22 }}>orbit-nu-eight-39.vercel.app</div>
          <span style={{ color: "#e8eaed", fontSize: 36 }}>⋮</span>
        </div>
        <Img src={staticFile("orbit/discover.png")} style={{ width: "100%" }} />
        <div style={{ position: "absolute", top: 80, right: 14, width: 330, background: "#303134", borderRadius: 10, opacity: menu, transform: `scale(${0.9 + 0.1 * menu})`, transformOrigin: "top right", fontFamily: "system-ui", color: "#e8eaed", fontSize: 24, padding: "8px 0" }}>
          {["New tab", "Bookmarks", "Install app", "Settings"].map((t) => (
            <div key={t} style={{ padding: "18px 24px", background: t === "Install app" && local > s(3) ? "#44474a" : "transparent" }}>{t}</div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.55 * dlg})` }} />
        <div style={{ position: "absolute", left: 40, right: 40, top: 480, background: "#303134", borderRadius: 24, padding: 32, opacity: dlg, fontFamily: "system-ui", color: "#e8eaed" }}>
          <div style={{ fontSize: 30, marginBottom: 20 }}>Install app?</div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 30 }}>
            <Img src={staticFile("orbit/icon.png")} style={{ width: 70, height: 70, borderRadius: 16 }} />
            <span style={{ fontSize: 24 }}>ORBIT<br /><span style={{ color: "#9aa0a6", fontSize: 19 }}>orbit-nu-eight-39.vercel.app</span></span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, fontSize: 24, color: "#8ab4f8" }}><span>Cancel</span><span style={{ fontWeight: 600 }}>Install</span></div>
        </div>
      </div>
      <Tap x={575} y={64} at={s(1.0)} local={local} />
      <Tap x={470} y={250} at={s(3.0)} local={local} />
      <Tap x={500} y={760} at={s(5.0)} local={local} />
    </div>
  );
};

/* ---------- app screenshot with highlight taps ---------- */
const AppShot: React.FC<{ src: string; local: number; scroll?: [number, number]; len: number; taps?: { x: number; y: number; at: number }[] }> = ({ src, local, scroll = [0, 0], len, taps = [] }) => (
  <div style={{ position: "relative" }}>
    <Phone src={src} width={620} scroll={interpolate(local, [s(1), len - s(1)], scroll, { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {taps.map((t, i) => (
      <Tap key={i} x={t.x} y={t.y} at={t.at} local={local} />
    ))}
  </div>
);

const SCENES: Scene[] = [
  { at: 0, len: s(4), step: "", title: "How to use ORBIT", text: "Install it on your phone, then find, check and practise trading Solana coins.", render: () => null },
  { at: s(4), len: s(8.5), step: "01 · Install — iPhone", title: "Add to Home Screen", text: "Open the link in Safari → tap Share → Add to Home Screen → Add.", render: (l) => <SafariMock local={l} /> },
  { at: s(12.5), len: s(7), step: "02 · Install — Android", title: "Install app", text: "Open the link in Chrome → ⋮ menu → Install app → Install.", render: (l) => <ChromeMock local={l} /> },
  { at: s(19.5), len: s(9), step: "03 · Discover", title: "Find coins", text: "All pairs shows every trending & new Solana pair. Use Filters, then tap a coin.", render: (l) => <AppShot src="orbit/pairs.png" local={l} len={s(9)} scroll={[0, 300]} taps={[{ x: 330, y: 70, at: s(2) }, { x: 120, y: 330, at: s(4.5) }, { x: 300, y: 560, at: s(7) }]} /> },
  { at: s(28.5), len: s(8), step: "04 · ORBIT Report", title: "Check the risk", text: "A 0–100 safety score. Read every red and gold line before you buy.", render: (l) => <AppShot src="orbit/report.png" local={l} len={s(8)} /> },
  { at: s(36.5), len: s(7), step: "05 · Chart", title: "Read the chart", text: "High, low and the volume zone — where most people bought and sold.", render: (l) => <AppShot src="orbit/chart.png" local={l} len={s(7)} scroll={[0, 220]} /> },
  { at: s(43.5), len: s(8), step: "06 · Wallet", title: "Trace any wallet", text: "Tap a top holder to see what it buys, sells and how much it made.", render: (l) => <AppShot src="orbit/wallet.png" local={l} len={s(8)} scroll={[640, 1380]} /> },
  { at: s(51.5), len: s(7), step: "07 · Demo", title: "Practise first", text: "Trade with 10 fake SOL at real prices. No real money at risk.", render: (l) => <AppShot src="orbit/demo.png" local={l} len={s(7)} scroll={[620, 1080]} /> },
  { at: s(58.5), len: s(8.5), step: "08 · Pro", title: "Unlock everything", text: "Subscribe tab → Open wallet & pay with Phantom or Solflare. Pro turns on by itself.", render: (l) => <AppShot src="orbit/pay.png" local={l} len={s(8.5)} taps={[{ x: 310, y: 640, at: s(4) }]} /> },
  { at: s(67), len: s(5), step: "", title: "", text: "", render: () => null },
];
export const TUTORIAL_FRAMES = s(72);

const Caption: React.FC<{ sc: Scene; frame: number; land: boolean }> = ({ sc, frame, land }) => {
  const o = fade(frame, sc.at, sc.at + 10, sc.at + sc.len - 8, sc.at + sc.len);
  const align = land ? ("left" as const) : ("center" as const);
  return (
    <div
      style={
        land
          ? { position: "absolute", left: 160, width: 860, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", opacity: o, textAlign: align }
          : { position: "absolute", top: 150, left: 70, right: 70, opacity: o, textAlign: align }
      }
    >
      <Label size={26} color={C.gold} style={{ textAlign: align }}>{sc.step}</Label>
      <Wide size={land ? 76 : 66} weight={500} track={0.12} style={{ marginTop: 14, textAlign: align, ...(land ? { paddingLeft: 0 } : {}) }}>{sc.title}</Wide>
      <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: land ? 40 : 36, lineHeight: 1.35, color: C.ink2, marginTop: 18 }}>{sc.text}</div>
    </div>
  );
};

export const OrbitTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const land = width > height;
  const intro = SCENES[0];
  const outro = SCENES[SCENES.length - 1];
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <TutSound />
      <Stars opacity={0.8} drift={0.12} />
      {/* intro */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fade(frame, 0, 10, intro.len - 10, intro.len) }}>
        <div style={land ? { position: "absolute", left: 140, top: 140 } : { marginTop: -160 }}><Galaxy size={land ? 800 : 760} /></div>
        <div style={land ? { position: "absolute", left: 1000, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } : { position: "absolute", top: 1180, width: "100%" }}>
          <Label size={28} style={{ textAlign: land ? "left" : "center" }}>Tutorial</Label>
          <Wide size={84} track={0.3} style={{ marginTop: 18, ...(land ? { textAlign: "left", paddingLeft: 0 } : {}) }}>How to use</Wide>
          <Wide size={140} track={0.42} style={land ? { textAlign: "left", paddingLeft: 0 } : {}}>Orbit</Wide>
        </div>
      </AbsoluteFill>
      {SCENES.slice(1, -1).map((sc) => {
        const local = frame - sc.at;
        if (local < 0 || local > sc.len) return null;
        const o = fade(frame, sc.at, sc.at + 10, sc.at + sc.len - 8, sc.at + sc.len);
        const rise = interpolate(ramp(frame, sc.at, sc.at + 18), [0, 1], [80, 0]);
        return (
          <React.Fragment key={sc.at}>
            <Caption sc={sc} frame={frame} land={land} />
            <div
              style={
                land
                  ? { position: "absolute", right: 200, top: 70, opacity: o, transform: `translateY(${rise}px) scale(0.73)`, transformOrigin: "top right" }
                  : { position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${rise}px)` }
              }
            >
              {sc.render(local)}
            </div>
          </React.Fragment>
        );
      })}
      {/* outro */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fade(frame, outro.at, outro.at + 12, outro.at + outro.len - 2, outro.at + outro.len + 30) }}>
        <div style={land ? { position: "absolute", left: 140, top: 140 } : { marginTop: -260 }}><Galaxy size={land ? 800 : 700} /></div>
        <div style={land ? { position: "absolute", left: 1000, top: 0, bottom: 0, display: "grid", alignContent: "center", justifyItems: "start", gap: 26 } : { position: "absolute", top: 1100, width: "100%", display: "grid", justifyItems: "center", gap: 26 }}>
          <Wide size={130} track={0.42} style={land ? { textAlign: "left", paddingLeft: 0 } : {}}>Orbit</Wide>
          <Mono size={32} color={C.ink}>orbit-nu-eight-39.vercel.app</Mono>
          <Label size={24}>Full guide: Subscribe tab → Guide (PDF)</Label>
          <Label size={20} color={C.faint} style={{ marginTop: 30 }}>Not financial advice · DYOR</Label>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
