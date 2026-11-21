import React from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { anton, mont } from "./fonts";
import { SAFE, SAFE_W, TITLE_Y, CAPTION_Y, CTA_Y, SAFE_BOTTOM_Y } from "./safe";
import { C, colorOf, f, stroke, BASE_HOT } from "./theme";
import { Sticker } from "./stickers";

export type Overlay = { type: string; at: number; until?: number; [k: string]: any };
export type Word = { text: string; start: number; end: number; cold?: boolean };
export type Segment = { srcStart: number; srcEnd: number; outStart: number; cold: boolean };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const usePop = (startSec: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - f(startSec), fps, config: { damping, stiffness: 180 } });
};

export const fadeOut = (frame: number, endSec: number, dur = 6) =>
  interpolate(frame, [f(endSec) - dur, f(endSec)], [1, 0], clamp);

// ---------- video: alternate framing per cut + emphasis zooms ----------
export const VideoLayer: React.FC<{ segments: Segment[]; zooms: Overlay[] }> = ({ segments, zooms }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const segIdx = segments.filter((s) => s.outStart <= t).length - 1;
  let scale = segIdx % 2 === 1 ? 1.08 : 1.0;
  let dx = 0;
  let dy = 0;
  for (const z of zooms) {
    const dur = z.dur ?? 1.3;
    const local = t - z.at;
    if (local < -0.05 || local > dur) continue;
    const zin = interpolate(local, [0, 0.12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const zout = interpolate(local, [dur - 0.25, dur], [1, 0], clamp);
    scale += (z.amount ?? 0.14) * Math.min(zin, zout);
    if (z.shake && local < 0.35) {
      const k = (0.35 - local) / 0.35;
      dx = Math.sin(frame * 2.1) * 14 * k;
      dy = Math.cos(frame * 2.7) * 10 * k;
    }
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, transformOrigin: "50% 42%" }}>
      <OffthreadVideo src={staticFile("cut.mp4")} />
    </AbsoluteFill>
  );
};

export const Shade = () => (
  <AbsoluteFill
    style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)" }}
  />
);

// ---------- captions ----------
const chunkWords = (words: Word[]) => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const punct = /[.,?!]$/.test(w.text);
    const gap = next ? next.start - w.end > 0.35 || !!next.cold !== !!w.cold : true;
    const len = cur.map((x) => x.text).join(" ").length;
    if (cur.length >= 3 || punct || gap || len > 16) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  return chunks;
};

