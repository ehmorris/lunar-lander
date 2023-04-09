import { randomBetween } from "./helpers/helpers.js";

export const makeStarfield = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const theme = state.get("theme");
  let stars = [];

  const randomNoise = (amount) => {
    let noiseArray = [];
    for (let index = 0; index < amount; index++) {
      noiseArray.push({
        size: randomBetween(0.5, 1.5),
        opacity: randomBetween(0.1, 1),
        position: {
          x: Math.random() * canvasWidth,
          y: randomBetween(
            0,
            theme.horizon ? theme.horizon * canvasHeight : canvasHeight
          ),
        },
      });
    }
    return noiseArray;
  };

  const reGenerate = () => {
    stars = randomNoise((canvasWidth * canvasHeight) / 6000);
  };
  reGenerate();

  const draw = () => {
    stars.forEach(({ size, opacity, position }) => {
      CTX.save();
      CTX.globalAlpha = opacity;
      CTX.fillStyle = state.get("theme").star;
      CTX.beginPath();
      CTX.arc(position.x, position.y, size, 0, Math.PI * 2);
      CTX.closePath();
      CTX.fill();
      CTX.restore();
    });
  };

  return { draw, reGenerate };
};
