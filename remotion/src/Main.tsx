import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { anton, mont } from "./fonts";
import edit from "./data/edit.json";
import { SAFE, SAFE_W, TITLE_Y, CAPTION_Y, CTA_Y } from "./safe";


const A = edit.anchors;
const YELLOW = "#FFE14D";
const RED = "#FF3B30";
const MATCHA = "#8BC34A";
const INK = "#111";

const f = (s: number) => Math.round(s * 30);

// ---------- SFX ----------
type Sfx = { at: number; name: string; vol?: number };
const SFX: Sfx[] = [
  { at: 0, name: "whoosh", vol: 0.5 },
  { at: 0.25, name: "impact", vol: 0.45 },
  { at: A.first - 0.2, name: "whoosh", vol: 0.45 },
  { at: A.first, name: "pop", vol: 0.5 },
  { at: A.second - 0.2, name: "whoosh", vol: 0.45 },
  { at: A.second, name: "pop", vol: 0.5 },
  { at: A.lelaki1, name: "swipe", vol: 0.5 },
  { at: A.lelaki2, name: "swipe", vol: 0.5 },
  { at: A.nombor3 - 0.2, name: "whoosh", vol: 0.45 },
  { at: A.nombor3, name: "pop", vol: 0.5 },
  { at: A.itu3ciri, name: "click", vol: 0.6 },
  { at: A.itu3ciri + 0.3, name: "click", vol: 0.6 },
  { at: A.itu3ciri + 0.6, name: "click", vol: 0.6 },
  { at: A.komen, name: "pop", vol: 0.5 },
  { at: A.tinggalkan1, name: "impact", vol: 0.5 },
  { at: A.ibu - 0.2, name: "swipe", vol: 0.4 },
  { at: A.tinggalkan2, name: "impact", vol: 0.5 },
  { at: A.merosakkan - 0.2, name: "whoosh", vol: 0.45 },
  { at: A.punca, name: "impact", vol: 0.6 },
  { at: A.selamatkan - 1.0, name: "riser", vol: 0.35 },
  { at: A.selamatkan, name: "ding", vol: 0.45 },
  { at: A.ciao, name: "ding", vol: 0.45 },
];

// ---------- helpers ----------
const usePop = (startSec: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - f(startSec), fps, config: { damping, stiffness: 180 } });
};

const fadeOut = (frame: number, endSec: number, dur = 6) =>
  interpolate(frame, [f(endSec) - dur, f(endSec)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const stroke = (px: number, color = INK) => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill" as const,
});

// ---------- video with jump-cut punch-ins + emphasis zooms ----------
const EMPHASIS = [
  { at: A.lelaki1, dur: 1.4, shake: true },
  { at: A.lelaki2, dur: 1.4, shake: true },
  { at: A.tinggalkan1, dur: 1.3, shake: false },
  { at: A.tinggalkan2, dur: 1.3, shake: false },
  { at: A.punca, dur: 1.5, shake: true },
];

const VideoLayer = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  // alternate framing on every cut so jump cuts read as intentional
  const segIdx = edit.segments.filter((s) => s.outStart <= t).length - 1;
  let scale = segIdx % 2 === 1 ? 1.08 : 1.0;
  let dx = 0;
  let dy = 0;
  for (const e of EMPHASIS) {
    const local = t - e.at;
    if (local < -0.05 || local > e.dur) continue;
    const zin = interpolate(local, [0, 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const zout = interpolate(local, [e.dur - 0.25, e.dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    scale += 0.14 * Math.min(zin, zout);
    if (e.shake && local < 0.35) {
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

// ---------- captions ----------
type W = { text: string; start: number; end: number };
const chunkWords = (words: W[]) => {
  const chunks: W[][] = [];
  let cur: W[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const punct = /[.,?!]$/.test(w.text);
    const gap = next ? next.start - w.end > 0.35 : true;
    const len = cur.map((x) => x.text).join(" ").length;
    if (cur.length >= 3 || punct || gap || len > 16) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  return chunks;
};
const CHUNKS = chunkWords(edit.words as W[]);
const HOT = /(matcha|trend|lelaki|leher|bermoral|komen|tinggalkan|rosak|punca|selamatkan|kepamis|pamis|ibu|3)/i;

const clean = (s: string) => s.replace(/[.,?!]+$/, "").replace(/^ke$/i, "KE").toUpperCase();

const Captions = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const idx = CHUNKS.findIndex((c, i) => {
    const next = CHUNKS[i + 1];
    const end = c[c.length - 1].end + 0.5;
    return t >= c[0].start - 0.05 && t < (next ? Math.min(next[0].start - 0.05, end) : end);
  });
  if (idx < 0) return null;
  const chunk = CHUNKS[idx];
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
        const hot = HOT.test(w.text);
        const active = current && hot;
        return (
          <span
            key={i}
            style={{
              fontFamily: mont,
              fontWeight: 900,
              fontSize: 76,
              lineHeight: 1.12,
              color: current ? YELLOW : "#fff",
              ...stroke(12),
              textShadow: "0 6px 18px rgba(0,0,0,0.55)",
              transform: active ? "scale(1.1) rotate(-2deg)" : current ? "scale(1.04)" : "none",
              display: "inline-block",
            }}
          >
            {clean(w.text)}
          </span>
        );
      })}
    </div>
  );
};

// ---------- top title band ----------
const TopBand: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const p = usePop(from, 15);
  const out = fadeOut(frame, to, 8);
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
        opacity: out,
      }}
    >
      {children}
    </div>
  );
};