export const Captions: React.FC<{ words: Word[]; hot: string[] }> = ({ words, hot }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const chunks = React.useMemo(() => chunkWords(words), [words]);
  const hotRe = React.useMemo(() => new RegExp(`(${[...BASE_HOT, ...hot].join("|")})`, "i"), [hot]);
  const idx = chunks.findIndex((c, i) => {
    const next = chunks[i + 1];
    const end = c[c.length - 1].end + 0.5;
    return t >= c[0].start - 0.05 && t < (next ? Math.min(next[0].start - 0.05, end) : end);
  });
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const appear = spring({ frame: frame - f(chunk[0].start - 0.05), fps: 30, config: { damping: 14, stiffness: 260 } });
  return (
    <div
      style={{
        position: "absolute",
        top: CAPTION_Y,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 18px",
        transform: `scale(${0.85 + 0.15 * appear})`,
        opacity: appear,
      }}
    >
      {chunk.map((w, i) => {
        const next = chunk[i + 1];
        const current = t >= w.start - 0.03 && (!next || t < next.start - 0.03);
        const active = current && hotRe.test(w.text);
        return (
          <span
            key={i}
            style={{
              fontFamily: mont,
              fontWeight: 900,
              fontSize: w.text.length > 13 ? 58 : 76,
              lineHeight: 1.12,
              color: current ? C.yellow : "#fff",
              ...stroke(12),
              textShadow: "0 6px 18px rgba(0,0,0,0.55)",
              transform: active ? "scale(1.1) rotate(-2deg)" : current ? "scale(1.04)" : "none",
              display: "inline-block",
            }}
          >
            {w.text.replace(/[.,?!]+$/, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

// ---------- top band container ----------
export const TopBand: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const p = usePop(from, 15);
  if (frame < f(from) || frame > f(to)) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        justifyContent: "center",
        transform: `translateX(${(1 - p) * -700}px)`,
        opacity: fadeOut(frame, to, 8),
      }}
    >
      {children}
    </div>
  );
};

// ---------- hook (first frames) ----------
export const HookTitle: React.FC<{ lines: string[]; tag?: string; sticker?: string; to: number }> = ({ lines, tag, sticker, to }) => {
  const frame = useCurrentFrame();
  if (frame > f(to)) return null;
  // visible from frame 0 (no empty first frame), with a punch-in
  const punch = interpolate(frame, [0, 6], [1.12, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const tagP = spring({ frame: frame - 8, fps: 30, config: { damping: 9 } });
  const bob = Math.sin(frame / 5) * 6;
  const [small, big, ...rest] = lines;
  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${punch})`,
        opacity: fadeOut(frame, to, 6),
      }}
    >
      {small && <div style={{ fontFamily: anton, fontSize: 84, lineHeight: 1.05, color: "#fff", ...stroke(10), letterSpacing: 2 }}>{small}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {big && (
          <div style={{ fontFamily: anton, fontSize: big.length > 9 ? 110 : big.length > 6 ? (sticker ? 128 : 145) : 160, lineHeight: 1, color: C.yellow, ...stroke(14), transform: "rotate(-3deg)", textShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
            {big}
          </div>
        )}
        {sticker && <Sticker name={sticker} size={130} style={{ transform: `translateY(${bob}px) rotate(12deg)` }} />}
      </div>
      {rest.map((l) => (
        <div key={l} style={{ fontFamily: anton, fontSize: 72, color: "#fff", ...stroke(10) }}>
          {l}
        </div>
      ))}
      {tag && (
        <div
          style={{
            marginTop: 14,
            background: C.red,
            color: "#fff",
            fontFamily: mont,
            fontWeight: 900,
            fontSize: 42,
            padding: "8px 26px",
            borderRadius: 10,
            border: `5px solid ${C.ink}`,
            transform: `scale(${tagP}) rotate(2deg)`,
            maxWidth: SAFE_W - 40,
            textAlign: "center",
          }}
        >
          {tag}
        </div>
      )}
    </div>
  );
};

// white flash marking the jump from cold open to the start of the story
export const Flash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [f(at) - 1, f(at), f(at) + 5], [0, 0.85, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: o }} />;
};

export const ProgressBar: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (t < from) return null;
  const p = interpolate(t, [from, duration], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_BOTTOM_Y - 16,
        left: SAFE.left + 20,
        width: SAFE_W - 40,
        height: 10,
        borderRadius: 5,
        background: "rgba(0,0,0,0.45)",
        overflow: "hidden",
      }}
    >
      <div style={{ width: `${p * 100}%`, height: "100%", background: C.yellow, borderRadius: 5 }} />
    </div>
  );
};

// ---------- overlay building blocks ----------
export const TitleCard: React.FC<{ o: Overlay }> = ({ o }) => {
  const num = usePop(o.at, 8);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "#fff",
        border: `6px solid ${C.ink}`,
        borderRadius: 28,
        padding: "16px 28px 16px 18px",
        boxShadow: `10px 10px 0 ${C.ink}`,
        maxWidth: SAFE_W - 20,
      }}
    >
      {o.n !== undefined && (
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            background: colorOf(o.color),
            border: `5px solid ${C.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: anton,
            fontSize: 64,
            color: "#fff",
            ...stroke(6),
            transform: `scale(${num}) rotate(${(1 - num) * -90}deg)`,
            flexShrink: 0,
          }}
        >
          #{o.n}
        </div>
      )}
      <div style={{ fontFamily: anton, fontSize: 62, lineHeight: 1.02, color: C.ink, textTransform: "uppercase", whiteSpace: "pre-line" }}>{o.title}</div>
      <Sticker name={o.sticker} size={86} style={{ flexShrink: 0 }} />
    </div>
  );
};

export const Pill: React.FC<{ bg: string; color?: string; size?: number; children: React.ReactNode }> = ({ bg, color = "#fff", size = 64, children }) => (
  <div
    style={{
      background: bg,
      color,
      fontFamily: anton,
      fontSize: size,
      lineHeight: 1.05,
      padding: "14px 34px",
      borderRadius: 22,
      border: `6px solid ${C.ink}`,
      boxShadow: `10px 10px 0 ${C.ink}`,
      textAlign: "center",
      maxWidth: SAFE_W - 20,
      whiteSpace: "pre-line",
    }}
  >
    {children}
  </div>
);

export const Banner: React.FC<{ o: Overlay }> = ({ o }) => {
  const frame = useCurrentFrame();
  const style = o.style ?? "white";
  const text = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
      {o.sticker && <Sticker name={o.sticker} size={70} />}
      <span>{o.text}</span>
    </span>
  );
  if (style === "warning") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: SAFE_W - 40,
            height: 26,
            borderRadius: 6,
            border: `4px solid ${C.ink}`,
            background: `repeating-linear-gradient(-45deg, ${C.yellow} 0 22px, ${C.ink} 22px 44px)`,
            backgroundPositionX: frame * 2,
          }}
        />
        <div style={{ margin: "10px 0" }}>
          <Pill bg={C.yellow} color={C.ink} size={60}>
            {text}
          </Pill>
        </div>
      </div>
    );
  }
  const bg = { white: "#fff", yellow: C.yellow, green: C.green, red: C.red, blue: C.blue }[style as string] ?? "#fff";
  const fg = style === "white" || style === "yellow" ? C.ink : "#fff";
  return (
    <Pill bg={bg} color={fg} size={o.size ?? 60}>
      {text}
    </Pill>
  );
};

