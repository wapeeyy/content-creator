import React, { useLayoutEffect, useMemo, useRef } from "react";
import { continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

// ORBIT video kit: fonts, colours, starfield, galaxy mark, phone frame, type, HUD.

export const C = {
  void: "#000000",
  ink: "#f2f3f5",
  ink2: "#a3a7b3",
  faint: "#5f6370",
  gold: "#f3d9a4",
  up: "#6fe3a8",
  down: "#ff6b78",
  sol1: "#9945ff",
  sol2: "#14f195",
};
export const F = {
  thin: "BarlowLocal",
  narrow: "BarlowCondLocal",
  mono: "JetMonoLocal",
};

const loadFont = (family: string, file: string, weight: string) => {
  if (typeof document === "undefined") return;
  const h = delayRender(`font ${family} ${weight}`);
  const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(h);
    })
    .catch(() => continueRender(h));
};
loadFont(F.thin, "fonts/Barlow-300.woff2", "300");
loadFont(F.thin, "fonts/Barlow-500.woff2", "500");
loadFont(F.narrow, "fonts/BarlowCondensed-500.woff2", "500");
loadFont(F.mono, "fonts/JetBrainsMono-400.woff2", "400");

const TAU = Math.PI * 2;
export const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const fade = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const ramp = (frame: number, a: number, b: number, e = ease) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/* ---------- canvas helper ---------- */
const useCanvas = (draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!;
    draw(c.getContext("2d")!, c.width, c.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
};

/* ---------- starfield ---------- */
export const Stars: React.FC<{ opacity?: number; drift?: number; density?: number }> = ({ opacity = 1, drift = 0, density = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const stars = useMemo(() => {
    const r = seeded(21);
    return Array.from({ length: Math.round(520 * density) }, () => ({
      x: r() * width,
      y: r() * height,
      s: r() < 0.94 ? 0.7 + r() * 0.9 : 1.6 + r() * 1.4,
      a: 0.25 + r() * 0.7,
      p: r() * TAU,
      sp: 0.5 + r() * 1.5,
      z: 0.3 + r() * 0.7,
    }));
  }, [width, height, density]);
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      for (const s of stars) {
        const tw = 0.6 + 0.4 * Math.sin(frame * 0.05 * s.sp + s.p);
        ctx.globalAlpha = s.a * tw * opacity;
        const y = (s.y + frame * drift * s.z) % h;
        ctx.beginPath();
        ctx.arc(s.x, y, s.s, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    [frame, opacity, drift],
  );
  return <canvas ref={ref} width={width} height={height} style={{ position: "absolute", inset: 0 }} />;
};

/* ---------- galaxy mark (same design as the app) ---------- */
type P = { r: number; th: number; size: number; a: number; warm: number; sx: number; sy: number };
const makeGalaxy = (n: number) => {
  const rand = seeded(7);
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  };
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.pow(rand(), 0.55);
    pts.push({
      r: r * (0.98 + gauss() * 0.03),
      th: (i % 2) * Math.PI + r * 5.4 + gauss() * 0.28 * (1 - r * 0.35),
      size: 0.35 + rand() * (r < 0.25 ? 1.3 : 0.9),
      a: 0.25 + rand() * 0.65,
      warm: Math.max(0, 1 - r * 1.6),
      sx: rand() * 2 - 1,
      sy: rand() * 2 - 1,
    });
  }
  for (let i = 0; i < n * 0.25; i++) pts.push({ r: Math.sqrt(rand()), th: rand() * TAU, size: 0.3 + rand() * 0.5, a: 0.08 + rand() * 0.18, warm: 0, sx: rand() * 2 - 1, sy: rand() * 2 - 1 });
  return pts;
};

/** form: 0 = scattered stars → 1 = galaxy; ring: 0..1 orbit draw; core: 0..1 core brightness; t: rotation time (frames) */
export const Galaxy: React.FC<{ size: number; form?: number; ring?: number; core?: number; t?: number; glow?: number }> = ({
  size,
  form = 1,
  ring = 1,
  core = 1,
  t,
  glow = 1,
}) => {
  const frame = useCurrentFrame();
  const time = (t ?? frame) * 0.0021;
  const pts = useMemo(() => makeGalaxy(4200), []);
  const ref = useCanvas(
    (ctx, W) => {
      const cx = W / 2, cy = W / 2, R = W * 0.36, tilt = 0.62, rot = -0.4;
      ctx.clearRect(0, 0, W, W);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.15);
      g.addColorStop(0, `rgba(140,120,255,${0.2 * form * glow})`);
      g.addColorStop(0.35, `rgba(20,241,149,${0.05 * form * glow})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.15, R * 1.15 * tilt, rot, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      const cr = Math.cos(rot), sr = Math.sin(rot), k = W / 500;
      const fe = ease(form);
      for (const p of pts) {
        const ang = p.th + time / (0.25 + p.r);
        const x0 = Math.cos(ang) * p.r * R, y0 = Math.sin(ang) * p.r * R * tilt;
        let x = cx + x0 * cr - y0 * sr, y = cy + x0 * sr + y0 * cr;
        // scattered start: stars across the whole frame
        x = x * fe + (cx + p.sx * W * 0.9) * (1 - fe);
        y = y * fe + (cy + p.sy * W * 1.4) * (1 - fe);
        ctx.fillStyle = p.warm > 0 ? `rgba(${(225 - 40 * p.warm) | 0},${(225 - 30 * p.warm) | 0},255,${p.a})` : `rgba(${(205 + p.r * 40) | 0},222,255,${p.a})`;
        const s = p.size * k * (1.2 - 0.2 * fe);
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalCompositeOperation = "source-over";
      if (core > 0) {
        const cr0 = R * 0.12 * (0.6 + 0.4 * core);
        const halo = ctx.createRadialGradient(cx, cy, cr0, cx, cy, cr0 * 3 * (1 + 0.05 * Math.sin(frame * 0.09)));
        halo.addColorStop(0, `rgba(120,160,255,${0.4 * core})`);
        halo.addColorStop(1, "rgba(120,160,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, cr0 * 3.2, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = core;
        const sg = ctx.createLinearGradient(cx - cr0, cy + cr0, cx + cr0, cy - cr0);
        sg.addColorStop(0, C.sol1);
        sg.addColorStop(1, C.sol2);
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(cx, cy, cr0, 0, TAU);
        ctx.fill();
        const sh = ctx.createRadialGradient(cx - cr0 * 0.35, cy - cr0 * 0.35, 0, cx, cy, cr0);
        sh.addColorStop(0, "rgba(255,255,255,0.4)");
        sh.addColorStop(1, "rgba(0,0,0,0.35)");
        ctx.fillStyle = sh;
        ctx.beginPath();
        ctx.arc(cx, cy, cr0, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (ring > 0) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        const oa = R * 1.22, ob = R * 1.22 * tilt * 0.82;
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = Math.max(1.5, W / 420);
        ctx.beginPath();
        ctx.ellipse(0, 0, oa, ob, 0, -Math.PI / 2, -Math.PI / 2 + TAU * ease(ring));
        ctx.stroke();
        if (ring >= 1) {
          const sa = (frame * 0.0075) % TAU;
          const sx = Math.cos(sa) * oa, sy = Math.sin(sa) * ob;
          const s2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.035);
          s2.addColorStop(0, "rgba(255,255,255,0.95)");
          s2.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = s2;
          ctx.beginPath();
          ctx.arc(sx, sy, W * 0.035, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(2, W * 0.007), 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    },
    [frame, form, ring, core, time, glow],
  );
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} />;
};

/* ---------- type ---------- */
export const Wide: React.FC<{ children: React.ReactNode; size?: number; weight?: 300 | 500; track?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 64,
  weight = 300,
  track = 0.32,
  color = C.ink,
  style,
}) => (
  <div
    style={{
      fontFamily: F.thin,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: `${track}em`,
      paddingLeft: `${track}em`,
      textTransform: "uppercase",
      color,
      textAlign: "center",
      lineHeight: 1.15,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 26, color = C.ink2, style }) => (
  <div style={{ fontFamily: F.narrow, fontWeight: 500, fontSize: size, letterSpacing: "0.32em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 24, color = C.ink2, style }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, color, letterSpacing: "0.04em", ...style }}>{children}</div>
);

/* ---------- phone frame with a real app screenshot ---------- */
export const Phone: React.FC<{ src: string; width?: number; scroll?: number; style?: React.CSSProperties }> = ({ src, width = 700, scroll = 0, style }) => {
  const h = width * 2.05;
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: width * 0.11,
        border: "2px solid rgba(255,255,255,0.28)",
        padding: width * 0.025,
        background: "#020203",
        boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(140,120,255,0.12)",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: width * 0.085, overflow: "hidden", background: "#000", position: "relative" }}>
        <img src={staticFile(src)} style={{ width: "100%", position: "absolute", top: 0, left: 0, transform: `translateY(${-scroll}px)` }} />
      </div>
    </div>
  );
};

/* ---------- HUD (mission-control overlay) ---------- */
export const Hud: React.FC<{ total: number; opacity?: number; label?: string }> = ({ total, opacity = 1, label = "ORBIT // LAUNCH SEQUENCE" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const left = Math.max(0, total - frame) / fps;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(Math.floor(left % 60)).padStart(2, "0");
  const cs = String(Math.floor((left % 1) * 100)).padStart(2, "0");
  const corner = (pos: React.CSSProperties) => ({ position: "absolute" as const, width: 46, height: 46, borderColor: "rgba(255,255,255,0.35)", borderStyle: "solid", borderWidth: 0, ...pos });
  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      <div style={corner({ top: 70, left: 60, borderTopWidth: 2, borderLeftWidth: 2 })} />
      <div style={corner({ top: 70, right: 60, borderTopWidth: 2, borderRightWidth: 2 })} />
      <div style={corner({ bottom: 70, left: 60, borderBottomWidth: 2, borderLeftWidth: 2 })} />
      <div style={corner({ bottom: 70, right: 60, borderBottomWidth: 2, borderRightWidth: 2 })} />
      <Label size={22} style={{ position: "absolute", top: 136, left: 64, color: C.faint }}>{label}</Label>
      <Mono size={26} color={C.ink} style={{ position: "absolute", top: 128, right: 64 }}>
        T-{mm}:{ss}.{cs}
      </Mono>
      <Mono size={20} color={C.faint} style={{ position: "absolute", bottom: 136, left: 64 }}>
        SOLANA · MAINNET-BETA
      </Mono>
      <Mono size={20} color={C.faint} style={{ position: "absolute", bottom: 136, right: 64 }}>
        {String(frame).padStart(4, "0")} / {total}
      </Mono>
      <div style={{ position: "absolute", left: width / 2 - 1, top: 76, width: 2, height: 18, background: "rgba(255,255,255,0.3)" }} />
      <div style={{ position: "absolute", left: width / 2 - 1, top: height - 94, width: 2, height: 18, background: "rgba(255,255,255,0.3)" }} />
    </div>
  );
};
