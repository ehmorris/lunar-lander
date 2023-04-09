import { LANDER_WIDTH } from "./helpers/constants.js";

const horizon = 0.72;

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

const makeHawaiiBackgroundGradient = (CTX, canvasHeight) => {
  const gradient = CTX.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#547CA6");
  gradient.addColorStop(horizon - 0.01, "#DB966D");
  gradient.addColorStop(horizon, "#CC9B7A");
  gradient.addColorStop(horizon + 0.01, "#CFBCB1");
  gradient.addColorStop(0.9, "#567DA6");
  return gradient;
};

const makeSpaceBackgroundGradient = (CTX, canvasHeight, backgroundColor) => {
  const gradient = CTX.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#000");
  gradient.addColorStop(0.5, backgroundColor);
  return gradient;
};

const makeHawaiiBackgroundTerrainGradient = (CTX, canvasHeight) => {
  const y = canvasHeight * horizon + 12;
  const height = canvasHeight * 0.1;
  const gradient = CTX.createLinearGradient(0, y - height, 0, y);
  gradient.addColorStop(0, "#815962");
  gradient.addColorStop(0.8, "#815962");
  gradient.addColorStop(1, "rgba(129, 89, 98, 0)");
  return [y, gradient, height];
};

export const makeTheme = (state) => {
  const CTX = state.get("CTX");
  const canvasHeight = state.get("canvasHeight");
  const canvasWidth = state.get("canvasWidth");

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

  const drawHawaiiBackground = () => {
    const [y, gradient, height] = makeHawaiiBackgroundTerrainGradient(
      CTX,
      canvasHeight
    );

    CTX.save();
    CTX.fillStyle = gradient;
    CTX.moveTo(0, y);
    CTX.lineTo(0, y - height);
    CTX.lineTo(canvasWidth * 0.1, y - height * 1.1);
    CTX.lineTo(canvasWidth * 0.2, y - height * 0.9);
    CTX.lineTo(canvasWidth * 0.3, y - height * 0.8);
    CTX.lineTo(canvasWidth * 0.4, y);
    CTX.lineTo(0, y);
    CTX.closePath();
    CTX.fill();
    CTX.restore();
  };

  const hawaiiTheme = {
    bodyFontColor: "rgba(255, 255, 255, 0.75)",
    headlineFontColor: "#fff",
    infoFontColor: "#fff",
    background: "#547CA6",
    backgroundGradient: makeHawaiiBackgroundGradient(CTX, canvasHeight),
    drawBackgroundTerrain: drawHawaiiBackground,
    horizon,
    landerGradient: makeLanderGradient(
      CTX,
      "#FFE9DC",
      "#FDD1B6",
      "#5E5B7A",
      "#44354A"
    ),
    toyLanderGradient: (width) =>
      makeLanderGradient(
        CTX,
        "#FFE9DC",
        "#FDD1B6",
        "#5E5B7A",
        "#44354A",
        width
      ),
    asteroid: "#CAA78D",
    star: "#ffffff",
    terrain: "#B28171",
    meterGradient:
      "linear-gradient(90deg, #fdf7c3 0%, #ffab5a 24%, #c08d6c 68%, #6b5a6c 100%)",
  };

  const activeTheme = hawaiiTheme;

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
