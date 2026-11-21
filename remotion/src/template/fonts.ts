import { continueRender, delayRender, staticFile } from "remotion";

// Fonts are bundled locally (public/fonts) so renders never depend on the network.
export const anton = "AntonLocal";
export const mont = "MontserratLocal";

const load = (family: string, file: string, weight: string) => {
  const handle = delayRender(`font ${family}`);
  const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};

load(anton, "fonts/Anton-Regular.ttf", "400");
load(mont, "fonts/Montserrat.ttf", "100 900");
