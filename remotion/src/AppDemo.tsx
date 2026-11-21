import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { AppPhone, appTiming } from "./template/apps";
import type { Overlay } from "./template/components";
import { resolveSfx, SfxCue } from "./template/sfx";
import { f } from "./template/theme";

// Showcase of the "app" overlay for all four apps (not part of any real video).
const DEMO: Overlay[] = [
  { type: "app", app: "threads", at: 0.2, text: "kenapa lelaki macam ni" },
  { type: "app", app: "x", at: 4.6, text: "kenapa lelaki macam ni", name: "Aku", handle: "aku" },
  { type: "app", app: "instagram", at: 9.0, text: "kenapa lelaki macam ni 😩" },
  { type: "app", app: "tiktok", at: 13.4, text: "ciri-ciri kepamist", action: "search" },
];

const cues: SfxCue[] = DEMO.flatMap((o) => {
  const tm = appTiming(o);
  const text: string = o.text;
  return [
    { at: o.at, mood: "transition" },
    { at: o.at + 0.3, mood: "pop" },
    ...text.split("").map((ch, i) => (ch === " " ? null : { at: tm.typeStart + (i / text.length) * (tm.typeEnd - tm.typeStart), mood: "key" })).filter(Boolean) as SfxCue[],
    { at: tm.postAt + 0.15, mood: "notify" },
    { at: tm.end - 0.3, mood: "transition" },
  ];
});

export const AppDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <OffthreadVideo src={staticFile("cut.mp4")} startFrom={f(20)} muted />
    {DEMO.map((o, i) => (
      <AppPhone key={i} o={o} {...appTiming(o)} />
    ))}
    {resolveSfx(cues).map((s, i) => (
      <Sequence key={i} from={f(s.at)} durationInFrames={f(2.5)} layout="none">
        <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
