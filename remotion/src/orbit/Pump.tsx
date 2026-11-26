import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide } from "./kit";

// X reply card: a coin pumping right now, and every ORBIT check behind the call (good and bad). No emoji.
export type Check = { k: string; v: string; s: "ok" | "warn" | "bad"; tool: string };
export type PumpProps = {
  sym: string;
  ca: string;
  date: string;
  chart: string;
  headline: string; // e.g. "+30,000% since launch"
  stats: [string, string][];
  bias: string;
  score: number;
  checks: Check[];
};

const col = (s: Check["s"]) => (s === "ok" ? C.up : s === "warn" ? C.gold : C.down);
const mark = (s: Check["s"]) => (s === "ok" ? "PASS" : s === "warn" ? "WATCH" : "RISK");

export const XPump: React.FC<PumpProps> = (p) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars density={0.9} k={width / 1400} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 15% 0%, rgba(111,227,168,0.10), rgba(0,0,0,0) 55%)" }} />
      {/* brand */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 84, height: 52, position: "relative" }}>
            <div style={{ position: "absolute", left: -8, top: -22 }}>
              <Galaxy size={96} t={420} glow={1.1} sat={2.5} />
            </div>
          </div>
          <Wide size={24} track={0.42} style={{ textAlign: "left", paddingLeft: 0 }}>Orbit</Wide>
        </div>
        <Label size={13}>Pumping now · {p.date}</Label>
      </div>
      {/* coin */}
      <div style={{ position: "absolute", left: 60, top: 120, width: 500 }}>
        <Label size={14} color={C.ink2}>Solana · 15m</Label>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 84, color: C.ink, lineHeight: 1, marginTop: 10 }}>${p.sym}</div>
        <div style={{ fontFamily: F.mono, fontSize: 30, color: C.up, marginTop: 10 }}>{p.headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginTop: 24 }}>
          {p.stats.map(([k, v]) => (
            <div key={k}>
              <Label size={11} color={C.faint}>{k}</Label>
              <div style={{ fontFamily: F.mono, fontSize: 22, color: C.ink, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26, display: "flex", alignItems: "baseline", gap: 16 }}>
          <Label size={12}>ORBIT Read</Label>
          <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 34, letterSpacing: "0.18em", color: p.score >= 0 ? C.up : C.down }}>{p.bias.toUpperCase()}</span>
          <span style={{ fontFamily: F.mono, fontSize: 22, color: C.ink2 }}>{p.score > 0 ? "+" : ""}{p.score}</span>
        </div>
      </div>
      {/* chart */}
      <div style={{ position: "absolute", left: 60, top: 560, width: 500, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.16)", background: "#05060a" }}>
        <Img src={staticFile(p.chart)} style={{ width: "100%", display: "block" }} />
      </div>
      {/* checks */}
      <div style={{ position: "absolute", left: 620, right: 60, top: 120 }}>
        <Label size={14} color={C.gold}>What ORBIT checked</Label>
        <div style={{ marginTop: 14, display: "grid", gap: 9 }}>
          {p.checks.map((c) => (
            <div key={c.k} style={{ display: "grid", gridTemplateColumns: "82px 200px 1fr", alignItems: "center", gap: 16, padding: "12px 18px", borderRadius: 12, border: `1px solid ${c.s === "ok" ? "rgba(111,227,168,0.28)" : c.s === "warn" ? "rgba(243,217,164,0.35)" : "rgba(255,107,120,0.4)"}`, background: "rgba(10,11,18,0.85)" }}>
              <span style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: "0.12em", color: col(c.s) }}>{mark(c.s)}</span>
              <div>
                <div style={{ fontFamily: F.thin, fontWeight: 500, fontSize: 20, color: C.ink }}>{c.k}</div>
                <div style={{ fontFamily: F.thin, fontSize: 13, color: C.faint, marginTop: 2, letterSpacing: "0.06em" }}>{c.tool}</div>
              </div>
              <div style={{ fontFamily: F.thin, fontSize: 19, color: C.ink2, lineHeight: 1.3 }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
      {/* footer */}
      <div style={{ position: "absolute", left: 620, right: 60, bottom: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <Mono size={24} color={C.ink}>orbitonsol.com</Mono>
          <Label size={13} color={C.gold}>Pro free for 7 days</Label>
        </div>
        <Label size={10} color={C.faint}>Automatic analysis · not financial advice</Label>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 30, fontFamily: F.mono, fontSize: 13, color: C.faint }}>{p.ca}</div>
    </AbsoluteFill>
  );
};
