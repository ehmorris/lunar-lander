import {
  animate,
  generateCanvas,
  randomBetween,
  seededRandomBetween,
  seededRandomBool,
} from "./helpers/helpers.js";
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
import { makeAsteroid } from "./asteroids.js";
import { makeChallengeManager } from "./challenge.js";
import { makeSeededRandom } from "./helpers/seededrandom.js";
import { makeBonusPointsManager } from "./bonuspoints.js";
import {
  landingScoreDescription,
  crashScoreDescription,
} from "./helpers/scoring.js";

// SETUP

const audioManager = makeAudioManager();
const [CTX, canvasWidth, canvasHeight, canvasElement, scaleFactor] =
  generateCanvas({
    width: window.innerWidth,
    height: window.innerHeight,
    attachNode: ".game",
  });
const challengeManager = makeChallengeManager();
const seededRandom = makeSeededRandom();

const appState = makeStateManager()
  .set("CTX", CTX)
  .set("canvasWidth", canvasWidth)
  .set("canvasHeight", canvasHeight)
  .set("canvasElement", canvasElement)
  .set("scaleFactor", scaleFactor)
  .set("audioManager", audioManager)
  .set("challengeManager", challengeManager)
  .set("seededRandom", seededRandom);

const terrain = makeTerrain(appState);
appState.set("terrain", terrain);

const bonusPointsManager = makeBonusPointsManager(appState);
appState.set("bonusPointsManager", bonusPointsManager);

const instructions = manageInstructions(onCloseInstructions);
const toyLander = makeToyLander(
  appState,
  () => instructions.setEngineDone(),
  () => instructions.setLeftRotationDone(),
  () => instructions.setRightRotationDone(),
  () => instructions.setEngineAndRotationDone()
);
const toyLanderControls = makeControls(appState, toyLander, audioManager);
const lander = makeLander(appState, onGameEnd);
const landerControls = makeControls(appState, lander, audioManager);
const tally = makeTallyManger();

let sendAsteroid = seededRandomBool(seededRandom);
let asteroidCountdown = seededRandomBetween(2000, 15000, seededRandom);
let asteroids = [makeAsteroid(appState, lander.getPosition, onAsteroidImpact)];
let randomConfetti = [];

const horizonPoint = 0.72;
const backgroundGradient = CTX.createLinearGradient(0, 0, 0, canvasHeight);
backgroundGradient.addColorStop(0, "#547CA6");
backgroundGradient.addColorStop(horizonPoint - 0.01, "#DB966D");
backgroundGradient.addColorStop(horizonPoint, "#CC9B7A");
backgroundGradient.addColorStop(horizonPoint + 0.01, "#CFBCB1");
backgroundGradient.addColorStop(0.9, "#567DA6");

const backgroundTerrainY = canvasHeight * horizonPoint + 12;
const backgroundTerrainHeight = canvasHeight * 0.1;
const backgroundTerrainGradient = CTX.createLinearGradient(
  0,
  backgroundTerrainY - backgroundTerrainHeight,
  0,
  backgroundTerrainY
);
backgroundTerrainGradient.addColorStop(0, "#815962");
backgroundTerrainGradient.addColorStop(0.8, "#815962");
backgroundTerrainGradient.addColorStop(1, "rgba(129, 89, 98, 0)");

const stars = makeStarfield(appState, horizonPoint * canvasHeight);

// INSTRUCTIONS SHOW/HIDE

if (!instructions.hasClosedInstructions()) {
  instructions.show();
  toyLanderControls.attachEventListeners();
} else {
  landerControls.attachEventListeners();
  challengeManager.populateCornerInfo();
  terrain.setShowLandingSurfaces();
}

// MAIN ANIMATION LOOP

const animationObject = animate((timeSinceStart) => {
  CTX.fillStyle = backgroundGradient;
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  stars.draw();

  CTX.save();
  CTX.fillStyle = backgroundTerrainGradient;
  CTX.moveTo(0, backgroundTerrainY);
  CTX.lineTo(0, backgroundTerrainY - backgroundTerrainHeight);
  CTX.lineTo(
    canvasWidth * 0.1,
    backgroundTerrainY - backgroundTerrainHeight * 1.1
  );
  CTX.lineTo(
    canvasWidth * 0.2,
    backgroundTerrainY - backgroundTerrainHeight * 0.9
  );
  CTX.lineTo(
    canvasWidth * 0.3,
    backgroundTerrainY - backgroundTerrainHeight * 0.8
  );
  CTX.lineTo(canvasWidth * 0.4, backgroundTerrainY);
  CTX.lineTo(0, backgroundTerrainY);
  CTX.closePath();
  CTX.fill();
  CTX.restore();

  terrain.draw();

  if (instructions.hasClosedInstructions()) {
    landerControls.drawTouchOverlay();

    bonusPointsManager.draw();

    if (sendAsteroid && timeSinceStart > asteroidCountdown) {
      asteroids.forEach((a) => a.draw());
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
  terrain.setShowLandingSurfaces();
}

function onGameEnd(data) {
  landerControls.detachEventListeners();
  bonusPointsManager.hide();

  const finalScore = data.landerScore + bonusPointsManager.getTotalPoints();
  const scoreDescription = data.landed
    ? landingScoreDescription(finalScore)
    : crashScoreDescription(finalScore);
  const scoreForDisplay = Intl.NumberFormat().format(finalScore.toFixed(1));

  showStatsAndResetControl(
    appState,
    lander,
    animationObject,
    { ...data, scoreDescription, scoreForDisplay },
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
  landerControls.attachEventListeners();
  seededRandom.setDailyChallengeSeed();
  randomConfetti = [];
  terrain.reGenerate();
  stars.reGenerate();
  sendAsteroid = seededRandomBool(seededRandom);
  asteroidCountdown = seededRandomBetween(2000, 15000, seededRandom);
  asteroids = [makeAsteroid(appState, lander.getPosition, onAsteroidImpact)];
  bonusPointsManager.reset();
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
    asteroidCountdown = 0;
    asteroids.push(
      makeAsteroid(appState, lander.getPosition, onAsteroidImpact)
    );
  }
});