const Hook = () => {
  const p1 = usePop(0.0);
  const p2 = usePop(0.25, 9);
  const p3 = usePop(0.6, 10);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: anton, fontSize: 84, color: "#fff", ...stroke(10), transform: `scale(${p1})`, letterSpacing: 2 }}>
        3 CIRI-CIRI
      </div>
      <div
        style={{
          fontFamily: anton,
          fontSize: 170,
          lineHeight: 1,
          color: YELLOW,
          ...stroke(14),
          transform: `scale(${p2}) rotate(-3deg)`,
          textShadow: "0 10px 0 rgba(0,0,0,0.35)",
        }}
      >
        KEPAMIS
      </div>
      <div
        style={{
          marginTop: 14,
          background: RED,
          color: "#fff",
          fontFamily: mont,
          fontWeight: 900,
          fontSize: 44,
          padding: "8px 26px",
          borderRadius: 10,
          border: `5px solid ${INK}`,
          transform: `scale(${p3}) rotate(2deg)`,
        }}
      >
        DIDEDAHKAN!
      </div>
    </div>
  );
};

const MatchaIcon = () => (
  <svg width="86" height="86" viewBox="0 0 64 64">
    <path d="M14 22h36l-4 34a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#fff" stroke={INK} strokeWidth="4" />
    <path d="M17 32h30l-2.2 22H19.2z" fill={MATCHA} />
    <rect x="10" y="14" width="44" height="9" rx="3" fill="#fff" stroke={INK} strokeWidth="4" />
    <path d="M36 14 42 2" stroke={INK} strokeWidth="5" strokeLinecap="round" />
  </svg>
);
const TrendIcon = () => (
  <svg width="86" height="86" viewBox="0 0 64 64">
    <rect x="16" y="4" width="32" height="56" rx="6" fill="#fff" stroke={INK} strokeWidth="4" />
    <path d="M21 42l8-9 6 5 9-12" fill="none" stroke={RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M38 25h7v7" fill="none" stroke={RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HijabIcon = () => (
  <svg width="86" height="86" viewBox="0 0 64 64">
    <path d="M32 4C18 4 10 16 10 30c0 10 4 18 8 24h28c4-6 8-14 8-24C54 16 46 4 32 4z" fill="#C9A0DC" stroke={INK} strokeWidth="4" />
    <ellipse cx="32" cy="30" rx="13" ry="15" fill="#F2C9A0" stroke={INK} strokeWidth="3" />
    <rect x="26" y="44" width="12" height="9" fill="#F2C9A0" stroke={RED} strokeWidth="3" />
  </svg>
);

const ItemCard: React.FC<{ n: number; title: string; icon: React.ReactNode; color: string; at: number }> = ({
  n,
  title,
  icon,
  color,
  at,
}) => {
  const num = usePop(at, 8);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "#fff",
        border: `6px solid ${INK}`,
        borderRadius: 28,
        padding: "16px 28px 16px 18px",
        boxShadow: `10px 10px 0 ${INK}`,
        maxWidth: SAFE_W - 20,
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          background: color,
          border: `5px solid ${INK}`,
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
        #{n}
      </div>
      <div style={{ fontFamily: anton, fontSize: 62, lineHeight: 1.02, color: INK, textTransform: "uppercase", whiteSpace: "pre-line" }}>
        {title}
      </div>
      <div style={{ flexShrink: 0 }}>{icon}</div>
    </div>
  );
};

