import React from "react";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { mont } from "./fonts";
import { SAFE, SAFE_W } from "./safe";
import { C, f } from "./theme";
import type { Overlay } from "./components";

// "Open app -> type -> post" phone animation.
// Icons and screens are simplified look-alikes drawn here (not official logos/UI).
// To use an official logo you own the rights to, pass "icon": "img:file.png".

export type AppName = "threads" | "tiktok" | "x" | "instagram" | "whatsapp";

type Theme = {
  label: string;
  bg: string;
  fg: string;
  sub: string;
  accent: string;
  btnBg: string;
  btnFg: string;
  dark: boolean;
  composeTitle: string;
  button: string;
  placeholder: string;
  done: string;
};

export const APP_THEMES: Record<AppName, Theme> = {
  threads: {
    label: "Threads", bg: "#FFFFFF", fg: "#000000", sub: "#8A8A8A", accent: "#000000",
    btnBg: "#000000", btnFg: "#FFFFFF", dark: false,
    composeTitle: "Thread baru", button: "Post", placeholder: "Apa yang baru?", done: "Dah post!",
  },
  x: {
    label: "X", bg: "#000000", fg: "#E7E9EA", sub: "#71767B", accent: "#1D9BF0",
    btnBg: "#1D9BF0", btnFg: "#FFFFFF", dark: true,
    composeTitle: "", button: "Post", placeholder: "Apa yang berlaku?", done: "Post dihantar",
  },
  instagram: {
    label: "Instagram", bg: "#FFFFFF", fg: "#000000", sub: "#8E8E8E", accent: "#0095F6",
    btnBg: "#0095F6", btnFg: "#FFFFFF", dark: false,
    composeTitle: "Post baru", button: "Kongsi", placeholder: "Tulis kapsyen...", done: "Dah kongsi!",
  },
  tiktok: {
    label: "TikTok", bg: "#121212", fg: "#FFFFFF", sub: "#8A8B91", accent: "#FE2C55",
    btnBg: "#FE2C55", btnFg: "#FFFFFF", dark: true,
    composeTitle: "Cari", button: "Cari", placeholder: "Cari", done: "",
  },
  whatsapp: {
    label: "WhatsApp", bg: "#0B141A", fg: "#E9EDEF", sub: "#8696A0", accent: "#25D366",
    btnBg: "#25D366", btnFg: "#0B141A", dark: true,
    composeTitle: "Status", button: "Hantar", placeholder: "Taip status", done: "Status dikemas kini",
  },
};

