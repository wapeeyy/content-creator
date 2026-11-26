import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { Cover } from "./Cover";
import { AppDemo } from "./AppDemo";
import { OrbitLaunch, LAUNCH_FRAMES } from "./orbit/Launch";
import { OrbitTutorial, TUTORIAL_FRAMES } from "./orbit/Tutorial";
import { OrbitUpdate, UPDATE_FRAMES } from "./orbit/Update";
import { EXPLAIN_FRAMES, OrbitExplain } from "./orbit/Explain";
import { OrbitPromo1, PROMO1_FRAMES } from "./orbit/Promo";
import { AdSquare, AdWide, XFeature } from "./orbit/Ad";
import { XDailyBoard, XReadCard, type DailyProps } from "./orbit/DailyX";
import { PkgCardPro, PkgCardUltra, PkgProVideo, PkgUltraVideo, pkgFrames } from "./orbit/Package";
import { BrandAvatar, BrandAvatarWord, BrandHero, BrandHeroClean, BrandBot, BrandOG, BrandXHeader } from "./orbit/Brand";
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
    <Still id="PkgCardPro" component={PkgCardPro} width={1080} height={1350} />
    <Still id="PkgCardUltra" component={PkgCardUltra} width={1080} height={1350} />
    <Composition id="PkgProVideo" component={PkgProVideo} durationInFrames={pkgFrames("pro")} fps={30} width={1080} height={1920} />
    <Composition id="PkgUltraVideo" component={PkgUltraVideo} durationInFrames={pkgFrames("ultra")} fps={30} width={1080} height={1920} />
    <Still id="XDailyBoard" component={XDailyBoard} width={1600} height={900} defaultProps={{ date: "", reads: [] } as DailyProps} />
    <Still id="XReadCard" component={XReadCard} width={1600} height={900} defaultProps={{ date: "", reads: [], index: 0 } as DailyProps} />
    <Still id="AdWide" component={AdWide} width={1600} height={900} />
    <Still id="AdSquare" component={AdSquare} width={1080} height={1080} />
    <Still id="XFeature" component={XFeature} width={1600} height={900} />
    <Composition id="OrbitPromo1" component={OrbitPromo1} durationInFrames={PROMO1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrbitUpdate" component={OrbitUpdate} durationInFrames={UPDATE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrbitExplain" component={OrbitExplain} durationInFrames={EXPLAIN_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="BrandOG" component={BrandOG} width={2400} height={1260} />
    <Still id="BrandBot" component={BrandBot} width={1280} height={720} />
    <Composition id="OrbitTutorial" component={OrbitTutorial} durationInFrames={TUTORIAL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrbitLaunch" component={OrbitLaunch} durationInFrames={LAUNCH_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrbitLaunchX" component={OrbitLaunch} durationInFrames={LAUNCH_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="OrbitTutorialX" component={OrbitTutorial} durationInFrames={TUTORIAL_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