const Recap = () => {
  const items = ["OBSES MATCHA", "KUAT MAIN TREND", "TUDUNG TAPI NAMPAK LEHER"];
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        background: "rgba(17,17,17,0.82)",
        border: `5px solid ${YELLOW}`,
        borderRadius: 26,
        padding: "20px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ fontFamily: anton, fontSize: 52, color: YELLOW, textAlign: "center" }}>CIRI-CIRI KEPAMIS</div>
      {items.map((it, i) => {
        const p = spring({ frame: frame - f(A.itu3ciri + i * 0.3), fps: 30, config: { damping: 12 } });
        return (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
            <svg width="44" height="44" viewBox="0 0 24 24">
              <rect x="1" y="1" width="22" height="22" rx="5" fill={MATCHA} />
              <path d="M6 12.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 40, color: "#fff" }}>
              {i + 1}. {it}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{ bg: string; color?: string; children: React.ReactNode; size?: number }> = ({
  bg,
  color = "#fff",
  children,
  size = 64,
}) => (
  <div
    style={{
      background: bg,
      color,
      fontFamily: anton,
      fontSize: size,
      lineHeight: 1.05,
      padding: "14px 34px",
      borderRadius: 22,
      border: `6px solid ${INK}`,
      boxShadow: `10px 10px 0 ${INK}`,
      textAlign: "center",
      maxWidth: SAFE_W - 20,
    }}
  >
    {children}
  </div>
);

const Warning = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: SAFE_W - 40,
          height: 26,
          borderRadius: 6,
          border: `4px solid ${INK}`,
          background: `repeating-linear-gradient(-45deg, ${YELLOW} 0 22px, ${INK} 22px 44px)`,
          backgroundPositionX: frame * 2,
        }}
      />
      <div style={{ margin: "10px 0" }}>
        <Pill bg={YELLOW} color={INK} size={60}>
          ⚠ MEROSAKKAN
          <br />
          RUMAH TANGGA
        </Pill>
      </div>
    </div>
  );
};

// ---------- center stamps ----------
const Stamp: React.FC<{ at: number; dur: number; text: string; color?: string; y?: number }> = ({
  at,
  dur,
  text,
  color = RED,
  y = 760,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < f(at) || frame > f(at + dur)) return null;
  const p = spring({ frame: frame - f(at), fps, config: { damping: 9, stiffness: 220 } });
  const out = fadeOut(frame, at + dur, 6);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: SAFE.left,
        width: SAFE_W,
        display: "flex",
        justifyContent: "center",
        opacity: out,
        transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(-8deg)`,
      }}
    >
      <div
        style={{
          fontFamily: anton,
          fontSize: 130,
          color: "#fff",
          background: color,
          padding: "6px 36px",
          border: `8px solid #fff`,
          borderRadius: 18,
          boxShadow: `0 0 0 8px ${INK}, 0 20px 40px rgba(0,0,0,0.5)`,
          letterSpacing: 2,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Question: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < f(at) || frame > f(at + 1.5)) return null;
  const p = spring({ frame: frame - f(at), fps: 30, config: { damping: 8 } });
  const wob = Math.sin((frame - f(at)) / 3) * 6;
  return (
    <div
      style={{
        position: "absolute",
        top: 560,
        left: SAFE.left + 20,
        fontFamily: anton,
        fontSize: 170,
        color: YELLOW,
        ...stroke(12),
        transform: `scale(${p}) rotate(${-14 + wob}deg)`,
        opacity: fadeOut(frame, at + 1.5),
      }}
    >
      ???
    </div>
  );
};

