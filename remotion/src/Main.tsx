import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import P from "./data/project.json";
import {
  Banner,
  CTA,
  Captions,
  EndCard,
  Flash,
  HookTitle,
  Overlay,
  ProgressBar,
  Recap,
  SafeZoneGuide,
  Shade,
  Stamp,
  StickerPop,
  TitleCard,
  TopBand,
  VideoLayer,
  Word,
  Segment,
} from "./template/components";
import { SfxCue, resolveSfx } from "./template/sfx";
import { AppPhone, appTiming } from "./template/apps";
import { f } from "./template/theme";

const overlays = P.overlays as Overlay[];
const words = P.words as Word[];
const segments = P.segments as Segment[];
const hook = P.hook as { lines?: string[]; tag?: string; sticker?: string; until?: number; hot?: string[] };
const hookEnd = P.hookEnd;
const hookTo = hook.until ?? (hookEnd > 0 ? hookEnd + 1.8 : 3);

// stamps and stickers with shake get an emphasis zoom automatically
const zooms: Overlay[] = [
  ...overlays.filter((o) => o.type === "zoom"),
  ...overlays.filter((o) => o.type === "stamp" && o.zoom !== false).map((o) => ({ ...o, dur: (o.dur ?? 1.4) - 0.1, shake: o.shake ?? false })),
  ...overlays.filter((o) => o.type === "sticker" && o.shake).map((o) => ({ ...o, dur: o.dur ?? 1.4 })),
];

// default SFX per overlay type; any overlay can override with "mood" (or "mood": "none")
const autoCues = (o: Overlay): SfxCue[] => {
  if (o.mood === "none") return [];
  const m = o.mood;
  switch (o.type) {
    case "title":
      return [{ at: o.at - 0.2, mood: "transition" }, { at: o.at, mood: m ?? "pop" }];
    case "banner":
      if (o.style === "warning") return [{ at: o.at - 0.2, mood: "transition" }, { at: o.at, mood: m ?? "drama" }];
      if (o.style === "green") return [{ at: o.at, mood: m ?? "right" }];
      return [{ at: o.at - 0.2, mood: m ?? "transition" }];
    case "recap":
      return (o.items as string[]).map((_, i) => ({ at: o.at + i * 0.3, mood: "list" }));
    case "stamp":
      return [{ at: o.at, mood: m ?? "hit" }];
    case "sticker":
      return [{ at: o.at, mood: m ?? "funny" }];
    case "cta":
      return [{ at: o.at, mood: m ?? "notify" }];
    case "end":
      return [{ at: o.at, mood: m ?? "end" }];
    case "zoom":
      return m ? [{ at: o.at, mood: m }] : [];
    case "app": {
      const tm = appTiming(o);
      const text: string = o.text ?? "";
      const taps = text.split("").map((ch, i) => ({ ch, at: tm.typeStart + (i / Math.max(text.length, 1)) * (tm.typeEnd - tm.typeStart) }));
      return [
        { at: o.at, mood: "transition" },
        { at: o.at + 0.3, mood: "pop" },
        ...taps.filter((k) => k.ch !== " ").map((k) => ({ at: k.at, mood: "key" })),
        { at: tm.postAt + 0.15, mood: m ?? "notify" },
        { at: tm.end - 0.3, mood: "transition" },
      ];
    }
    default:
      return [];
  }
};

const cues: SfxCue[] = [
  { at: 0, mood: "hit", vol: 0.22 },
  ...(hook.tag ? [{ at: 0.27, mood: "pop" }] : []),
  ...(hookEnd > 0 ? [{ at: hookEnd - 0.2, mood: "transition_heavy", vol: 0.35 }] : []),
  ...overlays.flatMap(autoCues),
  ...(P.sfx as SfxCue[]),
];
const SFX = resolveSfx(cues);

const Overlays: React.FC = () => (
  <>
    {overlays.map((o, i) => {
      const to = o.until ?? o.at + (o.dur ?? 3);
      switch (o.type) {
        case "title":
          return (
            <TopBand key={i} from={o.at - 0.2} to={to - 0.25}>
              <TitleCard o={o} />
            </TopBand>
          );
        case "banner":
          return (
            <TopBand key={i} from={o.at - 0.05} to={to - 0.2}>
              <Banner o={o} />
            </TopBand>
          );
        case "recap":
          return (
            <TopBand key={i} from={o.at - 0.1} to={to - 0.3}>
              <Recap o={o} />
            </TopBand>
          );
        case "stamp":
          return <Stamp key={i} o={o} />;
        case "sticker":
          return <StickerPop key={i} o={o} />;
        case "cta":
          return <CTA key={i} o={o} />;
        case "end":
          return <EndCard key={i} o={o} />;
        case "app": {
          const tm = appTiming(o);
          return <AppPhone key={i} o={o} {...tm} />;
        }
        default:
          return null;
      }
    })}
  </>
);

const Picture: React.FC = () => (
  <>
    <VideoLayer segments={segments} zooms={zooms} />
    <Shade />
    {hook.lines && <HookTitle lines={hook.lines} tag={hook.tag} sticker={hook.sticker} to={hookTo} />}
    <Overlays />
  </>
);

// last frames dissolve into frame 0 so the video loops seamlessly on TikTok
const LoopFade: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [durationInFrames - 9, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Freeze frame={0}>
        <Picture />
      </Freeze>
    </AbsoluteFill>
  );
};

export const Main: React.FC<{ showSafeZone: boolean }> = ({ showSafeZone }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Picture />
    {hookEnd > 0 && <Flash at={hookEnd} />}
    <ProgressBar from={hookEnd} duration={P.duration} />
    <Captions words={words} hot={hook.hot ?? []} />
    {P.loop && <LoopFade />}

    {SFX.map((s, i) => (
      <Sequence key={i} from={f(s.at)} durationInFrames={f(2.5)} layout="none">
        <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
      </Sequence>
    ))}

    {showSafeZone && <SafeZoneGuide />}
  </AbsoluteFill>
);
