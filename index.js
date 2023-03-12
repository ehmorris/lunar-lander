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
import { makeTallyManger } from "./tally.js";
import { launchAsteroid } from "./asteroids.js";
import { makeChallengeManager } from "./challenge.js";

// SETUP

const audioManager = makeAudioManager();
const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});
const challengeManager = makeChallengeManager();

const appState = makeStateManager()
  .set("CTX", CTX)
  .set("canvasWidth", canvasWidth)
  .set("canvasHeight", canvasHeight)
  .set("canvasElement", canvasElement)
  .set("audioManager", audioManager)
  .set("challengeManager", challengeManager);

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
const landerControls = makeControls(appState, lander, audioManager);
const stars = makeStarfield(appState);
const terrain = makeTerrain(appState);
const tally = makeTallyManger();
const asteroidCountdown = randomBetween(2000, 15000);
let asteroids = [];
let randomConfetti = [];

const backgroundGradient = CTX.createLinearGradient(0, 0, 0, canvasHeight);
backgroundGradient.addColorStop(0, "#000");
backgroundGradient.addColorStop(
  0.5,
  getComputedStyle(document.body).getPropertyValue("--background-color")
);

// INSTRUCTIONS SHOW/HIDE

if (!instructions.hasClosedInstructions()) {
  instructions.show();
  toyLanderControls.attachEventListeners();
} else {
  landerControls.attachEventListeners();
  challengeManager.populateCornerInfo();
}

// MAIN ANIMATION LOOP

const animationObject = animate((timeSinceStart) => {
  CTX.fillStyle = backgroundGradient;
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  stars.draw();
  terrain.draw();

  if (instructions.hasClosedInstructions()) {
    landerControls.drawTouchOverlay();

    if (asteroids.length > 0) {
      asteroids.forEach((a) => a.draw());
    } else if (timeSinceStart > asteroidCountdown) {
      asteroids = [
        launchAsteroid(appState, lander.getPosition, onAsteroidImpact),
      ];
    }

    if (randomConfetti.length > 0) {
      randomConfetti.forEach((c) => c.draw());
    }

    lander.draw(timeSinceStart);
  } else {
    toyLander.draw();
  }
});

// PASSED FUNCTIONS

function onCloseInstructions() {
  toyLanderControls.detachEventListeners();
  landerControls.attachEventListeners();
  challengeManager.populateCornerInfo();
}

function onGameEnd(data) {
  showStatsAndResetControl(
    appState,
    lander,
    animationObject,
    data,
    landerControls.getHasKeyboard(),
    onResetGame
  );

  if (data.landed) {
    audioManager.playLanding();
    tally.storeLanding();
  } else {
    audioManager.playCrash();
    tally.storeCrash();
  }

  tally.updateDisplay();
}

function onResetGame() {
  randomConfetti = [];
  asteroids = [];
}

function onResetXPos() {
  stars.reGenerate();
  terrain.reGenerate();
}

function onAsteroidImpact(asteroidVelocity) {
  lander.destroy(asteroidVelocity);
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

document.addEventListener("keydown", ({ key }) => {
  if (key === "m") {
    asteroids.push(
      launchAsteroid(appState, lander.getPosition, onAsteroidImpact)
    );
  }
});