const CommentCTA = () => {
  const frame = useCurrentFrame();
  const from = A.komen - 0.1;
  const to = A.komen + 4.5;
  if (frame < f(from) || frame > f(to)) return null;
  const p = spring({ frame: frame - f(from), fps: 30, config: { damping: 10 } });
  const bob = Math.sin((frame - f(from)) / 6) * 8;
  return (
    <div
      style={{
        position: "absolute",
        top: CTA_Y,
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
          border: `6px solid ${INK}`,
          borderRadius: 999,
          padding: "14px 34px",
          boxShadow: `8px 8px 0 ${INK}`,
        }}
      >
        <svg width="62" height="62" viewBox="0 0 24 24">
          <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill={YELLOW} stroke={INK} strokeWidth="2" />
          <circle cx="8" cy="11" r="1.4" fill={INK} />
          <circle cx="12" cy="11" r="1.4" fill={INK} />
          <circle cx="16" cy="11" r="1.4" fill={INK} />
        </svg>
        <div style={{ fontFamily: anton, fontSize: 58, color: INK }}>TAMBAH KAT KOMEN</div>
      </div>
    </div>
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const p = usePop(A.ciao, 8);
  if (frame < f(A.ciao)) return null;
  const wave = Math.sin((frame - f(A.ciao)) / 3) * 18;
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
      <div style={{ fontFamily: anton, fontSize: 190, color: YELLOW, ...stroke(14), transform: "rotate(-6deg)" }}>CIAO!</div>
      <svg width="150" height="150" viewBox="0 0 64 64" style={{ transform: `rotate(${wave}deg)`, transformOrigin: "50% 90%" }}>
        <path
          d="M20 58c-6-4-10-12-10-20V24a4 4 0 0 1 8 0v8V12a4 4 0 0 1 8 0v18V8a4 4 0 0 1 8 0v22V12a4 4 0 0 1 8 0v26c0 12-8 22-20 22z"
          fill="#F2C9A0"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const SafeZoneGuide = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, borderTop: `${SAFE.top}px solid rgba(255,0,0,0.35)`, borderBottom: `${SAFE.bottom}px solid rgba(255,0,0,0.35)`, borderLeft: `${SAFE.left}px solid rgba(255,0,0,0.35)`, borderRight: `${SAFE.right}px solid rgba(255,0,0,0.35)` }} />
  </AbsoluteFill>
);

// ---------- main ----------
export const Main: React.FC<{ showSafeZone: boolean }> = ({ showSafeZone }) => {
  const itemsEnd = A.itu3ciri - 0.15;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <VideoLayer />

      {/* subtle top/bottom gradient so text reads on bright car roof */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)" }} />

      <TopBand from={0} to={A.first - 0.3}><Hook /></TopBand>
      <TopBand from={A.first - 0.2} to={A.second - 0.25}>
        <ItemCard n={1} at={A.first} title="Obses matcha" icon={<MatchaIcon />} color={MATCHA} />
      </TopBand>
      <TopBand from={A.second - 0.2} to={A.nombor3 - 0.25}>
        <ItemCard n={2} at={A.second} title="Kuat main trend" icon={<TrendIcon />} color={RED} />
      </TopBand>
      <TopBand from={A.nombor3 - 0.2} to={itemsEnd}>
        <ItemCard n={3} at={A.nombor3} title={"Tudung tapi\nnampak leher"} icon={<HijabIcon />} color="#9C27B0" />
      </TopBand>
      <TopBand from={A.itu3ciri - 0.1} to={A.komen - 0.4}><Recap /></TopBand>
      <TopBand from={A.ibu - 0.2} to={A.tinggalkan2 - 0.1}>
        <Pill bg="#fff" color={INK} size={58}>CARI IBU TERBAIK<br />UNTUK ANAK-ANAK</Pill>
      </TopBand>
      <TopBand from={A.merosakkan - 0.2} to={A.selamatkan - 0.3}><Warning /></TopBand>
      <TopBand from={A.selamatkan - 0.05} to={A.ciao - 0.2}>
        <Pill bg={MATCHA} size={64}>SELAMATKAN<br />DIRI ANDA!</Pill>
      </TopBand>

      <Question at={A.lelaki1} />
      <Question at={A.lelaki2} />
      <CommentCTA />
      <Stamp at={A.tinggalkan1} dur={1.4} text="TINGGALKAN!" />
      <Stamp at={A.tinggalkan2} dur={1.4} text="TINGGALKAN!" />
      <Stamp at={A.punca} dur={1.6} text="PUNCA!" />
      <EndCard />

      <Captions />

      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, f(s.at))} durationInFrames={f(2)} layout="none">
          <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol ?? 0.5} />
        </Sequence>
      ))}

      {showSafeZone && <SafeZoneGuide />}
    </AbsoluteFill>
  );
};