export const Recap: React.FC<{ o: Overlay }> = ({ o }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        background: "rgba(17,17,17,0.82)",
        border: `5px solid ${C.yellow}`,
        borderRadius: 26,
        padding: "20px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: SAFE_W,
      }}
    >
      {o.title && <div style={{ fontFamily: anton, fontSize: 52, color: C.yellow, textAlign: "center" }}>{o.title}</div>}
      {(o.items as string[]).map((it, i) => {
        const p = spring({ frame: frame - f(o.at + i * 0.3), fps: 30, config: { damping: 12 } });
        return (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
            <Sticker name={o.mark ?? "check"} size={44} />
            <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 40, color: "#fff" }}>
              {i + 1}. {it}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Stamp: React.FC<{ o: Overlay }> = ({ o }) => {
  const frame = useCurrentFrame();
  const dur = o.dur ?? 1.4;
  if (frame < f(o.at) || frame > f(o.at + dur)) return null;
  const p = spring({ frame: frame - f(o.at), fps: 30, config: { damping: 9, stiffness: 220 } });
  return (
    <div
      style={{
        position: "absolute",
        top: o.y ?? 760,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        justifyContent: "center",
        opacity: fadeOut(frame, o.at + dur, 6),
        transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(${o.rotate ?? -8}deg)`,
      }}
    >
      <div
        style={{
          fontFamily: anton,
          fontSize: o.text.length > 12 ? 100 : 130,
          color: "#fff",
          background: colorOf(o.color ?? "red"),
          padding: "6px 36px",
          border: `8px solid #fff`,
          borderRadius: 18,
          boxShadow: `0 0 0 8px ${C.ink}, 0 20px 40px rgba(0,0,0,0.5)`,
          letterSpacing: 2,
          textAlign: "center",
        }}
      >
        {o.text}
      </div>
    </div>
  );
};

// anchored to the safe-zone edge so text under a sticker never leaves the safe area
const STICKER_POS: Record<string, React.CSSProperties> = {
  left: { left: SAFE.left + 20, top: 560, alignItems: "flex-start" },
  right: { right: SAFE.right + 50, top: 560, alignItems: "flex-end" },
  center: { left: SAFE.left, width: SAFE_W, top: 640, alignItems: "center" },
  low: { right: SAFE.right + 50, top: 1040, alignItems: "flex-end" },
};

export const StickerPop: React.FC<{ o: Overlay }> = ({ o }) => {
  const frame = useCurrentFrame();
  const dur = o.dur ?? 1.5;
  if (frame < f(o.at) || frame > f(o.at + dur)) return null;
  const p = spring({ frame: frame - f(o.at), fps: 30, config: { damping: 8 } });
  const wob = Math.sin((frame - f(o.at)) / 3) * 6;
  const pos = STICKER_POS[o.pos ?? "left"] ?? STICKER_POS.left;
  const size = o.size ?? 200;
  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        transform: `scale(${p}) rotate(${(o.rotate ?? (o.pos === "right" || o.pos === "low" ? 10 : -12)) + wob}deg)`,
        opacity: fadeOut(frame, o.at + dur),
        display: "flex",
        flexDirection: "column",
        transformOrigin: "50% 50%",
      }}
    >
      {o.sticker === "???" ? (
        <div style={{ fontFamily: anton, fontSize: 170, color: C.yellow, ...stroke(12) }}>???</div>
      ) : (
        <Sticker name={o.sticker} size={size} />
      )}
      {o.text && <div style={{ fontFamily: anton, fontSize: 56, color: "#fff", ...stroke(9), marginTop: -6, whiteSpace: "nowrap" }}>{o.text}</div>}
    </div>
  );
};

