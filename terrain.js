import { randomBetween, randomBool } from "./helpers/helpers.js";

export const makeTerrain = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const maxHeight = 10;
  const minHeight = 5;
  const points = Math.max(canvasWidth / 60, 20);
  const backgroundImage = new Image();
  backgroundImage.src = "./images/surfacerepeat.jpg";

  let backgroundPattern;
  let terrain = [];

  const getBackgroundPattern = () =>
    new Promise((resolve) => {
      backgroundImage.complete
        ? resolve(backgroundPattern)
        : (backgroundImage.onload = () => {
            backgroundPattern = CTX.createPattern(backgroundImage, "repeat");
            resolve(backgroundPattern);
          });
    });

  async function reGenerate() {
    terrain = [];
    const pattern = await getBackgroundPattern();

    pattern.setTransform(
      new DOMMatrix()
        .scale(randomBetween(0.7, 0.9))
        .rotate(randomBool() ? 0 : 180)
    );

    for (let index = 1; index < points; index++) {
      terrain.push({
        x: index * (canvasWidth / points),
        y: randomBetween(canvasHeight - minHeight, canvasHeight - maxHeight),
      });
    }
  }
  reGenerate();

  const draw = () => {
    CTX.save();
    CTX.fillStyle = backgroundPattern;
    CTX.beginPath();
    CTX.moveTo(0, canvasHeight);
    CTX.lineTo(0, canvasHeight - maxHeight / 2);
    terrain.forEach((point) => {
      CTX.lineTo(point.x, point.y);
    });
    CTX.lineTo(canvasWidth, canvasHeight - maxHeight / 2);
    CTX.lineTo(canvasWidth, canvasHeight);
    CTX.closePath();
    CTX.fill();
    CTX.restore();
  };

  return { draw, reGenerate };
};
