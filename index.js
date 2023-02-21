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
const controls = makeControls(lander, canvasWidth, canvasElement);

function onGameEnd(data) {
  // Show game-end UI
  document.querySelector(".buttons").classList.add("show");
  document.querySelector(".stats").classList.add("show");
  document.querySelector("#reset").addEventListener("click", resetGame);

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

animate((timeSinceStart, timeSinceLastFrame, resetStartTime) => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);

  stars.draw();
  lander.draw(timeSinceStart, timeSinceLastFrame, resetStartTime);

  CTX.save();
  CTX.fillStyle = "rgba(255, 255, 255, 0.07)";
  if (controls.getShowLeftOverlay()) {
    CTX.fillRect(0, 0, canvasWidth * 0.25, canvasHeight);
  }
  if (controls.getShowCenterOverlay()) {
    CTX.fillRect(canvasWidth * 0.25, 0, canvasWidth * 0.5, canvasHeight);
  }
  if (controls.getShowRightOverlay()) {
    CTX.fillRect(canvasWidth * 0.75, 0, canvasWidth * 0.25, canvasHeight);
  }
  CTX.restore();
});
