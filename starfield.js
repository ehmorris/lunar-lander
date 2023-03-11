import { randomBetween } from "./helpers/helpers.js";

export const makeStarfield = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  let stars = [];

  const randomNoise = (amount) => {
    let noiseArray = [];
    for (let index = 0; index < amount; index++) {
      noiseArray.push({
        size: randomBetween(0.5, 1.5),
        opacity: randomBetween(0.1, 1),
        position: {
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
        },
      });
    }
    return noiseArray;
  };

  const reGenerate = () => {
    stars = randomNoise((canvasWidth * canvasHeight) / 6000);
  };
  reGenerate();

  const drawGalaxyShape = () => {
    const galaxyHeight = canvasHeight * 0.5;

    CTX.save();
    CTX.fillStyle = "#03081F";
    CTX.beginPath();
    CTX.moveTo(0, canvasHeight / 2 - galaxyHeight * 0.25);
    CTX.bezierCurveTo(
      canvasWidth * 0.33,
      canvasHeight / 2 - galaxyHeight * 0.5,
      canvasWidth * 0.66,
      canvasHeight / 2 - galaxyHeight * 0.5,
      canvasWidth,
      canvasHeight / 2 - galaxyHeight * 0.25
    );
    CTX.lineTo(canvasWidth, canvasHeight / 2 + galaxyHeight * 0.25);
    CTX.bezierCurveTo(
      canvasWidth * 0.66,
      canvasHeight / 2 + galaxyHeight * 0.5,
      canvasWidth * 0.33,
      canvasHeight / 2 + galaxyHeight * 0.5,
      0,
      canvasHeight / 2 + galaxyHeight * 0.25
    );
    CTX.closePath();
    CTX.fill();
    CTX.restore();
  };

  const backgroundNoise = randomNoise((canvasWidth * canvasHeight) / 50);
  const draw = () => {
    CTX.save();
    drawGalaxyShape();
    stars.forEach(({ size, opacity, position }) => {
      CTX.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      CTX.beginPath();
      CTX.arc(position.x, position.y, size, 0, Math.PI * 2);
      CTX.closePath();
      CTX.fill();
    });
    backgroundNoise.forEach(({ position }) => {
      CTX.fillStyle = `rgba(255, 255, 255, .015)`;
      CTX.fillRect(position.x, position.y, 2, 2);
    });
    CTX.restore();
  };

  return { draw, reGenerate };
};
