import { Composition } from "remotion";
import { Main } from "./Main";
import edit from "./data/edit.json";

export const FPS = 30;

export const Root = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={Math.ceil(edit.duration * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ showSafeZone: false }}
  />
);
