import {
  animate,
  clampedProgress,
  generateCanvas,
  randomBetween,
  seededRandomBetween,
  seededRandomBool,
  transition,
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
import { makeSpaceAsteroid } from "./spaceAsteroids.js";
import { makeChallengeManager } from "./challenge.js";
import { makeSeededRandom } from "./helpers/seededrandom.js";
import { makeBonusPointsManager } from "./bonuspoints.js";
import { makeTheme } from "./theme.js";
import { TRANSITION_TO_SPACE } from "./helpers/constants.js";
import {
  landingScoreDescription,
  crashScoreDescription,
  destroyedDescription,
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

const theme = makeTheme(appState);
appState.set("theme", theme);

const terrain = makeTerrain(appState);
appState.set("terrain", terrain);

const bonusPointsManager = makeBonusPointsManager(appState);
appState.set("bonusPointsManager", bonusPointsManager);

const stars = makeStarfield(appState);
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
let spaceAsteroids = [];
let randomConfetti = [];

let gameEnded = false;

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

const animationObject = animate((timeSinceStart, deltaTime) => {
  CTX.fillStyle = theme.backgroundGradient;
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);

  // Move stars in parallax as lander flies high
  stars.draw(lander.getVelocity());

  // Move terrain as lander flies high
  CTX.save();
  CTX.translate(
    0,
    transition(
      0,
      terrain.getLandingData().terrainHeight,
      clampedProgress(TRANSITION_TO_SPACE, 0, lander.getPosition().y)
    )
  );
  terrain.draw();
  CTX.restore();

  if (instructions.hasClosedInstructions()) {
    landerControls.drawTouchOverlay();

    bonusPointsManager.draw(lander.getPosition().y < TRANSITION_TO_SPACE);

    // Generate and draw space asteroids
    if (lander.getPosition().y < -canvasHeight * 2) {
      // The chance that an asteroid will be sent is determined by the screen
      // width. This means that the density of asteroids will be similar across
      // phones and wider desktop screens. On a 14" MacBook the chance of an
      // asteroid being sent in any given frame is ~1 in 50; on an iPhone 14
      // it's ~1 in 200, or 1/4 the chance for a screen ~1/4 the width.
      if (
        !gameEnded &&
        Math.round(randomBetween(0, 100 / (canvasWidth / 800))) === 0
      ) {
        spaceAsteroids.push(
          makeSpaceAsteroid(
            appState,
            lander.getVelocity,
            lander.getDisplayPosition,
            onAsteroidImpact
          )
        );
      }

      spaceAsteroids.forEach((a) => a.draw(deltaTime));
    }

    // Move asteroids as lander flies high
    CTX.save();
    CTX.translate(
      0,
      transition(
        0,
        terrain.getLandingData().terrainHeight,
        clampedProgress(TRANSITION_TO_SPACE, 0, lander.getPosition().y)
      )
    );
    if (sendAsteroid && timeSinceStart > asteroidCountdown) {
      asteroids.forEach((a) => a.draw(deltaTime));
    }
    CTX.restore();

    if (randomConfetti.length > 0) {
      randomConfetti.forEach((c) => c.draw(deltaTime));
    }

    lander.draw(timeSinceStart, deltaTime);
  } else {
    toyLander.draw(deltaTime);

    toyLanderControls.drawTouchOverlay();
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
  gameEnded = true;
  landerControls.detachEventListeners();
  bonusPointsManager.hide();

  const finalScore = data.landerScore + bonusPointsManager.getTotalPoints();
  const scoreDescription = data.landed
    ? landingScoreDescription(finalScore)
    : data.struckByAsteroid
    ? destroyedDescription()
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
  gameEnded = false;
  landerControls.attachEventListeners();
  seededRandom.setDailyChallengeSeed();
  randomConfetti = [];
  terrain.reGenerate();
  stars.reGenerate();
  sendAsteroid = seededRandomBool(seededRandom);
  asteroidCountdown = seededRandomBetween(2000, 15000, seededRandom);
  asteroids = [makeAsteroid(appState, lander.getPosition, onAsteroidImpact)];
  spaceAsteroids = [];
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
    sendAsteroid = true;
    asteroidCountdown = 0;
    asteroids.push(
      makeAsteroid(appState, lander.getPosition, onAsteroidImpact)
    );
  }
});
