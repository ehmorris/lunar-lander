import { LANDER_WIDTH } from "./helpers/constants.js";

const makeLanderGradient = (
  CTX,
  color1,
  color2,
  color3,
  color4,
  width = LANDER_WIDTH
) => {
  const gradient = CTX.createLinearGradient(-width / 2, 0, width / 2, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.3, color2);
  gradient.addColorStop(0.6, color3);
  gradient.addColorStop(1, color4);
  return gradient;
};

const makeSpaceBackgroundGradient = (CTX, canvasHeight, backgroundColor) => {
  const gradient = CTX.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#000");
  gradient.addColorStop(0.5, backgroundColor);
  return gradient;
};

export const makeTheme = (state) => {
  const CTX = state.get("CTX");
  const canvasHeight = state.get("canvasHeight");

  const spaceTheme = {
    bodyFontColor: "rgba(255, 255, 255, 0.75)",
    headlineFontColor: "#fff",
    infoFontColor: "#fff",
    background: "#02071e",
    backgroundGradient: makeSpaceBackgroundGradient(
      CTX,
      canvasHeight,
      "#02071e"
    ),
    landerGradient: makeLanderGradient(
      CTX,
      "#DFE5E5",
      "#BDBCC3",
      "#4A4E6F",
      "#3D4264"
    ),
    toyLanderGradient: (width) =>
      makeLanderGradient(
        CTX,
        "#DFE5E5",
        "#BDBCC3",
        "#4A4E6F",
        "#3D4264",
        width
      ),
    asteroid: "#898482",
    star: "#ffffff",
    terrain: "#757579",
    meterGradient:
      "linear-gradient(90deg, hsl(142deg 100% 48%) 0%, hsl(84deg 100% 42%) 6%, hsl(61deg 100% 35%) 15%, hsl(41deg 100% 40%) 29%, hsl(25deg 100% 44%) 50%, hsl(0deg 100% 46%) 100%)",
  };

  const activeTheme = spaceTheme;

  document.documentElement.style.setProperty(
    "--background",
    activeTheme.background
  );

  document.documentElement.style.setProperty(
    "--body-font-color",
    activeTheme.bodyFontColor
  );

  document.documentElement.style.setProperty(
    "--headline-font-color",
    activeTheme.headlineFontColor
  );

  document.documentElement.style.setProperty(
    "--meter-gradient",
    activeTheme.meterGradient
  );

  return activeTheme;
};
