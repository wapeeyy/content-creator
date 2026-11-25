import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, F, Galaxy, Label, Mono, Stars, Wide } from "./kit";

// ORBIT brand stills: profile photos, X header, landing-page hero, link-preview (OG) image.
// Every layout is sized from the canvas width so it renders sharp at full resolution.

const URL = "orbit-nu-eight-39.vercel.app";

const Space: React.FC<{ children?: React.ReactNode; vignette?: boolean; density?: number }> = ({ children, vignette = true, density = 1 }) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Stars density={density} k={Math.max(1, width / 1400)} />
      {vignette && <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)" }} />}
      {children}
    </AbsoluteFill>
  );
};

/** Square profile photo — mark only, sized to survive a circular crop */
export const BrandAvatar: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <Space density={0.7}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Galaxy size={Math.round(width * 0.94)} t={420} glow={1.3} sat={2.5} />
      </AbsoluteFill>
    </Space>
  );
};

/** Square profile photo — mark + wordmark */
export const BrandAvatarWord: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <Space density={0.7}>
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ marginTop: -width * 0.06 }}>
          <Galaxy size={Math.round(width * 0.9)} t={420} glow={1.25} sat={2.5} />
        </div>
        <div style={{ position: "absolute", top: width * 0.7, width: "100%" }}>
          <Wide size={width * 0.105} track={0.42}>Orbit</Wide>
          <Label size={width * 0.024} style={{ textAlign: "center", marginTop: width * 0.02 }}>Solana coin intelligence</Label>
        </div>
      </AbsoluteFill>
    </Space>
  );
};

/** X / Twitter header (3:1). Bottom-left stays clear for the profile photo. */
export const BrandXHeader: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <Space density={1.3}>
      <div style={{ position: "absolute", right: -width * 0.03, top: (height - height * 1.3) / 2 }}>
        <Galaxy size={Math.round(height * 1.3)} t={420} glow={1.2} sat={-1.3} />
      </div>
      <div style={{ position: "absolute", left: width * 0.2, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Wide size={height * 0.19} track={0.42} style={{ textAlign: "left", paddingLeft: 0 }}>Orbit</Wide>
        <Label size={height * 0.05} style={{ marginTop: height * 0.05 }}>Solana coin intelligence</Label>
        <Mono size={height * 0.042} color={C.faint} style={{ marginTop: height * 0.06 }}>{URL}</Mono>
      </div>
    </Space>
  );
};

/** Landing-page hero, 16:9. `text` = with wordmark; without = clean background for your own text. */
const Hero: React.FC<{ text: boolean }> = ({ text }) => {
  const { width, height } = useVideoConfig();
  const g = Math.round(height * 0.95);
  return (
    <Space density={2.2}>
      <div style={{ position: "absolute", left: text ? width * 0.01 : (width - g) / 2, top: (height - g) / 2 }}>
        <Galaxy size={g} t={420} glow={1.25} sat={2.5} />
      </div>
      {text && (
        <div style={{ position: "absolute", left: width * 0.56, right: width * 0.05, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Label size={height * 0.022} color={C.gold}>Live on Solana</Label>
          <Wide size={height * 0.14} track={0.42} style={{ textAlign: "left", paddingLeft: 0, marginTop: height * 0.02 }}>Orbit</Wide>
          <Label size={height * 0.026} style={{ marginTop: height * 0.025 }}>Solana coin intelligence</Label>
          <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: height * 0.03, lineHeight: 1.45, color: C.ink2, marginTop: height * 0.04, maxWidth: width * 0.36 }}>
            Every new pair, risk-scored in seconds. Trace the wallets, read the chart, practise with fake SOL.
          </div>
          <div style={{ display: "flex", gap: height * 0.02, marginTop: height * 0.05 }}>
            <div style={{ border: `${Math.max(2, height / 900)}px solid ${C.ink}`, padding: `${height * 0.016}px ${height * 0.032}px`, fontFamily: F.thin, fontWeight: 500, fontSize: height * 0.018, letterSpacing: "0.26em", color: C.ink }}>DISCOVER COINS</div>
            <div style={{ border: `${Math.max(2, height / 900)}px solid rgba(255,255,255,0.3)`, padding: `${height * 0.016}px ${height * 0.032}px`, fontFamily: F.thin, fontWeight: 500, fontSize: height * 0.018, letterSpacing: "0.26em", color: C.ink2 }}>SCAN A CA</div>
          </div>
        </div>
      )}
    </Space>
  );
};
export const BrandHero: React.FC = () => <Hero text />;
export const BrandHeroClean: React.FC = () => <Hero text={false} />;

/** Link-preview image (Open Graph 1.91:1) shown when the site is shared on WhatsApp / X */
export const BrandOG: React.FC = () => {
  const { width, height } = useVideoConfig();
  const g = Math.round(height * 0.98);
  return (
    <Space density={1.4}>
      <div style={{ position: "absolute", left: -width * 0.03, top: (height - g) / 2 }}>
        <Galaxy size={g} t={420} glow={1.25} sat={2.5} />
      </div>
      <div style={{ position: "absolute", left: width * 0.52, right: width * 0.04, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Wide size={height * 0.16} track={0.42} style={{ textAlign: "left", paddingLeft: 0 }}>Orbit</Wide>
        <Label size={height * 0.036} style={{ marginTop: height * 0.03 }}>Solana coin intelligence</Label>
        <div style={{ fontFamily: F.thin, fontWeight: 300, fontSize: height * 0.042, lineHeight: 1.4, color: C.ink2, marginTop: height * 0.05 }}>
          New pairs · risk score · wallet tracing · demo trading
        </div>
        <Mono size={height * 0.034} color={C.faint} style={{ marginTop: height * 0.06 }}>{URL}</Mono>
      </div>
    </Space>
  );
};
