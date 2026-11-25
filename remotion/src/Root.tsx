import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { Cover } from "./Cover";
import { AppDemo } from "./AppDemo";
import { OrbitLaunch, LAUNCH_FRAMES } from "./orbit/Launch";
import { OrbitTutorial, TUTORIAL_FRAMES } from "./orbit/Tutorial";
import { BrandAvatar, BrandAvatarWord, BrandHero, BrandHeroClean, BrandOG, BrandXHeader } from "./orbit/Brand";
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
    <Still id="BrandAvatar" component={BrandAvatar} width={2048} height={2048} />
    <Still id="BrandAvatarWord" component={BrandAvatarWord} width={2048} height={2048} />
    <Still id="BrandXHeader" component={BrandXHeader} width={3000} height={1000} />
    <Still id="BrandHero" component={BrandHero} width={3840} height={2160} />
    <Still id="BrandHeroClean" component={BrandHeroClean} width={3840} height={2160} />
    <Still id="BrandOG" component={BrandOG} width={2400} height={1260} />
    <Composition id="OrbitTutorial" component={OrbitTutorial} durationInFrames={TUTORIAL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrbitLaunch" component={OrbitLaunch} durationInFrames={LAUNCH_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrbitLaunchX" component={OrbitLaunch} durationInFrames={LAUNCH_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="OrbitTutorialX" component={OrbitTutorial} durationInFrames={TUTORIAL_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
