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
const tally = makeTallyManger();

let sendAsteroid = seededRandomBool(seededRandom);
let asteroidCountdown = seededRandomBetween(2000, 15000, seededRandom);
let asteroids = [makeAsteroid(appState, lander.getPosition, onAsteroidImpact)];
let spaceAsteroids = [];
let randomConfetti = [];

let gameEnded = false;

// Track multiple players
let players = {};

// Define landerControls in a scope accessible to all functions
let landerControls;

// Establish WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
  console.log('Connected to WebSocket server');

  // Generate a unique player ID
  const playerId = `player-${Math.random().toString(36).substr(2, 9)}`;

  // Create a lander for the current player
  players[playerId] = makeLander(appState, onGameEnd);

  // Ensure the current player controls their own lander
  const currentPlayerLander = players[playerId];

  // Initialize controls for the current player's lander
  landerControls = makeControls(appState, currentPlayerLander, audioManager, sendMessage);

  // Send a join message to the server
  sendMessage({ type: 'join', playerId });

  // Start the animation loop
  const animationObject = animate((timeSinceStart, deltaTime) => {
    CTX.fillStyle = theme.backgroundGradient;
    CTX.fillRect(0, 0, canvasWidth, canvasHeight);

    stars.draw(currentPlayerLander.getVelocity());

    CTX.save();
    CTX.translate(
      0,
      transition(
        0,
        terrain.getLandingData().terrainHeight,
        clampedProgress(TRANSITION_TO_SPACE, 0, currentPlayerLander.getPosition().y)
      )
    );
    terrain.draw();
    CTX.restore();

    if (instructions.hasClosedInstructions()) {
      landerControls.drawTouchOverlay();
      bonusPointsManager.draw(currentPlayerLander.getPosition().y < TRANSITION_TO_SPACE);

      if (currentPlayerLander.getPosition().y < -canvasHeight * 2) {
        if (!gameEnded && Math.round(randomBetween(0, 100 / (canvasWidth / 800))) === 0) {
          spaceAsteroids.push(
            makeSpaceAsteroid(
              appState,
              currentPlayerLander.getVelocity,
              currentPlayerLander.getDisplayPosition,
              onAsteroidImpact
            )
          );
        }

        spaceAsteroids.forEach((a) => a.draw(deltaTime));
      }

      CTX.save();
      CTX.translate(
        0,
        transition(
          0,
          terrain.getLandingData().terrainHeight,
          clampedProgress(TRANSITION_TO_SPACE, 0, currentPlayerLander.getPosition().y)
        )
      );
      if (sendAsteroid && timeSinceStart > asteroidCountdown) {
        asteroids.forEach((a) => a.draw(deltaTime));
      }
      CTX.restore();

      if (randomConfetti.length > 0) {
        randomConfetti.forEach((c) => c.draw(deltaTime));
      }

      // Draw each player's lander
      Object.values(players).forEach((playerLander) => {
        playerLander.draw(timeSinceStart, deltaTime);
      });
    } else {
      toyLander.draw(deltaTime);
      toyLanderControls.drawTouchOverlay();
    }
  });
});

// Function to send messages to the server
function sendMessage(message) {
  socket.send(JSON.stringify(message));
}

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

// Function to check for collisions between two landers
function checkCollision(lander1, lander2) {
  const pos1 = lander1.getPosition();
  const pos2 = lander2.getPosition();
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  const collisionDistance = LANDER_WIDTH; // Assuming landers are circular for simplicity
  return distance < collisionDistance;
}

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
