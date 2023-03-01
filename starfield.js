import { randomBetween } from "./helpers.js";

export const makeStarfield = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  let stars = [];

  const reGenerate = () => {
    stars = [];
    const volume = (canvasWidth * canvasHeight) / 6000;
    for (let index = 0; index < volume; index++) {
      stars.push({
        size: randomBetween(0.5, 1.5),
        opacity: randomBetween(0.1, 1),
        position: {
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
        },
      });
    }
  };
  reGenerate();

  const draw = () => {
    CTX.save();
    stars.forEach((star) => {
      CTX.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      CTX.beginPath();
      CTX.arc(star.position.x, star.position.y, star.size, 0, Math.PI * 2);
      CTX.closePath();
      CTX.fill();
    });
    CTX.restore();
  };

  return { draw, reGenerate };
};