export const AppIcon: React.FC<{ app: AppName; size: number }> = ({ app, size }) => {
  const r = size * 0.23;
  const box: React.CSSProperties = {
    width: size, height: size, borderRadius: r, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)", overflow: "hidden",
  };
  if (app === "threads")
    return (
      <div style={{ ...box, background: "#000" }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64">
          <path d="M44 30c-1-9-7-13-14-13-8 0-13 6-13 15s5 15 14 15c6 0 10-3 11-8 1-6-4-9-10-9-5 0-8 2-8 5s3 4 6 4c6 0 9-4 9-11 0-12-6-20-17-20C10 8 4 18 4 32s7 24 22 24c8 0 14-3 18-8"
            fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    );
  if (app === "x")
    return (
      <div style={{ ...box, background: "#000", border: "2px solid #333" }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 64 64">
          <path d="M8 6h14l34 52H42z" fill="#fff" />
          <path d="M54 6 12 58" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    );
  if (app === "instagram")
    return (
      <div style={{ ...box, background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64">
          <rect x="6" y="6" width="52" height="52" rx="16" fill="none" stroke="#fff" strokeWidth="5.5" />
          <circle cx="32" cy="32" r="12" fill="none" stroke="#fff" strokeWidth="5.5" />
          <circle cx="47" cy="17" r="3.5" fill="#fff" />
        </svg>
      </div>
    );
  if (app === "whatsapp")
    return (
      <div style={{ ...box, background: "#25D366" }}>
        <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 64 64">
          <path d="M32 6a26 26 0 0 0-22.4 39.2L6 58l13.2-3.5A26 26 0 1 0 32 6z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
          <path d="M23 20c2-1 3 0 4 3l1 3c0 1-1 2-2 3 1 3 5 7 8 8 1-1 2-2 3-2l3 1c3 1 4 2 3 4-1 3-4 4-7 3-7-2-13-8-15-15-1-3 0-6 2-8z" fill="#fff" />
        </svg>
      </div>
    );
  // tiktok-style note with cyan/red offset
  const note = "M34 6h9c1 7 6 12 13 12v9c-5 0-9-1-13-4v18a15 15 0 1 1-15-15v9a6 6 0 1 0 6 6z";
  return (
    <div style={{ ...box, background: "#000" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 64 64">
        <path d={note} fill="#25F4EE" transform="translate(-2,-2)" />
        <path d={note} fill="#FE2C55" transform="translate(2,2)" />
        <path d={note} fill="#fff" />
      </svg>
    </div>
  );
};

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

const Keyboard: React.FC<{ dark: boolean; hit?: string; width: number }> = ({ dark, hit, width }) => {
  const kw = (width - 11 * 6) / 10;
  const keyBg = dark ? "#3A3A3C" : "#FFFFFF";
  const keyFg = dark ? "#FFF" : "#000";
  return (
    <div style={{ background: dark ? "#1C1C1E" : "#D1D3D9", padding: "10px 6px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
      {ROWS.map((row) => (
        <div key={row} style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {row.split("").map((k) => {
            const on = hit === k;
            return (
              <div key={k} style={{
                width: kw, height: kw * 1.3, borderRadius: 6, background: on ? (dark ? "#8E8E93" : "#AEB3BE") : keyBg,
                color: keyFg, fontFamily: mont, fontWeight: 600, fontSize: kw * 0.62, display: "flex", alignItems: "center",
                justifyContent: "center", transform: on ? "translateY(-6px) scale(1.25)" : "none",
                boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
              }}>{k}</div>
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: kw * 5.5, height: kw * 1.3, borderRadius: 6, background: hit === " " ? (dark ? "#8E8E93" : "#AEB3BE") : keyBg }} />
      </div>
    </div>
  );
};

// Who is "typing" in the story. Set per video ("persona" in video.json) or per overlay.
export const PERSONAS: Record<string, { name: string; handle: string; color: string }> = {
  female: { name: "Siti", handle: "siti", color: "#FF8FB1" },
  male: { name: "Ali", handle: "ali", color: "#6FB7FF" },
};

// phone geometry: centred in the safe zone, bottom stays above the captions (y 1250)
export const PHONE = { w: 540, h: 950, top: 250 };

export const AppPhone: React.FC<{ o: Overlay; typeStart: number; typeEnd: number; postAt: number; end: number }> = ({ o, typeStart, typeEnd, postAt, end }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (t < o.at - 0.05 || t > end) return null;
  const app = (o.app as AppName) ?? "threads";
  const th = APP_THEMES[app];
  const text: string = o.text ?? "";
  const action: string = o.action ?? (app === "tiktok" ? "search" : "post");

  const inP = spring({ frame: frame - f(o.at), fps: 30, config: { damping: 15, stiffness: 160 } });
  const outP = interpolate(t, [end - 0.3, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const y = (1 - inP) * 900 + outP * 1100;

  const splash = interpolate(t, [o.at + 0.25, o.at + 0.45, o.at + 0.85, o.at + 1.0], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const iconScale = spring({ frame: frame - f(o.at + 0.25), fps: 30, config: { damping: 9 } });
  const n = Math.max(0, Math.min(text.length, Math.floor(interpolate(t, [typeStart, typeEnd], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  const typed = text.slice(0, n);
  const typing = t >= typeStart && t < typeEnd;
  const hit = typing ? text[n]?.toLowerCase() : undefined;
  const cursorOn = Math.floor(frame / 8) % 2 === 0 || typing;
  const pressed = t >= postAt && t < postAt + 0.2;
  const posted = t >= postAt + 0.15;
  const toastP = spring({ frame: frame - f(postAt + 0.15), fps: 30, config: { damping: 12 } });

  const W = PHONE.w;
  const H = PHONE.h;
  const left = SAFE.left + (SAFE_W - W) / 2;
  const persona = PERSONAS[o.persona ?? "female"] ?? PERSONAS.female;
  const name = o.name ?? persona.name;
  const handle = o.handle ?? persona.handle;

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 26px", borderBottom: `1px solid ${th.dark ? "#2F3336" : "#EFEFEF"}` }}>
      <div style={{ fontFamily: mont, fontSize: 28, color: th.fg }}>{action === "search" ? "‹" : "Batal"}</div>
      <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 32, color: th.fg }}>{th.composeTitle}</div>
      <div style={{ width: 60 }} />
    </div>
  );

  const compose = (
    <div style={{ padding: "22px 26px", display: "flex", gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: 36, background: persona.color, border: "3px solid #000", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mont, fontWeight: 900, fontSize: 34 }}>
        {name.slice(0, 1).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 30, color: th.fg }}>
          {app === "x" ? <>{name} <span style={{ color: th.sub, fontWeight: 500 }}>@{handle}</span></> : handle}
        </div>
        <div style={{ fontFamily: mont, fontWeight: 600, fontSize: 46, lineHeight: 1.25, color: n ? th.fg : th.sub, marginTop: 6, wordBreak: "break-word" }}>
          {n ? typed : th.placeholder}
          {!posted && cursorOn && <span style={{ display: "inline-block", width: 4, height: 50, background: th.accent, marginLeft: 2, verticalAlign: "text-bottom" }} />}
        </div>
      </div>
    </div>
  );

  const search = (
    <div style={{ padding: "18px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: th.dark ? "#2A2A2E" : "#F1F1F2", borderRadius: 12, padding: "14px 18px" }}>
        <svg width="38" height="38" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" fill="none" stroke={th.sub} strokeWidth="2.5" /><path d="M15 15l6 6" stroke={th.sub} strokeWidth="2.5" strokeLinecap="round" /></svg>
        <div style={{ fontFamily: mont, fontWeight: 700, fontSize: 40, color: n ? th.fg : th.sub, flex: 1 }}>
          {n ? typed : th.placeholder}
          {cursorOn && !posted && <span style={{ display: "inline-block", width: 4, height: 42, background: th.accent, marginLeft: 2, verticalAlign: "text-bottom" }} />}
        </div>
      </div>
      {posted && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18, opacity: toastP }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 230, borderRadius: 8, background: `linear-gradient(160deg, ${["#3a3a5a", "#5a3a3a", "#3a5a4a", "#4a4a3a"][i]}, #222)` }} />
          ))}
        </div>
      )}
    </div>
  );

  const button = action !== "search" && (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 26px 16px" }}>
      <div style={{
        background: n === text.length && n > 0 ? th.btnBg : th.dark ? "#333" : "#CCC", color: th.btnFg, fontFamily: mont, fontWeight: 800,
        fontSize: 32, padding: "14px 36px", borderRadius: 999, transform: pressed ? "scale(0.88)" : "scale(1)",
      }}>{th.button}</div>
    </div>
  );

  return (
    <div style={{ position: "absolute", left, top: PHONE.top, width: W, height: H, transform: `translateY(${y}px) rotate(${(1 - inP) * 6}deg)` }}>
      {/* bezel */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 64, background: "#0B0B0B", boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 6px #2A2A2A" }} />
      {/* screen */}
      <div style={{ position: "absolute", inset: 14, borderRadius: 52, overflow: "hidden", background: th.bg, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", fontFamily: mont, fontWeight: 700, fontSize: 20, color: th.fg }}>
          <span>9:41</span>
          <div style={{ width: 120, height: 30, borderRadius: 15, background: "#000" }} />
          <span>100%</span>
        </div>
        {header}
        {action === "search" ? search : compose}
        <div style={{ flex: 1 }} />
        {!posted && button}
        {!posted && <Keyboard dark={th.dark} hit={hit} width={W - 28} />}
        {posted && action !== "search" && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", opacity: toastP, transform: `translateY(${(1 - toastP) * 40}px)` }}>
            <div style={{ background: th.dark ? "#FFF" : "#111", color: th.dark ? "#000" : "#FFF", fontFamily: mont, fontWeight: 800, fontSize: 34, padding: "18px 32px", borderRadius: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <svg width="38" height="38" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill={C.green} /><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {th.done}
            </div>
          </div>
        )}
        {/* splash */}
        {splash > 0 && (
          <div style={{ position: "absolute", inset: 0, background: th.bg, opacity: splash, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
            {typeof o.icon === "string" && o.icon.startsWith("img:") ? null : (
              <div style={{ transform: `scale(${iconScale})` }}><AppIcon app={app} size={170} /></div>
            )}
            <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 34, color: th.fg }}>{th.label}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// timing helper shared by Main (render) and the SFX planner
export const appTiming = (o: Overlay) => {
  const text: string = o.text ?? "";
  const typeStart = o.typeStart ?? o.at + 1.0;
  const cps = o.cps ?? 14;
  const typeEnd = o.typeEnd ?? typeStart + Math.max(0.6, text.length / cps);
  const postAt = typeEnd + 0.35;
  const end = o.until ?? postAt + 1.3;
  return { typeStart, typeEnd, postAt, end };
};
