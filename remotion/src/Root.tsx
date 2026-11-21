import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { Cover } from "./Cover";
import P from "./data/project.json";
import { FPS } from "./template/theme";

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
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
