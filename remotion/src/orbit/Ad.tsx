import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide } from "./kit";

// Paid-ad creatives (X Ads): "Pro free for 7 days". 16:9 and 1:1. No emoji, real app chart.
const CHART = "orbit/daily/JIMMY-1h.png";
const POINTS = ["Market structure marked: HH · HL · BOS · CHoCH", "Support, resistance & volume profile", "Bias, key levels and what to watch", "Whale trades and wallet tracing"];

const Points: React.FC<{ size: number; gap: number }> = ({ size, gap }) => (
  <div style={{ display: "grid", gap }}>
    {POINTS.map((p) => (
      <div key={p} style={{ display: "flex", gap: size * 0.7, alignItems: "baseline" }}>
        <span style={{ width: size * 0.38, height: size * 0.38, borderRadius: "50%", border: `1.5px solid ${C.gold}`, flex: "none", transform: "translateY(-2px)" }} />
        <span style={{ fontFamily: F.thin, fontWeight: 500, fontSize: size, color: C.ink, lineHeight: 1.25 }}>{p}</span>
      </div>
    ))}
  </div>
);

const Cta: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: size * 1.2 }}>
    <div style={{ background: "linear-gradient(90deg,#f3d9a4,#fff1cf)", color: "#000", fontFamily: F.thin, fontWeight: 500, fontSize: size, letterSpacing: "0.26em", padding: `${size * 0.85}px ${size * 1.6}px`, borderRadius: 6 }}>
      START FREE TRIAL
    </div>
    <Mono size={size * 1.05} color={C.ink}>orbitonsol.com</Mono>
  </div>
);

const ChartFrame: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.18)", background: "#05060a", boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(140,120,255,0.14)", ...style }}>
    <Img src={staticFile(CHART)} style={{ width: "100%", display: "block" }} />
  </div>
);

export const AdWide: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars density={1} k={width / 1400} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 85% 20%, rgba(243,217,164,0.10), rgba(0,0,0,0) 50%)" }} />
      <div style={{ position: "absolute", right: -120, top: -170, opacity: 0.55 }}>
        <Galaxy size={620} t={420} glow={1.2} sat={2.5} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 150, width: 560 }}>
        <Label size={17} color={C.gold}>ORBIT Pro · free for 7 days</Label>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 64, lineHeight: 1.08, color: C.ink, marginTop: 18 }}>
          Read every Solana chart before you buy.
        </div>
        <div style={{ marginTop: 34 }}>
          <Points size={23} gap={18} />
        </div>
        <div style={{ marginTop: 44 }}>
          <Cta size={18} />
        </div>
      </div>
      <ChartFrame style={{ position: "absolute", left: 680, right: 70, top: 330 }} />
      <div style={{ position: "absolute", left: 680, top: 280, display: "flex", gap: 22, alignItems: "baseline" }}>
        <Wide size={26} track={0.42} style={{ textAlign: "left", paddingLeft: 0 }}>Orbit</Wide>
        <Label size={13}>Solana coin intelligence</Label>
      </div>
      <Label size={12} color={C.faint} style={{ position: "absolute", right: 70, bottom: 34 }}>Analysis tool · not financial advice</Label>
    </AbsoluteFill>
  );
};

export const AdSquare: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars density={1} k={width / 1100} />
      <div style={{ position: "absolute", left: (width - 400) / 2, top: 10, opacity: 0.9 }}>
        <Galaxy size={400} t={420} glow={1.25} sat={2.5} />
      </div>
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center" }}>
        <Label size={17} color={C.gold} style={{ textAlign: "center" }}>ORBIT Pro · free for 7 days</Label>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: 54, lineHeight: 1.1, color: C.ink, marginTop: 14, padding: "0 190px" }}>
          Read every Solana chart before you buy.
        </div>
      </div>
      <ChartFrame style={{ position: "absolute", left: 70, right: 70, top: 530 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 950, display: "flex", justifyContent: "center" }}>
        <Cta size={17} />
      </div>
      <Label size={12} color={C.faint} style={{ position: "absolute", width: "100%", textAlign: "center", bottom: 34 }}>Analysis tool · not financial advice</Label>
    </AbsoluteFill>
  );
};
