import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile } from "remotion";
import P from "./data/project.json";
import { anton, mont } from "./template/fonts";
import { SAFE, SAFE_W } from "./template/safe";
import { Sticker } from "./template/stickers";
import { C, f, stroke } from "./template/theme";

// Profile-grid cover. TikTok/IG grids crop the 9:16 frame to roughly the middle 3:4
// (y 240-1680), so all text sits between y 900 and 1600.
const hk = P.hook as { lines?: string[]; tag?: string; sticker?: string };
const cover = P.cover as { at?: number; lines?: string[]; tag?: string; sticker?: string };

export const Cover: React.FC = () => {
  const lines = cover.lines ?? hk.lines ?? [];
  const [small, big, ...rest] = lines;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Freeze frame={f(cover.at ?? 1)}>
        <AbsoluteFill style={{ transform: "scale(1.05)", transformOrigin: "50% 35%" }}>
          <OffthreadVideo src={staticFile("cut.mp4")} muted />
        </AbsoluteFill>
      </Freeze>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 85%)" }} />
      <div
        style={{
          position: "absolute",
          top: 1120,
          left: SAFE.left,
          width: SAFE_W + (SAFE.right - SAFE.left),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {small && (
          <div style={{ fontFamily: anton, fontSize: small.length > 18 ? 86 : small.length > 13 ? 98 : 110, lineHeight: 1.05, color: "#fff", ...stroke(12), whiteSpace: "nowrap" }}>
            {small}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {big && (
            <div style={{ fontFamily: anton, fontSize: big.length > 9 ? 150 : big.length > 6 ? 180 : 210, lineHeight: 1, color: C.yellow, ...stroke(16), transform: "rotate(-3deg)" }}>
              {big}
            </div>
          )}
          {(cover.sticker ?? hk.sticker) && <Sticker name={cover.sticker ?? hk.sticker} size={170} style={{ transform: "rotate(12deg)" }} />}
        </div>
        {rest.map((l) => (
          <div key={l} style={{ fontFamily: anton, fontSize: 90, color: "#fff", ...stroke(12) }}>
            {l}
          </div>
        ))}
        {(cover.tag ?? hk.tag) && (
          <div
            style={{
              marginTop: 18,
              background: C.red,
              color: "#fff",
              fontFamily: mont,
              fontWeight: 900,
              fontSize: 44,
              padding: "10px 28px",
              borderRadius: 12,
              border: `6px solid ${C.ink}`,
              transform: "rotate(2deg)",
            }}
          >
            {cover.tag ?? hk.tag}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
