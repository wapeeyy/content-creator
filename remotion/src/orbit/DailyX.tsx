import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide } from "./kit";

// Daily X posts: a 4-coin "ORBIT Reads" board (main post) and one card per coin (replies). 1600×900, no emoji.
export type Read = {
  sym: string;
  tf: string;
  chart: string; // path under public/
  bias: string;
  score: string;
  levels: string[][]; // [label, price, note]
  watch: string[];
  change?: string; // 24h change, e.g. "+1277%"
};
export type DailyProps = { date: string; reads: Read[]; index?: number };

const tone = (b: string) => (b === "Bullish" ? C.up : b === "Bearish" ? C.down : C.gold);
const scoreNum = (s: string) => Math.max(-100, Math.min(100, Number(s.replace("+", "")) || 0));

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars density={0.9} k={width / 1400} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 20% 0%, rgba(140,120,255,0.10), rgba(0,0,0,0) 55%)" }} />
      {children}
    </AbsoluteFill>
  );
};

const Brand: React.FC<{ right: string }> = ({ right }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 112, height: 70, position: "relative" }}>
        <div style={{ position: "absolute", left: -6, top: -25 }}>
          <Galaxy size={120} t={420} glow={1.1} sat={2.5} />
        </div>
      </div>
      <div>
        <Wide size={30} track={0.42} style={{ textAlign: "left", paddingLeft: 0 }}>Orbit</Wide>
        <Label size={13} style={{ marginTop: 4 }}>Solana coin intelligence</Label>
      </div>
    </div>
    <Label size={16} color={C.ink2}>{right}</Label>
  </div>
);

const Footer: React.FC = () => (
  <div style={{ position: "absolute", left: 70, right: 70, bottom: 38, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
    <div style={{ display: "flex", gap: 26, alignItems: "baseline" }}>
      <Mono size={24} color={C.ink}>orbitonsol.com</Mono>
      <Label size={15} color={C.gold}>Pro free for 7 days</Label>
    </div>
    <Label size={12} color={C.faint}>Automatic analysis · not financial advice</Label>
  </div>
);

const Meter: React.FC<{ score: string; width: number }> = ({ score, width }) => (
  <div style={{ width }}>
    <div style={{ position: "relative", height: 6, borderRadius: 3, background: "linear-gradient(90deg, rgba(255,107,120,0.85), rgba(243,217,164,0.6), rgba(111,227,168,0.85))" }}>
      <div style={{ position: "absolute", left: `${(scoreNum(score) + 100) / 2}%`, top: -6, width: 4, height: 18, borderRadius: 2, background: "#fff", transform: "translateX(-50%)", boxShadow: "0 0 10px #fff" }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: F.narrow, fontSize: 13, letterSpacing: "0.16em", color: C.faint }}>
      <span>BEARISH</span>
      <span style={{ color: C.ink }}>{score}</span>
      <span>BULLISH</span>
    </div>
  </div>
);

const lvlColor = (k: string) => (k.startsWith("R") ? C.down : k.startsWith("S") ? C.up : k === "Now" ? C.ink : k === "Invalid" ? C.gold : "#ffb84d");

/** One coin: replies under that coin's posts */
export const XReadCard: React.FC<DailyProps> = ({ reads, index = 0, date }) => {
  const r = reads[index];
  const rows = r.levels.filter((l) => l[0] !== "Value").slice(0, 7);
  return (
    <Frame>
      <Brand right={`ORBIT read · ${r.tf.toUpperCase()} · ${date}`} />
      <div style={{ position: "absolute", left: 70, top: 170, width: 470 }}>
        <Label size={16}>Solana · {r.tf}</Label>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: r.sym.length > 7 ? Math.max(52, Math.round(96 * 7 / r.sym.length)) : 96, color: C.ink, letterSpacing: "0.04em", lineHeight: 1.05, marginTop: 8 }}>${r.sym}</div>
        {r.change && <Mono size={20} color={r.change.startsWith("-") ? C.down : C.up}>24h {r.change}</Mono>}
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 54, letterSpacing: "0.14em", textTransform: "uppercase", color: tone(r.bias), marginTop: 22 }}>{r.bias}</div>
        <div style={{ marginTop: 16 }}>
          <Meter score={r.score} width={430} />
        </div>
        <div style={{ marginTop: 30 }}>
          {rows.map((l) => (
            <div key={l[0]} style={{ display: "grid", gridTemplateColumns: "92px 1fr auto", gap: 10, padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: F.mono, fontSize: 19, background: l[0] === "Now" ? "rgba(255,255,255,0.05)" : "transparent" }}>
              <span style={{ color: lvlColor(l[0]), letterSpacing: "0.08em" }}>{l[0] === "Invalid" ? "INVALID" : l[0]}</span>
              <span style={{ color: C.ink }}>{l[1]}</span>
              <span style={{ color: C.faint }}>{l[2]}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 600, right: 70, top: 170 }}>
        <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.16)", background: "#05060a", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
          <Img src={staticFile(r.chart)} style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ marginTop: 26 }}>
          <Label size={14} color={C.gold}>What to watch</Label>
          {r.watch.slice(0, 3).map((w) => (
            <div key={w} style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 21, color: C.ink2, marginTop: 10, lineHeight: 1.3 }}>— {w}</div>
          ))}
        </div>
      </div>
      <Footer />
    </Frame>
  );
};

/** Four coins on one board: the main post of the day */
export const XDailyBoard: React.FC<DailyProps> = ({ reads, date }) => (
  <Frame>
    <Brand right={`Daily ORBIT reads · ${date}`} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 150, bottom: 110, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 22 }}>
      {reads.slice(0, 4).map((r) => (
        <div key={r.sym} style={{ position: "relative", borderRadius: 18, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(5,6,10,0.85)", overflow: "hidden", padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
              <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 36, color: C.ink, letterSpacing: "0.04em" }}>${r.sym}</span>
              <Label size={13}>{r.tf}</Label>
              {r.change && <Mono size={16} color={r.change.startsWith("-") ? C.down : C.up}>{r.change}</Mono>}
            </div>
            <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 24, letterSpacing: "0.16em", textTransform: "uppercase", color: tone(r.bias) }}>
              {r.bias} <span style={{ color: C.ink2, fontSize: 18 }}>{r.score}</span>
            </span>
          </div>
          <div style={{ position: "absolute", left: 22, right: 22, top: 74, bottom: 18, borderRadius: 10, overflow: "hidden" }}>
            <Img src={staticFile(r.chart)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top" }} />
          </div>
        </div>
      ))}
    </div>
    <Footer />
  </Frame>
);
