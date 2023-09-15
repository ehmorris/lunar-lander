import { transition, randomBetween } from "./helpers/helpers.js";

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
        opacity: randomBetween(0.1, 1),
        position: {
          x: Math.random() * canvasWidth,
          y: randomBetween(0, canvasHeight),
        },
        distance: Math.random(), // higher number is closer/bigger
      });
    }
    return noiseArray;
  };

  const reGenerate = () => {
    stars = randomNoise((canvasWidth * canvasHeight) / 6000);
  };
  reGenerate();

  const draw = (velocity) => {
    stars.forEach(({ distance, opacity, position }) => {
      position.y =
        position.y > canvasHeight
          ? 0
          : position.y < 0
          ? canvasHeight
          : position.y - (velocity.y * distance) / 10;

      CTX.save();
      CTX.globalAlpha = opacity;
      CTX.fillStyle = state.get("theme").star;
      CTX.beginPath();
      CTX.arc(
        position.x,
        position.y,
        transition(0.2, 1.5, distance),
        0,
        Math.PI * 2
      );
      CTX.closePath();
      CTX.fill();
      CTX.restore();
    });
  };

  return { draw, reGenerate };
};
