import { randomBetween } from "./helpers.js";

export const makeTerrain = (CTX, canvasWidth, canvasHeight) => {
  let terrain = [];
  const maxHeight = 10;
  const minHeight = 5;
  const points = Math.max(canvasWidth / 60, 20);

  const reGenerate = () => {
    terrain = [];

    for (let index = 1; index < points; index++) {
      terrain.push({
        x: index * (canvasWidth / points),
        y: randomBetween(canvasHeight - minHeight, canvasHeight - maxHeight),
      });
    }
  };
  reGenerate();

  const draw = () => {
    CTX.save();
    CTX.fillStyle = "#A2A4A1";
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
