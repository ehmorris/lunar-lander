import { animate, generateCanvas, roundToNDigits } from "./helpers.js";
import { makeLander } from "./lander.js";
import { makeExplosionPiece } from "./explosion.js";
import { spawnEntityGraph } from "./smallgraph.js";

const [canvasWidth, canvasHeight] = [window.innerWidth, window.innerHeight / 2];
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

let crashed = false;
let explosionPieces = false;

animate(() => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!crashed) {
    lander.draw();
    crashed = lander.isGrounded() && lander.readOnlyProps.velocity.y > 0.4;
  } else {
    if (!explosionPieces) {
      explosionPieces = new Array(10)
        .fill()
        .map(() =>
          makeExplosionPiece(
            CTX,
            lander.readOnlyProps.position.x,
            lander.readOnlyProps.velocity,
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
  getNumerator: () => lander.readOnlyProps.velocity.y,
  getDenominator: () => SPEED_BOUND / SPEED_FACTOR,
  topLabel: "SPEED",
  getBottomLabel: () =>
    `${roundToNDigits(lander.readOnlyProps.velocity.y * SPEED_FACTOR, 0)}MPH`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "posneg",
});
