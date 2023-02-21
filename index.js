import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander.js";
import { makeStarfield } from "./starfield.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

let hasKeyboard = false;

const lander = makeLander(
  CTX,
  canvasWidth,
  canvasHeight,
  onGameEnd,
  onResetXPos
);
const stars = makeStarfield(CTX, canvasWidth, canvasHeight);

let showCenterOverlay = false;
let showRightOverlay = false;
let showLeftOverlay = false;

// Gameplay controls
document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") lander.engineOn();
  if (key === "ArrowLeft") lander.rotateLeft();
  if (key === "ArrowRight") lander.rotateRight();
  hasKeyboard = true;
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "ArrowUp") lander.engineOff();
  if (key === "ArrowLeft") lander.stopLeftRotation();
  if (key === "ArrowRight") lander.stopRightRotation();
});

const activateTouchZone = (touch) => {
  const touchLocation = touch.clientX / canvasWidth;

  if (touchLocation > 0 && touchLocation < 0.25) {
    lander.rotateLeft();
    showLeftOverlay = true;
  } else if (touchLocation >= 0.25 && touchLocation <= 0.75) {
    lander.engineOn();
    showCenterOverlay = true;
  } else {
    lander.rotateRight();
    showRightOverlay = true;
  }
};

canvasElement.addEventListener("touchstart", (e) => {
  for (let index = 0; index < e.touches.length; index++) {
    const touchLocation = e.touches[index].clientX / canvasWidth;
    activateTouchZone(e.touches[index]);
  }

  e.preventDefault();
});

canvasElement.addEventListener("touchmove", (e) => {
  lander.engineOff();
  lander.stopLeftRotation();
  lander.stopRightRotation();
  showCenterOverlay = false;
  showLeftOverlay = false;
  showRightOverlay = false;

  for (let index = 0; index < e.touches.length; index++) {
    activateTouchZone(e.touches[index]);
  }

  e.preventDefault();
});

canvasElement.addEventListener("touchend", (e) => {
  for (let index = 0; index < e.changedTouches.length; index++) {
    const touchLocation = e.changedTouches[index].clientX / canvasWidth;

    if (touchLocation > 0 && touchLocation < 0.25) {
      lander.stopLeftRotation();
      showLeftOverlay = false;
    } else if (touchLocation >= 0.25 && touchLocation <= 0.75) {
      lander.engineOff();
      showCenterOverlay = false;
    } else {
      lander.stopRightRotation();
      showRightOverlay = false;
    }
  }

  e.preventDefault();
});

const fillInStats = (data) => {
  document.querySelector(".stats .description").textContent = data.description;
  document.querySelector(".stats .speed").textContent = data.speed;
  document.querySelector(".stats .angle").textContent = data.angle;
  document.querySelector(".stats .duration").textContent =
    data.durationInSeconds;
  document.querySelector(".stats .rotations").textContent = data.rotations;
};

// End game controls
function onGameEnd(data) {
  document.querySelector(".buttons").classList.add("show");
  document.querySelector(".stats").classList.add("show");
  fillInStats(data);

  document.querySelector("#reset").addEventListener("click", resetGame);

  if (hasKeyboard) {
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
      title: "Lander",
      text: `Speed: ${data.speed} MPH
Angle: ${data.angle}°
Time: ${data.durationInSeconds}s
Rotations: ${data.rotations}`,
      url: "https://ehmorris.com/lander/",
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
    if (hasKeyboard) {
      document.removeEventListener("keydown", resetOnSpace);
    }
  }
}

function onResetXPos() {
  stars.reGenerate();
}

animate((timeSinceStart, timeSinceLastFrame) => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  stars.draw();

  lander.draw(timeSinceStart, timeSinceLastFrame);

  CTX.save();
  CTX.fillStyle = "rgba(255, 255, 255, 0.07)";
  if (showLeftOverlay) {
    CTX.fillRect(0, 0, canvasWidth * 0.25, canvasHeight);
  }
  if (showCenterOverlay) {
    CTX.fillRect(canvasWidth * 0.25, 0, canvasWidth * 0.5, canvasHeight);
  }
  if (showRightOverlay) {
    CTX.fillRect(canvasWidth * 0.75, 0, canvasWidth * 0.25, canvasHeight);
  }
  CTX.restore();
});
