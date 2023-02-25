export const makeControls = (
  CTX,
  lander,
  canvasWidth,
  canvasHeight,
  canvasElement
) => {
  let _showCenterOverlay = false;
  let _showRightOverlay = false;
  let _showLeftOverlay = false;
  let hasKeyboard = false;

  function _onKeyDown({ key }) {
    if (key === "ArrowUp") lander.engineOn();
    if (key === "ArrowLeft") lander.rotateLeft();
    if (key === "ArrowRight") lander.rotateRight();
    hasKeyboard = true;
  }

  function _onKeyUp({ key }) {
    if (key === "ArrowUp") lander.engineOff();
    if (key === "ArrowLeft") lander.stopLeftRotation();
    if (key === "ArrowRight") lander.stopRightRotation();
  }

  const _leftTouch = (touch) =>
    touch.clientX / canvasWidth > 0 && touch.clientX / canvasWidth < 0.25;
  const _centerTouch = (touch) =>
    touch.clientX / canvasWidth >= 0.25 && touch.clientX / canvasWidth <= 0.75;

  const _activateTouchZone = (touch) => {
    if (_leftTouch(touch)) {
      lander.rotateLeft();
      _showLeftOverlay = true;
    } else if (_centerTouch(touch)) {
      lander.engineOn();
      _showCenterOverlay = true;
    } else {
      lander.rotateRight();
      _showRightOverlay = true;
    }
  };

  function _onTouchStart(e) {
    for (let index = 0; index < e.touches.length; index++) {
      _activateTouchZone(e.touches[index]);
    }

    e.preventDefault();
  }

  function _onTouchMove(e) {
    lander.engineOff();
    lander.stopLeftRotation();
    lander.stopRightRotation();
    _showCenterOverlay = false;
    _showLeftOverlay = false;
    _showRightOverlay = false;

    for (let index = 0; index < e.touches.length; index++) {
      _activateTouchZone(e.touches[index]);
    }

    e.preventDefault();
  }

  function _onTouchEnd(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      if (_leftTouch(e.changedTouches[index])) {
        lander.stopLeftRotation();
        _showLeftOverlay = false;
      } else if (_centerTouch(e.changedTouches[index])) {
        lander.engineOff();
        _showCenterOverlay = false;
      } else {
        lander.stopRightRotation();
        _showRightOverlay = false;
      }
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
