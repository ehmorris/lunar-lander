import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander.js";
import { makeStarfield } from "./starfield.js";
import { makeControls } from "./controls.js";

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

const animationObject = animate((timeSinceStart) => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);

  stars.draw();
  controls.drawTouchOverlay();
  lander.draw(timeSinceStart);
});

function onGameEnd(data) {
  // Show game-end UI
  document.querySelector(".stats").classList.add("show");
  document.querySelector("#reset").addEventListener("click", resetGame);

  // Delay showing the reset button in case the user is actively tapping
  // in that area for thrust
  setTimeout(() => {
    document.querySelector(".buttons").classList.add("show");
  }, 1000);

  // Fill in game-end data
  document.querySelector(".stats .description").textContent = data.description;
  document.querySelector(".stats .speed").textContent = data.speed;
  document.querySelector(".stats .angle").textContent = data.angle;
  document.querySelector(".stats .duration").textContent =
    data.durationInSeconds;
  document.querySelector(".stats .rotations").textContent = data.rotations;

  if (controls.getHasKeyboard()) {
    document.querySelector("#reset").textContent = "Reset (Spacebar)";
    document.addEventListener("keydown", resetOnSpace);
  }

  if (navigator.canShare) {
    document.querySelector("#share").addEventListener("click", shareSheet);
  } else if (document.querySelector("#share")) {
    document.querySelector("#share").remove();
  }

  function shareSheet() {
    navigator.share({
      text: `Speed: ${data.speed} MPH
Angle: ${data.angle}°
Time: ${data.durationInSeconds}s
Rotations: ${data.rotations}
https://ehmorris.com/lander/`,
    });
  }

  function resetOnSpace({ code }) {
    if (code === "Space") resetGame();
  }

  function resetGame() {
    lander.resetProps();
    animationObject.resetStartTime();
    document.querySelector(".buttons").classList.remove("show");
    document.querySelector(".stats").classList.remove("show");
    if (document.querySelector("#share")) {
      document.querySelector("#share").removeEventListener("click", shareSheet);
    }
    if (controls.getHasKeyboard()) {
      document.removeEventListener("keydown", resetOnSpace);
    }
  }
}

function onResetXPos() {
  stars.reGenerate();
}
