export const makeControls = (state, lander, audioManager) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const canvasElement = state.get("canvasElement");
  // Which zone each active touch currently occupies, keyed by Touch.identifier.
  // Zones are reference counted off this map: a second finger landing in a
  // column must not re-trigger the control, and lifting one of two fingers in
  // the same column must not release it. Without the count, holding the center
  // column with two fingers and lifting either one cut the engine mid-burn.
  const activeTouchZones = new Map();
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

  const toCanvasX = (clientX) => {
    const bounds = canvasElement.getBoundingClientRect();
    return bounds.width
      ? ((clientX - bounds.left) / bounds.width) * canvasWidth
      : clientX;
  };

  const getTouchZone = (clientX) => {
    const x = toCanvasX(clientX);

    const clampedColumnNumber = Math.max(
      0,
      Math.min(
        Math.floor(x / (canvasWidth / touchColumnMap.length)),
        touchColumnMap.length - 1
      )
    );

    return touchColumnMap[clampedColumnNumber];
  };

  const zoneTouchCount = (zoneName) => {
    let count = 0;
    activeTouchZones.forEach((zone) => {
      if (zone === zoneName) count++;
    });
    return count;
  };

  const enterTouchZone = (identifier, zoneName) => {
    activeTouchZones.set(identifier, zoneName);
    if (zoneTouchCount(zoneName) === 1) activateTouchZone(zoneName);
  };

  const leaveTouchZone = (identifier) => {
    const zoneName = activeTouchZones.get(identifier);
    if (zoneName === undefined) return;

    activeTouchZones.delete(identifier);
    if (zoneTouchCount(zoneName) === 0) deactivateTouchZone(zoneName);
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
      const touch = e.changedTouches[index];
      enterTouchZone(touch.identifier, getTouchZone(touch.clientX));
    }

    if (e.cancelable) e.preventDefault();
  }

  function onTouchMove(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      const touch = e.changedTouches[index];
      const previousZone = activeTouchZones.get(touch.identifier);
      if (previousZone === undefined) continue;

      // Two of the four columns are both "center", so sliding between them
      // reads as the same zone and leaves the engine alone
      const currentZone = getTouchZone(touch.clientX);
      if (previousZone === currentZone) continue;

      leaveTouchZone(touch.identifier);
      enterTouchZone(touch.identifier, currentZone);
    }

    if (e.cancelable) e.preventDefault();
  }

  // Released zones come from the tracked map rather than from the touch's final
  // coordinates, so a control can't be left stuck on by a touchend that reports
  // a position in a different column than the one the finger was holding.
  function onTouchEnd(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      leaveTouchZone(e.changedTouches[index].identifier);
    }

    if (e.cancelable) e.preventDefault();
  }

  const attachEventListeners = () => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvasElement.addEventListener("touchstart", onTouchStart);
    canvasElement.addEventListener("touchmove", onTouchMove);
    canvasElement.addEventListener("touchend", onTouchEnd);
    // A touch the browser takes away — a system gesture, an incoming call —
    // never gets its touchend, and without this its zone stayed held down
    canvasElement.addEventListener("touchcancel", onTouchEnd);
  };

  const detachEventListeners = () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    canvasElement.removeEventListener("touchstart", onTouchStart);
    canvasElement.removeEventListener("touchmove", onTouchMove);
    canvasElement.removeEventListener("touchend", onTouchEnd);
    canvasElement.removeEventListener("touchcancel", onTouchEnd);

    // Whatever the player was holding when the listeners went away can never
    // receive its matching keyup or touchend, so release all three zones.
    // Otherwise crashing mid-thrust leaves the engine sound looping into the
    // next round and the touch column tinted for the rest of the session.
    activeTouchZones.clear();
    deactivateTouchZone("left");
    deactivateTouchZone("center");
    deactivateTouchZone("right");
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
