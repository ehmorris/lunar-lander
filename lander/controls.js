export const makeControls = (state, lander, audioManager) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const canvasElement = state.get("canvasElement");
  // Touches are read from the whole game area rather than just the canvas.
  // The canvas keeps the shape it was generated at and is letterboxed to fit,
  // so after rotating a phone to landscape it's a narrow strip down the middle
  // and a thumb at either edge of the screen hit nothing at all. Columns are
  // measured across the screen, which is where the player's thumbs are.
  const touchArea = canvasElement.parentElement;
  // Everything currently holding each control down: keys by their physical
  // key code, touches by identifier. A control only releases when the last
  // thing holding it lets go, so lifting one of two fingers in the center
  // column, or letting go of W while still holding the up arrow, can't cut the
  // engine mid-burn. Key repeat and a second finger in the same column are
  // no-ops because the holder is already in the set.
  const holders = { left: new Set(), center: new Set(), right: new Set() };
  // Which zone each active touch currently occupies, keyed by Touch.identifier
  const activeTouchZones = new Map();
  // Which control each held key is driving, keyed by KeyboardEvent.code. The
  // release is matched on the physical key rather than on the character,
  // because the character can change while the key is down: press W, then
  // Shift, and the keyup reports "W", which used to leave the engine stuck on.
  const activeKeys = new Map();
  const keyZones = {
    w: "center",
    arrowup: "center",
    a: "left",
    arrowleft: "left",
    d: "right",
    arrowright: "right",
  };
  const touchColumnMap = ["left", "center", "center", "right"];

  let hasKeyboard = false;

  const activateZone = (zoneName) => {
    if (zoneName === "left") {
      lander.rotateLeft();
      audioManager.playBoosterSound1();
    } else if (zoneName === "center") {
      lander.engineOn();
      audioManager.playEngineSound();
    } else {
      lander.rotateRight();
      audioManager.playBoosterSound2();
    }
  };

  const deactivateZone = (zoneName) => {
    if (zoneName === "left") {
      lander.stopLeftRotation();
      audioManager.stopBoosterSound1();
    } else if (zoneName === "center") {
      lander.engineOff();
      audioManager.stopEngineSound();
    } else {
      lander.stopRightRotation();
      audioManager.stopBoosterSound2();
    }
  };

  const hold = (zoneName, holder) => {
    const zoneHolders = holders[zoneName];
    if (zoneHolders.has(holder)) return;
    zoneHolders.add(holder);
    if (zoneHolders.size === 1) activateZone(zoneName);
  };

  const letGo = (zoneName, holder) => {
    const zoneHolders = holders[zoneName];
    if (!zoneHolders.delete(holder)) return;
    if (zoneHolders.size === 0) deactivateZone(zoneName);
  };

  // Only touches light up a column; the keyboard never did
  const isTouchedZone = (zoneName) =>
    [...holders[zoneName]].some((holder) => typeof holder === "number");

  function onKeyDown({ key, code, metaKey, ctrlKey }) {
    hasKeyboard = true;

    // Shortcuts like Cmd+D or Ctrl+W aren't flying. On a Mac, a key released
    // while Cmd is down never gets its keyup either, so it would stick.
    if (metaKey || ctrlKey) return;

    // Chrome fires keydown with no key at all when it autofills
    const zoneName = keyZones[(key || "").toLowerCase()];
    if (!zoneName || activeKeys.has(code)) return;

    activeKeys.set(code, zoneName);
    hold(zoneName, code);
  }

  function onKeyUp({ key, code }) {
    const zoneName = activeKeys.get(code);
    if (zoneName !== undefined) {
      activeKeys.delete(code);
      letGo(zoneName, code);
    }

    // See onKeyDown: any key let go while Cmd was held got no keyup of its own
    if (key === "Meta") releaseAllKeys();
  }

  const releaseAllKeys = () => {
    activeKeys.forEach((zoneName, code) => letGo(zoneName, code));
    activeKeys.clear();
  };

  // Switching apps or tabs mid-burn swallows the keyup, and the engine was
  // still firing on return. Touches get a touchcancel, but release them too in
  // case the browser doesn't send one.
  const releaseEverything = () => {
    releaseAllKeys();
    activeTouchZones.forEach((zoneName, identifier) =>
      letGo(zoneName, identifier)
    );
    activeTouchZones.clear();
  };

  function onVisibilityChange() {
    if (document.hidden) releaseEverything();
  }

  const getTouchZone = (clientX) => {
    const bounds = touchArea.getBoundingClientRect();
    const progress = bounds.width ? (clientX - bounds.left) / bounds.width : 0;

    const clampedColumnNumber = Math.max(
      0,
      Math.min(
        Math.floor(progress * touchColumnMap.length),
        touchColumnMap.length - 1
      )
    );

    return touchColumnMap[clampedColumnNumber];
  };

  const enterTouchZone = (identifier, zoneName) => {
    activeTouchZones.set(identifier, zoneName);
    hold(zoneName, identifier);
  };

  const leaveTouchZone = (identifier) => {
    const zoneName = activeTouchZones.get(identifier);
    if (zoneName === undefined) return;

    activeTouchZones.delete(identifier);
    letGo(zoneName, identifier);
  };

  // The column's span on screen, converted to canvas pixels and clipped to the
  // canvas, so the tint only covers the part of a column the canvas overlaps.
  // lastIndexOf rather than findLastIndex, which only reached Safari in 15.4:
  // on anything older it threw on every frame a column was lit, which also
  // skipped drawing the lander for as long as a finger was down.
  const getColumnBoundary = (colName) => {
    const area = touchArea.getBoundingClientRect();
    const canvasBounds = canvasElement.getBoundingClientRect();
    const toCanvasX = (clientX) =>
      Math.max(
        0,
        Math.min(
          canvasWidth,
          canvasBounds.width
            ? ((clientX - canvasBounds.left) / canvasBounds.width) *
                canvasWidth
            : clientX
        )
      );

    const start = touchColumnMap.indexOf(colName) / touchColumnMap.length;
    const end =
      (touchColumnMap.lastIndexOf(colName) + 1) / touchColumnMap.length;
    const startPixel = toCanvasX(area.left + start * area.width);
    const endPixel = toCanvasX(area.left + end * area.width);

    return {
      startPixel,
      widthInPixels: endPixel - startPixel,
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
    touchArea.addEventListener("touchstart", onTouchStart);
    touchArea.addEventListener("touchmove", onTouchMove);
    touchArea.addEventListener("touchend", onTouchEnd);
    // A touch the browser takes away — a system gesture, an incoming call —
    // never gets its touchend, and without this its zone stayed held down
    touchArea.addEventListener("touchcancel", onTouchEnd);
    window.addEventListener("blur", releaseEverything);
    document.addEventListener("visibilitychange", onVisibilityChange);
  };

  const detachEventListeners = () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    touchArea.removeEventListener("touchstart", onTouchStart);
    touchArea.removeEventListener("touchmove", onTouchMove);
    touchArea.removeEventListener("touchend", onTouchEnd);
    touchArea.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("blur", releaseEverything);
    document.removeEventListener("visibilitychange", onVisibilityChange);

    // Whatever the player was holding when the listeners went away can never
    // receive its matching keyup or touchend, so release all three zones.
    // Otherwise crashing mid-thrust leaves the engine sound looping into the
    // next round and the touch column tinted for the rest of the session.
    activeTouchZones.clear();
    activeKeys.clear();
    holders.left.clear();
    holders.center.clear();
    holders.right.clear();
    deactivateZone("left");
    deactivateZone("center");
    deactivateZone("right");
  };

  const drawTouchOverlay = () => {
    CTX.save();
    CTX.fillStyle = "rgba(255, 255, 255, 0.07)";
    if (isTouchedZone("left")) {
      const { startPixel, widthInPixels } = getColumnBoundary("left");
      CTX.fillRect(startPixel, 0, widthInPixels, canvasHeight);
    }
    if (isTouchedZone("center")) {
      const { startPixel, widthInPixels } = getColumnBoundary("center");
      CTX.fillRect(startPixel, 0, widthInPixels, canvasHeight);
    }
    if (isTouchedZone("right")) {
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
