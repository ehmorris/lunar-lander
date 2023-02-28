export const makeControls = (
  CTX,
  lander,
  canvasWidth,
  canvasHeight,
  canvasElement,
  audioManager
) => {
  const allActiveTouches = new Set();
  const touchColumnBasis = canvasWidth / 4;
  const touchColumnMap = new Map([
    [0, "left"],
    [1, "center"],
    [2, "center"],
    [3, "right"],
  ]);
  let _showCenterOverlay = false;
  let _showRightOverlay = false;
  let _showLeftOverlay = false;
  let hasKeyboard = false;

  function _onKeyDown({ key }) {
    if (key === "ArrowUp") {
      lander.engineOn();
      audioManager.playEngineSound();
    }
    if (key === "ArrowLeft") {
      lander.rotateLeft();
      audioManager.playLeftBoosterSound();
    }
    if (key === "ArrowRight") {
      lander.rotateRight();
      audioManager.playRightBoosterSound();
    }
    hasKeyboard = true;
  }

  function _onKeyUp({ key }) {
    if (key === "ArrowUp") {
      lander.engineOff();
      audioManager.stopEngineSound();
    }
    if (key === "ArrowLeft") {
      lander.stopLeftRotation();
      audioManager.stopLeftBoosterSound();
    }
    if (key === "ArrowRight") {
      lander.stopRightRotation();
      audioManager.stopRightBoosterSound();
    }
  }

  const _getTouchZone = (x) => {
    const columnNumber = Math.floor(x / touchColumnBasis);
    const clampedColumnNumber = Math.max(
      0,
      Math.min(columnNumber, touchColumnMap.size)
    );

    return touchColumnMap.get(clampedColumnNumber);
  };

  const _activateTouchZone = (zoneNumber) => {
    if (zoneNumber === "left") {
      lander.rotateLeft();
      audioManager.playLeftBoosterSound();
      _showLeftOverlay = true;
    } else if (zoneNumber === "center") {
      lander.engineOn();
      audioManager.playEngineSound();
      _showCenterOverlay = true;
    } else {
      lander.rotateRight();
      audioManager.playRightBoosterSound();
      _showRightOverlay = true;
    }
  };

  const _deactivateTouchZone = (zoneNumber) => {
    if (zoneNumber === "left") {
      lander.stopLeftRotation();
      audioManager.stopLeftBoosterSound();
      _showLeftOverlay = false;
    } else if (zoneNumber === "center") {
      lander.engineOff();
      audioManager.stopEngineSound();
      _showCenterOverlay = false;
    } else {
      lander.stopRightRotation();
      audioManager.stopRightBoosterSound();
      _showRightOverlay = false;
    }
  };

  function _onTouchStart(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      _activateTouchZone(_getTouchZone(e.changedTouches[index].clientX));
      allActiveTouches.add(e.changedTouches[index]);
    }

    e.preventDefault();
  }

  function _onTouchMove(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      let touchPreviousData;
      allActiveTouches.forEach((touch) => {
        if (touch.identifier === e.changedTouches[index].identifier) {
          touchPreviousData = touch;
        }
      });
      const previousTouchZone = _getTouchZone(touchPreviousData.clientX);
      const currentTouchZone = _getTouchZone(e.changedTouches[index].clientX);

      if (previousTouchZone !== currentTouchZone) {
        _deactivateTouchZone(previousTouchZone);
        _activateTouchZone(currentTouchZone);
        allActiveTouches.delete(touchPreviousData);
        allActiveTouches.add(e.changedTouches[index]);
      }
    }

    e.preventDefault();
  }

  function _onTouchEnd(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      _deactivateTouchZone(_getTouchZone(e.changedTouches[index].clientX));

      allActiveTouches.forEach((touch) => {
        if (touch.identifier === e.changedTouches[index].identifier) {
          allActiveTouches.delete(touch);
        }
      });
    }

    e.preventDefault();
  }

  const attachEventListeners = () => {
    document.addEventListener("keydown", _onKeyDown);
    document.addEventListener("keyup", _onKeyUp);
    canvasElement.addEventListener("touchstart", _onTouchStart);
    canvasElement.addEventListener("touchmove", _onTouchMove);
    canvasElement.addEventListener("touchend", _onTouchEnd);
  };

  const detachEventListeners = () => {
    document.removeEventListener("keydown", _onKeyDown);
    document.removeEventListener("keyup", _onKeyUp);
    canvasElement.removeEventListener("touchstart", _onTouchStart);
    canvasElement.removeEventListener("touchmove", _onTouchMove);
    canvasElement.removeEventListener("touchend", _onTouchEnd);
  };

  const drawTouchOverlay = () => {
    CTX.save();
    CTX.fillStyle = "rgba(255, 255, 255, 0.07)";
    if (_showLeftOverlay) {
      CTX.fillRect(0, 0, canvasWidth * 0.25, canvasHeight);
    }
    if (_showCenterOverlay) {
      CTX.fillRect(canvasWidth * 0.25, 0, canvasWidth * 0.5, canvasHeight);
    }
    if (_showRightOverlay) {
      CTX.fillRect(canvasWidth * 0.75, 0, canvasWidth * 0.25, canvasHeight);
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
