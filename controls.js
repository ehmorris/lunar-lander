export const makeControls = (
  CTX,
  lander,
  canvasWidth,
  canvasHeight,
  canvasElement
) => {
  let showCenterOverlay = false;
  let showRightOverlay = false;
  let showLeftOverlay = false;
  let hasKeyboard = false;

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

  const drawTouchOverlay = () => {
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
  };

  return {
    drawTouchOverlay,
    getHasKeyboard: () => hasKeyboard,
  };
};
