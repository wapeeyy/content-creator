import React from "react";
import { Img, staticFile } from "remotion";
import { C } from "./theme";

const S = C.ink;
const W = 4;

// Flat sticker library. Use by name in video.json ("sticker": "redflag").
// For a real meme picture, drop a PNG in remotion/public/stickers/ and use "img:file.png".
const LIB: Record<string, React.ReactNode> = {
  redflag: (
    <>
      <path d="M14 6v54" stroke={S} strokeWidth={W + 1} strokeLinecap="round" />
      <path d="M16 8c10-5 18 5 28 0s12-2 12-2v26s-4-4-12 1-18-6-28 0z" fill={C.red} stroke={S} strokeWidth={W} strokeLinejoin="round" />
    </>
  ),
  threads: (
    <>
      <rect x="2" y="2" width="60" height="60" rx="15" fill="#000" stroke={S} strokeWidth="2" />
      <path d="M41 30c-1-7-5-10-10-10-6 0-10 5-10 12s4 12 11 12c5 0 8-2 9-6 1-5-3-7-8-7-4 0-6 2-6 4s2 3 5 3c5 0 7-3 7-9 0-9-5-15-13-15-10 0-15 8-15 18s6 18 17 18c6 0 10-2 13-6"
        fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" transform="translate(1,1) scale(0.97)" />
    </>
  ),
  matcha: (
    <>
      <path d="M14 22h36l-4 34a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#fff" stroke={S} strokeWidth={W} />
      <path d="M17 32h30l-2.2 22H19.2z" fill={C.green} />
      <rect x="10" y="14" width="44" height="9" rx="3" fill="#fff" stroke={S} strokeWidth={W} />
      <path d="M36 14 42 2" stroke={S} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  trend: (
    <>
      <rect x="16" y="4" width="32" height="56" rx="6" fill="#fff" stroke={S} strokeWidth={W} />
      <path d="M21 42l8-9 6 5 9-12" fill="none" stroke={C.red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 25h7v7" fill="none" stroke={C.red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  hijab: (
    <>
      <path d="M32 4C18 4 10 16 10 30c0 10 4 18 8 24h28c4-6 8-14 8-24C54 16 46 4 32 4z" fill="#C9A0DC" stroke={S} strokeWidth={W} />
      <ellipse cx="32" cy="30" rx="13" ry="15" fill="#F2C9A0" stroke={S} strokeWidth="3" />
      <rect x="26" y="44" width="12" height="9" fill="#F2C9A0" stroke={C.red} strokeWidth="3" />
    </>
  ),
  question: (
    <>
      <circle cx="32" cy="32" r="28" fill={C.yellow} stroke={S} strokeWidth={W} />
      <path d="M23 24a9 9 0 1 1 13 8c-3 2-4 3-4 7" fill="none" stroke={S} strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="48" r="3.5" fill={S} />
    </>
  ),
  check: (
    <>
      <circle cx="32" cy="32" r="28" fill={C.green} stroke={S} strokeWidth={W} />
      <path d="M19 33l9 9 17-19" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  cross: (
    <>
      <circle cx="32" cy="32" r="28" fill={C.red} stroke={S} strokeWidth={W} />
      <path d="M21 21l22 22M43 21 21 43" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    </>
  ),
  fire: (
    <>
      <path d="M32 4c4 10 18 16 18 34a18 18 0 0 1-36 0c0-9 5-14 8-18 1 6 4 9 6 9-2-9 0-17 4-25z" fill="#FF7A1A" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 30c3 6 9 9 9 17a9 9 0 0 1-18 0c0-5 4-9 9-17z" fill={C.yellow} />
    </>
  ),
  eyes: (
    <>
      <ellipse cx="20" cy="32" rx="13" ry="18" fill="#fff" stroke={S} strokeWidth={W} />
      <ellipse cx="44" cy="32" rx="13" ry="18" fill="#fff" stroke={S} strokeWidth={W} />
      <circle cx="25" cy="36" r="6" fill={S} />
      <circle cx="49" cy="36" r="6" fill={S} />
    </>
  ),
  heart: <path d="M32 56S6 40 6 22a13 13 0 0 1 26-4 13 13 0 0 1 26 4c0 18-26 34-26 34z" fill={C.red} stroke={S} strokeWidth={W} strokeLinejoin="round" />,
  brokenheart: (
    <>
      <path d="M30 54S6 40 6 22a13 13 0 0 1 24-6l-4 12 8 6-6 10z" fill={C.red} stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M36 54s22-14 22-32a13 13 0 0 0-24-6l-2 10 8 6-6 10z" fill={C.red} stroke={S} strokeWidth={W} strokeLinejoin="round" />
    </>
  ),
  warning: (
    <>
      <path d="M32 5 60 56H4z" fill={C.yellow} stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 22v17" stroke={S} strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="47" r="3.5" fill={S} />
    </>
  ),
  laugh: (
    <>
      <circle cx="32" cy="32" r="28" fill={C.yellow} stroke={S} strokeWidth={W} />
      <path d="M17 24l7 4-7 4M47 24l-7 4 7 4" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 38h32a16 16 0 0 1-32 0z" fill="#fff" stroke={S} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M8 22c-3 4-3 8 0 10M56 22c3 4 3 8 0 10" stroke={C.blue} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
  thinking: (
    <>
      <circle cx="32" cy="32" r="28" fill={C.yellow} stroke={S} strokeWidth={W} />
      <circle cx="22" cy="26" r="3.5" fill={S} />
      <circle cx="42" cy="26" r="3.5" fill={S} />
      <path d="M16 18l10-3M38 15l10 3" stroke={S} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 44h16" stroke={S} strokeWidth="4" strokeLinecap="round" />
      <path d="M38 50c4-2 9-1 10 3s-3 7-7 7" fill="#F2C9A0" stroke={S} strokeWidth="3.5" />
    </>
  ),
  ring: (
    <>
      <circle cx="32" cy="40" r="18" fill="none" stroke="#E8B923" strokeWidth="7" />
      <circle cx="32" cy="40" r="18" fill="none" stroke={S} strokeWidth="2" />
      <path d="M24 6h16l6 8-14 12L18 14z" fill="#9EE7FF" stroke={S} strokeWidth="3.5" strokeLinejoin="round" />
    </>
  ),
  house: (
    <>
      <path d="M8 30 32 8l24 22" fill="none" stroke={S} strokeWidth={W + 1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 27v29h36V27" fill="#fff" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <rect x="27" y="38" width="10" height="18" fill={C.red} stroke={S} strokeWidth="3" />
    </>
  ),
  shield: (
    <>
      <path d="M32 4 54 12v18c0 14-9 24-22 30C19 54 10 44 10 30V12z" fill={C.green} stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M22 32l7 7 13-14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  wave: (
    <path
      d="M20 58c-6-4-10-12-10-20V24a4 4 0 0 1 8 0v8V12a4 4 0 0 1 8 0v18V8a4 4 0 0 1 8 0v22V12a4 4 0 0 1 8 0v26c0 12-8 22-20 22z"
      fill="#F2C9A0"
      stroke={S}
      strokeWidth={W}
      strokeLinejoin="round"
    />
  ),
  comment: (
    <>
      <path d="M8 8h48a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H26l-12 12V46H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill={C.yellow} stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="20" cy="27" r="4" fill={S} />
      <circle cx="32" cy="27" r="4" fill={S} />
      <circle cx="44" cy="27" r="4" fill={S} />
    </>
  ),
  follow: (
    <>
      <circle cx="26" cy="20" r="12" fill="#fff" stroke={S} strokeWidth={W} />
      <path d="M4 58c0-14 10-22 22-22s22 8 22 22z" fill="#fff" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="50" cy="44" r="12" fill={C.red} stroke={S} strokeWidth="3.5" />
      <path d="M50 37v14M43 44h14" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
    </>
  ),
  money: (
    <>
      <rect x="4" y="16" width="56" height="32" rx="5" fill={C.green} stroke={S} strokeWidth={W} />
      <circle cx="32" cy="32" r="9" fill="#fff" stroke={S} strokeWidth="3" />
      <text x="32" y="38" fontSize="16" fontWeight="900" textAnchor="middle" fill={S}>
        $
      </text>
    </>
  ),
  clock: (
    <>
      <circle cx="32" cy="34" r="25" fill="#fff" stroke={S} strokeWidth={W} />
      <path d="M32 20v15l10 6" fill="none" stroke={C.red} strokeWidth="5" strokeLinecap="round" />
      <path d="M12 10l8-5M52 10l-8-5" stroke={S} strokeWidth={W} strokeLinecap="round" />
    </>
  ),
};

export const STICKER_NAMES = Object.keys(LIB);

export const Sticker: React.FC<{ name?: string; size?: number; style?: React.CSSProperties }> = ({ name, size = 86, style }) => {
  if (!name) return null;
  if (name.startsWith("img:")) {
    return <Img src={staticFile(`stickers/${name.slice(4)}`)} style={{ width: size, height: size, objectFit: "contain", ...style }} />;
  }
  const body = LIB[name];
  if (!body) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", ...style }}>
      {body}
    </svg>
  );
};
