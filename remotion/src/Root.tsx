import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { Cover } from "./Cover";
import { AppDemo } from "./AppDemo";
import P from "./data/project.json";
import { FPS, f } from "./template/theme";

export const Root = () => (
  <>
    <Composition
      id="Main"
      component={Main}
      durationInFrames={Math.ceil(P.duration * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ showSafeZone: false }}
    />
    <Composition id="AppDemo" component={AppDemo} durationInFrames={f(18)} fps={FPS} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
