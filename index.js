import { animate, generateCanvas, roundToNDigits } from "./helpers.js";
import { makeLander } from "./lander.js";
import { spawnEntityGraph } from "./smallgraph.js";

const [canvasWidth, canvasHeight] = [window.innerWidth, window.innerHeight];
const CTX = generateCanvas({
  width: canvasWidth,
  height: canvasHeight,
  attachNode: ".game",
});

const lander = makeLander(CTX, canvasWidth, canvasHeight);

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") lander.engineOn();
  if (key === "ArrowLeft") lander.rotateLeft();
  if (key === "ArrowRight") lander.rotateRight();
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "ArrowUp") lander.engineOff();
  if (key === "ArrowLeft" || key === "ArrowRight") lander.stopRotating();
});

document.addEventListener("touchstart", ({ touches }) => {
  for (let index = 0; index < touches.length; index++) {
    const touchLocation = touches[index].clientX / canvasWidth;

    if (touchLocation > 0 && touchLocation < 0.33) {
      lander.rotateLeft();
    } else if (touchLocation >= 0.33 && touchLocation <= 0.66) {
      lander.engineOn();
    } else {
      lander.rotateRight();
    }
  }
});

document.addEventListener("touchend", ({ changedTouches }) => {
  for (let index = 0; index < changedTouches.length; index++) {
    const touchLocation = changedTouches[index].clientX / canvasWidth;

    if (touchLocation >= 0.33 && touchLocation <= 0.66) {
      lander.engineOff();
    } else {
      lander.stopRotating();
    }
  }
});

animate(() => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  lander.draw();
});

// OBSERVABILITY

const SPEED_FACTOR = 15;
const SPEED_BOUND = 20;
spawnEntityGraph({
  attachNode: ".stats",
  getNumerator: () => lander.getVelocity().y,
  getDenominator: () => SPEED_BOUND / SPEED_FACTOR,
  topLabel: "SPEED",
  getBottomLabel: () =>
    `${roundToNDigits(lander.getVelocity().y * SPEED_FACTOR, 0)}MPH`,
  backgroundColor: "#000",
  fillColor: "white",
  style: "posneg",
});
