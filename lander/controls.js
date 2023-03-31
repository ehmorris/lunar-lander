export const makeControls = (state, lander, audioManager) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const canvasElement = state.get("canvasElement");
  const allActiveTouches = new Set();
  const touchColumnMap = ["left", "center", "center", "right"];

  let showCenterOverlay = false;
  let showRightOverlay = false;
  let showLeftOverlay = false;
  let hasKeyboard = false;

  function onKeyDown({ key }) {
    if (key === "w" || key === "ArrowUp") {
      lander.engineOn();
      audioManager.playEngineSound();
    }
    if (key === "a" || key === "ArrowLeft") {
      lander.rotateLeft();
      audioManager.playBoosterSound1();
    }
    if (key === "d" || key === "ArrowRight") {
      lander.rotateRight();
      audioManager.playBoosterSound2();
    }
    hasKeyboard = true;
  }

  function onKeyUp({ key }) {
    if (key === "w" || key === "ArrowUp") {
      lander.engineOff();
      audioManager.stopEngineSound();
    }
    if (key === "a" || key === "ArrowLeft") {
      lander.stopLeftRotation();
      audioManager.stopBoosterSound1();
    }
    if (key === "d" || key === "ArrowRight") {
      lander.stopRightRotation();
      audioManager.stopBoosterSound2();
    }
  }

  const activateTouchZone = (zoneName) => {
    if (zoneName === "left") {
      lander.rotateLeft();
      audioManager.playBoosterSound1();
      showLeftOverlay = true;
    } else if (zoneName === "center") {
      lander.engineOn();
      audioManager.playEngineSound();
      showCenterOverlay = true;
    } else {
      lander.rotateRight();
      audioManager.playBoosterSound2();
      showRightOverlay = true;
    }
  };

  const deactivateTouchZone = (zoneName) => {
    if (zoneName === "left") {
      lander.stopLeftRotation();
      audioManager.stopBoosterSound1();
      showLeftOverlay = false;
    } else if (zoneName === "center") {
      lander.engineOff();
      audioManager.stopEngineSound();
      showCenterOverlay = false;
    } else {
      lander.stopRightRotation();
      audioManager.stopBoosterSound2();
      showRightOverlay = false;
    }
  };

  const getTouchZone = (x) => {
    const clampedColumnNumber = Math.max(
      0,
      Math.min(
        Math.floor(x / (canvasWidth / touchColumnMap.length)),
        touchColumnMap.length
      )
    );

    return touchColumnMap[clampedColumnNumber];
  };

  const getColumnBoundary = (colName) => {
    const start =
      touchColumnMap.findIndex((e) => e === colName) / touchColumnMap.length;
    const end =
      (touchColumnMap.findLastIndex((e) => e === colName) + 1) /
      touchColumnMap.length;

    return {
      startPixel: start * canvasWidth,
      widthInPixels: (end - start) * canvasWidth,
    };
  };

  function onTouchStart(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      activateTouchZone(getTouchZone(e.changedTouches[index].clientX));
      allActiveTouches.add(e.changedTouches[index]);
    }

    if (e.cancelable) e.preventDefault();
  }

  function onTouchMove(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      let touchPreviousData;
      allActiveTouches.forEach((touch) => {
        if (touch.identifier === e.changedTouches[index].identifier) {
          touchPreviousData = touch;
        }
      });
      const previousTouchZone = getTouchZone(touchPreviousData.clientX);
      const currentTouchZone = getTouchZone(e.changedTouches[index].clientX);

      if (previousTouchZone !== currentTouchZone) {
        deactivateTouchZone(previousTouchZone);
        activateTouchZone(currentTouchZone);
        allActiveTouches.delete(touchPreviousData);
        allActiveTouches.add(e.changedTouches[index]);
      }
    }

    if (e.cancelable) e.preventDefault();
  }

  function onTouchEnd(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      deactivateTouchZone(getTouchZone(e.changedTouches[index].clientX));

      allActiveTouches.forEach((touch) => {
        if (touch.identifier === e.changedTouches[index].identifier) {
          allActiveTouches.delete(touch);
        }
      });
    }

    if (e.cancelable) e.preventDefault();
  }

  const attachEventListeners = () => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvasElement.addEventListener("touchstart", onTouchStart);
    canvasElement.addEventListener("touchmove", onTouchMove);
    canvasElement.addEventListener("touchend", onTouchEnd);
  };

  const detachEventListeners = () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    canvasElement.removeEventListener("touchstart", onTouchStart);
    canvasElement.removeEventListener("touchmove", onTouchMove);
    canvasElement.removeEventListener("touchend", onTouchEnd);
  };

  const drawTouchOverlay = () => {
    CTX.save();
    CTX.fillStyle = "rgba(255, 255, 255, 0.07)";
    if (showLeftOverlay) {
      const { startPixel, widthInPixels } = getColumnBoundary("left");
      CTX.fillRect(startPixel, 0, widthInPixels, canvasHeight);
    }
    if (showCenterOverlay) {
      const { startPixel, widthInPixels } = getColumnBoundary("center");
      CTX.fillRect(startPixel, 0, widthInPixels, canvasHeight);
    }
    if (showRightOverlay) {
      const { startPixel, widthInPixels } = getColumnBoundary("right");
      CTX.fillRect(startPixel, 0, widthInPixels, canvasHeight);
    }
    CTX.restore();
  };

  return {
    drawTouchOverlay,
    attachEventListeners,
    detachEventListeners,
    getHasKeyboard: () => hasKeyboard,
  };
};
