import { animate, generateCanvas, roundToNDigits } from "./helpers.js";
import { makeLander } from "./lander.js";
import { makeExplosionPiece } from "./explosion.js";
import { spawnEntityGraph } from "./smallgraph.js";

const [canvasWidth, canvasHeight] = [
  window.innerWidth,
  window.innerHeight * 0.75,
];
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
  const touchLocation = touches[0].clientX / canvasWidth;

  if (touchLocation > 0 && touchLocation < 0.33) {
    lander.rotateLeft();
  } else if (touchLocation >= 0.33 && touchLocation <= 0.66) {
    lander.engineOn();
  } else {
    lander.rotateRight();
  }
});

document.addEventListener("touchend", () => {
  lander.engineOff();
  lander.stopRotating();
});

// Prevent iOS text selection
["touchstart", "touchmove", "touchend", "touchcancel"].forEach((t) =>
  window.addEventListener(t, (e) => e.preventDefault())
);

let crashed = false;
let explosionPieces = false;
let lastVelocity;
let lastAngle;
let lastPosition;

animate(() => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!crashed) {
    lander.draw();
    crashed =
      lander.isGrounded() &&
      (lastVelocity.y > 0.4 ||
        Math.abs((lastAngle * 180) / Math.PI - 360) > 10);
  }

  if (!crashed) {
    lastVelocity = lander.getVelocity();
    lastPosition = lander.getPosition();
    lastAngle = lander.getAngle();
  } else {
    if (!explosionPieces) {
      explosionPieces = new Array(10)
        .fill()
        .map(() =>
          makeExplosionPiece(
            CTX,
            lastPosition.x,
            lastVelocity,
            canvasWidth,
            canvasHeight
          )
        );
    } else {
      explosionPieces.forEach((e) => e.draw());
    }
  }
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
  backgroundColor: "#999",
  fillColor: "white",
  style: "posneg",
});
