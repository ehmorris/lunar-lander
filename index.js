import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

let hasKeyboard = false;

const lander = makeLander(CTX, canvasWidth, canvasHeight, onLand, onCrash);

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

    if (touchLocation > 0 && touchLocation < 0.33) {
      lander.rotateLeft();
    } else if (touchLocation >= 0.33 && touchLocation <= 0.66) {
      lander.engineOn();
    } else {
      lander.rotateRight();
    }
  }

  e.preventDefault();
});

canvasElement.addEventListener("touchmove", (e) => {
  for (let index = 0; index < e.changedTouches.length; index++) {
    const touchLocation = e.changedTouches[index].clientX / canvasWidth;

    if (touchLocation > 0 && touchLocation < 0.33) {
      lander.rotateLeft();
      lander.engineOff();
    } else if (touchLocation >= 0.33 && touchLocation <= 0.66) {
      lander.engineOn();
      lander.stopRotating();
    } else {
      lander.rotateRight();
      lander.engineOff();
    }
  }

  e.preventDefault();
});

canvasElement.addEventListener("touchend", (e) => {
  for (let index = 0; index < e.changedTouches.length; index++) {
    const touchLocation = e.changedTouches[index].clientX / canvasWidth;

    if (touchLocation >= 0.33 && touchLocation <= 0.66) {
      lander.engineOff();
    } else {
      lander.stopRotating();
    }
  }

  e.preventDefault();
});

// End game controls
const showDialogControls = (eventDesc, eventType, type, speed, angle) => {
  document.querySelector(".buttons").classList.add("show");

  if (hasKeyboard) {
    document.querySelector("#reset").textContent = "Reset (Spacebar)";
    document.addEventListener("keydown", resetOnSpace);
  }

  if (navigator.canShare) {
    document.querySelector("#share").addEventListener("click", shareSheet);
  } else if (document.querySelector("#share")) {
    document.querySelector("#share").remove();
  }

  document.querySelector("#reset").addEventListener("click", resetGame);

  function shareSheet() {
    navigator.share({
      title: "Lunar Lander",
      text: `I ${eventDesc}!
${type} ${eventType}
Speed: ${speed} MPH
Angle: ${angle}°`,
      url: "https://ehmorris.github.io/lunar-lander/",
    });
  }

  function resetOnSpace({ code }) {
    if (code === "Space") resetGame();
  }

  function resetGame() {
    lander.resetProps();
    document.querySelector(".buttons").classList.remove("show");
    if (document.querySelector("#share")) {
      document.querySelector("#share").href = "#";
      document.querySelector("#share").removeEventListener("click", shareSheet);
    }
    if (hasKeyboard) {
      document.removeEventListener("keydown", resetOnSpace);
    }
  }
};

function onLand(type, speed, angle) {
  showDialogControls("landed", "landing", type, speed, angle);
}

function onCrash(type, speed, angle) {
  showDialogControls("crashed", "crash", type, speed, angle);
}

animate(() => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  lander.draw();
});
