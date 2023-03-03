import { animate, generateCanvas, randomBetween } from "./helpers/helpers.js";
import { makeLander } from "./lander/lander.js";
import { makeToyLander } from "./lander/toylander.js";
import { makeStarfield } from "./starfield.js";
import { makeControls } from "./lander/controls.js";
import { makeTerrain } from "./terrain.js";
import { showStatsAndResetControl } from "./stats.js";
import { manageInstructions } from "./instructions.js";
import { makeAudioManager } from "./helpers/audio.js";
import { makeStateManager } from "./helpers/state.js";
import { makeConfetti } from "./lander/confetti.js";
import { INACTIVE_DURATION } from "./helpers/constants.js";

// SETUP

const audioManager = makeAudioManager();
const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

const appState = makeStateManager()
  .set("CTX", CTX)
  .set("canvasWidth", canvasWidth)
  .set("canvasHeight", canvasHeight)
  .set("canvasElement", canvasElement)
  .set("audioManager", audioManager);

const instructions = manageInstructions(onCloseInstructions);
const toyLander = makeToyLander(
  appState,
  () => instructions.setEngineDone(),
  () => instructions.setLeftRotationDone(),
  () => instructions.setRightRotationDone(),
  () => instructions.setEngineAndRotationDone()
);
const toyLanderControls = makeControls(appState, toyLander, audioManager);
const lander = makeLander(appState, onGameEnd, onResetXPos);
const landerControls = makeControls(
  appState,
  lander,
  audioManager,
  onLanderInput
);
const stars = makeStarfield(appState);
const terrain = makeTerrain(appState);
const randomConfetti = [];

let lastInput = false;
let pausedDueToNoInput = false;

// INSTRUCTIONS SHOW/HIDE

if (!instructions.hasClosedInstructions()) {
  instructions.show();
  toyLanderControls.attachEventListeners();
} else {
  landerControls.attachEventListeners();
}

// MAIN ANIMATION LOOP

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

  if (randomConfetti.length > 0) {
    randomConfetti.forEach((c) => c.draw());
  }

  if (
    lastInput &&
    !pausedDueToNoInput &&
    Date.now() - lastInput > INACTIVE_DURATION
  ) {
    audioManager.pauseTheme();
    pausedDueToNoInput = true;
  } else if (pausedDueToNoInput && Date.now() - lastInput < INACTIVE_DURATION) {
    audioManager.playTheme();
    pausedDueToNoInput = false;
  }
});

// PASSED FUNCTIONS

function onLanderInput() {
  lastInput = Date.now();
}

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

  data.landed ? audioManager.playLanding() : audioManager.playCrash();
}

function onResetXPos() {
  stars.reGenerate();
  terrain.reGenerate();
}

// EXTRAS

document.addEventListener("keydown", ({ key }) => {
  if (key === "c") {
    randomConfetti.push(
      makeConfetti(appState, 10, {
        x: randomBetween(0, canvasWidth),
        y: randomBetween(0, canvasHeight),
      })
    );
  }
});
