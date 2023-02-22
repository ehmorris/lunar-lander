import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander.js";
import { makeStarfield } from "./starfield.js";
import { makeControls } from "./controls.js";
import { makeTerrain } from "./terrain.js";
import { showStatsAndResetControl } from "./stats.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

const lander = makeLander(
  CTX,
  canvasWidth,
  canvasHeight,
  onGameEnd,
  onResetXPos
);
const stars = makeStarfield(CTX, canvasWidth, canvasHeight);
const controls = makeControls(
  CTX,
  lander,
  canvasWidth,
  canvasHeight,
  canvasElement
);
const terrain = makeTerrain(CTX, canvasWidth, canvasHeight);

const animationObject = animate((timeSinceStart) => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  stars.draw();
  terrain.draw();
  controls.drawTouchOverlay();
  lander.draw(timeSinceStart);
});

function onGameEnd(data) {
  showStatsAndResetControl(
    lander,
    animationObject,
    data,
    controls.getHasKeyboard()
  );
}

function onResetXPos() {
  stars.reGenerate();
  terrain.reGenerate();
}
