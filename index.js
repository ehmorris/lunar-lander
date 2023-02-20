import { animate, generateCanvas, scoreToLetterGrade } from "./helpers.js";
import { makeLander } from "./lander.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

let hasKeyboard = false;

const lander = makeLander(CTX, canvasWidth, canvasHeight, onGameEnd);

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
  if (key === "ArrowLeft" || key === "ArrowRight") lander.stopRotating();
});

canvasElement.addEventListener("touchstart", (e) => {
  for (let index = 0; index < e.touches.length; index++) {
    const touchLocation = e.touches[index].clientX / canvasWidth;

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
  }

  e.preventDefault();
});

canvasElement.addEventListener("touchmove", (e) => {
  for (let index = 0; index < e.changedTouches.length; index++) {
    const touchLocation = e.changedTouches[index].clientX / canvasWidth;

    if (touchLocation > 0 && touchLocation < 0.25) {
      lander.rotateLeft();
      lander.engineOff();
      showLeftOverlay = true;
      showCenterOverlay = false;
    } else if (touchLocation >= 0.25 && touchLocation <= 0.75) {
      lander.engineOn();
      lander.stopRotating();
      showCenterOverlay = true;
      showLeftOverlay = false;
      showRightOverlay = false;
    } else {
      lander.rotateRight();
      lander.engineOff();
      showRightOverlay = true;
      showCenterOverlay = false;
    }
  }

  e.preventDefault();
});

canvasElement.addEventListener("touchend", (e) => {
  for (let index = 0; index < e.changedTouches.length; index++) {
    const touchLocation = e.changedTouches[index].clientX / canvasWidth;

    if (touchLocation >= 0.25 && touchLocation <= 0.75) {
      lander.engineOff();
      showCenterOverlay = false;
    } else {
      lander.stopRotating();
      showLeftOverlay = false;
      showRightOverlay = false;
    }
  }

  e.preventDefault();
});

const fillInStats = (data) => {
  document.querySelector(".stats .grade").textContent = scoreToLetterGrade(
    data.score
  );
  document.querySelector(".stats .type").textContent = data.type;
  document.querySelector(".stats .percent").textContent = data.score;
  document.querySelector(".stats .speed").textContent = data.speed;
  document.querySelector(".stats .angle").textContent = data.angle;
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
      title: "Lunar Lander",
      text: `${scoreToLetterGrade(data.score)} ${data.type} (${data.score}%)
Speed: ${data.speed} MPH
Angle: ${data.angle}°
Rotations: ${data.rotations}`,
      url: "https://ehmorris.github.io/lunar-lander/",
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

animate((timeSinceStart, timeSinceLastFrame) => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  lander.draw(timeSinceStart, timeSinceLastFrame);

  CTX.save();
  CTX.fillStyle = "rgba(255, 255, 255, 0.07)";
  if (showLeftOverlay) {
    CTX.fillRect(0, 0, canvasWidth * 0.25, canvasHeight);
  }
  if (showCenterOverlay) {
    CTX.fillRect(canvasWidth * 0.25, 0, canvasWidth * 0.55, canvasHeight);
  }
  if (showRightOverlay) {
    CTX.fillRect(canvasWidth * 0.75, 0, canvasWidth * 0.25, canvasHeight);
  }
  CTX.restore();
});
