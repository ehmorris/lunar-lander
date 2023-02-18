import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

const lander = makeLander(CTX, canvasWidth, canvasHeight);

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") lander.engineOn();
  if (key === "ArrowLeft") lander.rotateLeft();
  if (key === "ArrowRight") lander.rotateRight();
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

animate(() => {
  CTX.fillStyle = "#02071E";
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  lander.draw();
});
