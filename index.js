import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander/lander.js";
import { makeToyLander } from "./lander/toylander.js";
import { makeStarfield } from "./starfield.js";
import { makeControls } from "./lander/controls.js";
import { makeTerrain } from "./terrain.js";
import { showStatsAndResetControl } from "./stats.js";
import { manageInstructions } from "./instructions.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

const instructions = manageInstructions(onCloseInstructions);
const toyLander = makeToyLander(
  CTX,
  canvasWidth,
  canvasHeight,
  () => instructions.setEngineDone(),
  () => instructions.setLeftRotationDone(),
  () => instructions.setRightRotationDone(),
  () => instructions.setEngineAndRotationDone()
);
const toyLanderControls = makeControls(
  CTX,
  toyLander,
  canvasWidth,
  canvasHeight,
  canvasElement
);
const lander = makeLander(
  CTX,
  canvasWidth,
  canvasHeight,
  onGameEnd,
  onResetXPos
);
const landerControls = makeControls(
  CTX,
  lander,
  canvasWidth,
  canvasHeight,
  canvasElement
);
const stars = makeStarfield(CTX, canvasWidth, canvasHeight);
const terrain = makeTerrain(CTX, canvasWidth, canvasHeight);

if (!instructions.hasClosedInstructions()) {
  instructions.show();
  toyLanderControls.attachEventListeners();
} else {
  landerControls.attachEventListeners();
}

const animationObject = animate((timeSinceStart) => {
  CTX.fillStyle = getComputedStyle(document.body).getPropertyValue(
    "--background-color"
  );
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  stars.draw();
  terrain.draw();

  if (instructions.hasClosedInstructions()) {
    landerControls.drawTouchOverlay();
    lander.draw(timeSinceStart);
  } else {
    toyLander.draw();
  }
});

function onCloseInstructions() {
  toyLanderControls.detachEventListeners();
  landerControls.attachEventListeners();
}

function onGameEnd(data) {
  showStatsAndResetControl(
    lander,
    animationObject,
    data,
    landerControls.getHasKeyboard()
  );
}

function onResetXPos() {
  stars.reGenerate();
  terrain.reGenerate();
}

const backgroundAudio = new Audio("./audio/theme.mp3");
backgroundAudio.loop = true;
document.addEventListener(
  "keydown",
  () => {
    backgroundAudio.play();
  },
  { once: true }
);
document.addEventListener(
  "touchstart",
  () => {
    backgroundAudio.play();
  },
  { once: true }
);