export const CTA: React.FC<{ o: Overlay }> = ({ o }) => {
  const frame = useCurrentFrame();
  const from = o.at - 0.1;
  const to = o.until ?? o.at + (o.dur ?? 4.5);
  if (frame < f(from) || frame > f(to)) return null;
  const p = spring({ frame: frame - f(from), fps: 30, config: { damping: 10 } });
  const bob = Math.sin((frame - f(from)) / 6) * 8;
  return (
    <div
      style={{
        position: "absolute",
        top: o.y ?? CTA_Y,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        justifyContent: "center",
        opacity: fadeOut(frame, to),
        transform: `scale(${p}) translateY(${bob}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: "#fff",
          border: `6px solid ${C.ink}`,
          borderRadius: 999,
          padding: "14px 34px",
          boxShadow: `8px 8px 0 ${C.ink}`,
        }}
      >
        <Sticker name={o.sticker ?? "comment"} size={62} />
        <div style={{ fontFamily: anton, fontSize: 58, color: C.ink }}>{o.text}</div>
      </div>
    </div>
  );
};

export const EndCard: React.FC<{ o: Overlay }> = ({ o }) => {
  const frame = useCurrentFrame();
  const p = usePop(o.at, 8);
  if (frame < f(o.at) || (o.until && frame > f(o.until))) return null;
  const wave = Math.sin((frame - f(o.at)) / 3) * 18;
  return (
    <div
      style={{
        position: "absolute",
        top: 700,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        transform: `scale(${p})`,
      }}
    >
      <div style={{ fontFamily: anton, fontSize: 190, color: C.yellow, ...stroke(14), transform: "rotate(-6deg)" }}>{o.text}</div>
      <Sticker name={o.sticker ?? "wave"} size={150} style={{ transform: `rotate(${wave}deg)`, transformOrigin: "50% 90%" }} />
    </div>
  );
};

export const SafeZoneGuide = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderTop: `${SAFE.top}px solid rgba(255,0,0,0.35)`,
        borderBottom: `${SAFE.bottom}px solid rgba(255,0,0,0.35)`,
        borderLeft: `${SAFE.left}px solid rgba(255,0,0,0.35)`,
        borderRight: `${SAFE.right}px solid rgba(255,0,0,0.35)`,
      }}
    />
  </AbsoluteFill>
);
