export const makeControls = (state, lander, audioManager) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const canvasElement = state.get("canvasElement");
  // Drag controls: touch (or click) anywhere and drag. The lander points the
  // way the drag points, and the further the drag, the harder the engine
  // burns. Sizes are in CSS pixels and scale with the screen, big enough that
  // thumb jitter barely moves the throttle but still within a thumb's reach.
  const outerRadius = Math.max(
    120,
    Math.min(200, Math.min(canvasWidth, canvasHeight) * 0.36)
  );
  // Inside this ring the drag only steers, so the lander can be turned
  // without firing the engine
  const deadZoneRadius = outerRadius * 0.2;
  // Below this the drag direction is too noisy to steer by
  const aimRadius = 12;
  // Throttle rises with the square of the drag, so the first half of the
  // drag covers only the first quarter of the thrust. Hovering needs about
  // 30%, which lands a little past the middle of the drag.
  const throttleCurve = 2;

  // The pointer being tracked, and where the gesture's origin is. Only the
  // first pointer down controls the lander; later fingers are ignored.
  let drag = null;
  // Where the overlay was last drawn and how visible it is, so it can fade
  // out in place after the finger lifts
  let overlay = null;
  let overlayOpacity = 0;
  let lastOverlayTime = null;

  let hasKeyboard = false;

  function onKeyDown({ key }) {
    if (key === "w" || key === "ArrowUp") {
      lander.engineOn();
      audioManager.playEngineSound();
      audioManager.setEngineVolume(1);
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

  const toCanvasPoint = (clientX, clientY) => {
    const bounds = canvasElement.getBoundingClientRect();
    return bounds.width && bounds.height
      ? {
          x: ((clientX - bounds.left) / bounds.width) * canvasWidth,
          y: ((clientY - bounds.top) / bounds.height) * canvasHeight,
        }
      : { x: clientX, y: clientY };
  };

  // Angle in the lander's convention: 0 is pointy end up, increasing clockwise
  const dragAngle = ({ origin, position }) =>
    Math.atan2(position.x - origin.x, -(position.y - origin.y));

  const dragThrottle = (distance) =>
    Math.pow(
      Math.max(
        0,
        Math.min(
          1,
          (distance - deadZoneRadius) / (outerRadius - deadZoneRadius)
        )
      ),
      throttleCurve
    );

  const applyThrottle = (throttle) => {
    lander.setThrottle(throttle);
    if (throttle > 0) {
      audioManager.playEngineSound();
      audioManager.setEngineVolume(0.35 + 0.65 * throttle);
    } else {
      audioManager.stopEngineSound();
    }
  };

  const updateDrag = (position) => {
    drag.position = position;

    // Floating origin: dragging past full throttle pulls the origin along, so
    // backing off always lowers the throttle right away instead of first
    // having to retrace a long overshoot
    let distance = Math.hypot(
      position.x - drag.origin.x,
      position.y - drag.origin.y
    );
    if (distance > outerRadius) {
      const pull = (distance - outerRadius) / distance;
      drag.origin.x += (position.x - drag.origin.x) * pull;
      drag.origin.y += (position.y - drag.origin.y) * pull;
      distance = outerRadius;
    }

    drag.distance = distance;
    drag.throttle = dragThrottle(distance);

    if (distance > aimRadius) {
      drag.angle = dragAngle(drag);
      lander.setTargetAngle(drag.angle);
    }

    applyThrottle(drag.throttle);
    overlay = drag;
  };

  const endDrag = () => {
    if (!drag) return;
    drag = null;
    // Letting go stops steering but leaves the lander's spin alone, so a
    // quick circular drag and release can still send it into a flip
    lander.clearTargetAngle();
    applyThrottle(0);
  };

  function onPointerDown(e) {
    if (drag || (e.pointerType === "mouse" && e.button !== 0)) return;

    const position = toCanvasPoint(e.clientX, e.clientY);
    drag = {
      pointerId: e.pointerId,
      origin: { ...position },
      position,
      distance: 0,
      throttle: 0,
      angle: null,
    };
    overlay = drag;

    // Keep receiving moves when the finger or mouse leaves the canvas
    try {
      canvasElement.setPointerCapture(e.pointerId);
    } catch {}

    if (e.cancelable) e.preventDefault();
  }

  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;

    updateDrag(toCanvasPoint(e.clientX, e.clientY));

    if (e.cancelable) e.preventDefault();
  }

  // pointercancel covers a touch the browser takes away — a system gesture, an
  // incoming call — which never gets its pointerup
  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    endDrag();
  }

  // Touch events still fire alongside pointer events. Cancelling them stops
  // iOS from scrolling, zooming, or showing the magnifier mid-drag.
  function preventTouchDefault(e) {
    if (e.cancelable) e.preventDefault();
  }

  const attachEventListeners = () => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvasElement.addEventListener("pointerdown", onPointerDown);
    canvasElement.addEventListener("pointermove", onPointerMove);
    canvasElement.addEventListener("pointerup", onPointerUp);
    canvasElement.addEventListener("pointercancel", onPointerUp);
    canvasElement.addEventListener("touchstart", preventTouchDefault);
    canvasElement.addEventListener("touchmove", preventTouchDefault);
  };

  const detachEventListeners = () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    canvasElement.removeEventListener("pointerdown", onPointerDown);
    canvasElement.removeEventListener("pointermove", onPointerMove);
    canvasElement.removeEventListener("pointerup", onPointerUp);
    canvasElement.removeEventListener("pointercancel", onPointerUp);
    canvasElement.removeEventListener("touchstart", preventTouchDefault);
    canvasElement.removeEventListener("touchmove", preventTouchDefault);

    // Whatever the player was holding when the listeners went away can never
    // receive its matching keyup or pointerup, so release everything.
    // Otherwise crashing mid-thrust leaves the engine sound looping into the
    // next round.
    endDrag();
    lander.stopLeftRotation();
    lander.stopRightRotation();
    audioManager.stopBoosterSound1();
    audioManager.stopBoosterSound2();
  };

  // Under the thumb: only where the finger is relative to the rings. None of
  // it needs reading, since the thumb covers most of it.
  const drawJoystick = ({ origin, distance, throttle, angle }) => {
    CTX.save();
    CTX.translate(origin.x, origin.y);
    CTX.lineCap = "round";

    // Full-throttle ring
    CTX.strokeStyle = "rgba(255, 255, 255, 0.16)";
    CTX.lineWidth = 1;
    CTX.beginPath();
    CTX.arc(0, 0, outerRadius, 0, Math.PI * 2);
    CTX.stroke();

    // Dead zone ring: inside it the drag only steers
    CTX.setLineDash([2, 4]);
    CTX.beginPath();
    CTX.arc(0, 0, deadZoneRadius, 0, Math.PI * 2);
    CTX.stroke();
    CTX.setLineDash([]);

    if (angle !== null) {
      // Canvas angles start at 3 o'clock, the lander's at 12
      CTX.rotate(angle - Math.PI / 2);

      // Thin guide inside the dead zone
      CTX.strokeStyle = "rgba(255, 255, 255, 0.4)";
      CTX.beginPath();
      CTX.moveTo(0, 0);
      CTX.lineTo(Math.min(distance, deadZoneRadius), 0);
      CTX.stroke();

      // Throttle bar from the dead zone out to the finger, drawn in the
      // engine flame's colors
      if (throttle > 0) {
        const gradient = CTX.createLinearGradient(
          deadZoneRadius,
          0,
          outerRadius,
          0
        );
        gradient.addColorStop(0, "#415B8C");
        gradient.addColorStop(1, "#F3AFA3");
        CTX.strokeStyle = gradient;
        CTX.lineWidth = 4;
        CTX.beginPath();
        CTX.moveTo(deadZoneRadius, 0);
        CTX.lineTo(Math.min(distance, outerRadius), 0);
        CTX.stroke();
      }
    }

    CTX.restore();

    CTX.save();
    CTX.fillStyle = "rgba(255, 255, 255, 0.5)";
    CTX.beginPath();
    CTX.arc(origin.x, origin.y, 3, 0, Math.PI * 2);
    CTX.fill();
    CTX.restore();
  };

  // Around the lander, where the player is already looking and the thumb
  // isn't: which way the drag is steering, and how hard the engine is burning
  const drawLanderDial = ({ throttle, angle }) => {
    const { x, y } = lander.getDisplayPosition();
    const radius = lander.getDialRadius();

    CTX.save();
    CTX.translate(x, y);
    CTX.lineCap = "round";

    CTX.strokeStyle = "rgba(255, 255, 255, 0.1)";
    CTX.lineWidth = 1;
    CTX.beginPath();
    CTX.arc(0, 0, radius, 0, Math.PI * 2);
    CTX.stroke();

    if (angle !== null) {
      CTX.save();
      CTX.rotate(angle);

      // Throttle arc on the exhaust side, growing outward from straight
      // behind the target heading like a second flame
      if (throttle > 0) {
        const sweep = (Math.PI / 2) * throttle;
        CTX.strokeStyle = "#F3AFA3";
        CTX.lineWidth = 3;
        CTX.beginPath();
        CTX.arc(0, 0, radius, Math.PI / 2 - sweep, Math.PI / 2 + sweep);
        CTX.stroke();
      }

      // Target heading: a notch pointing in at the ring
      const size = 5;
      CTX.fillStyle = "#fff";
      CTX.beginPath();
      CTX.moveTo(0, -radius + 1);
      CTX.lineTo(-size, -radius - size * 1.4);
      CTX.lineTo(size, -radius - size * 1.4);
      CTX.closePath();
      CTX.fill();
      CTX.restore();
    }

    // Throttle readout under the dial, clear of the speed and angle readouts
    // beside the lander, and kept on screen when the lander is at an edge
    if (throttle > 0) {
      CTX.font = "400 10px -apple-system, BlinkMacSystemFont, sans-serif";
      CTX.fillStyle = "rgba(255, 255, 255, 0.8)";
      CTX.textAlign = "center";
      CTX.textBaseline = "top";
      const label = `${Math.round(throttle * 100)}%`;
      const halfWidth = CTX.measureText(label).width / 2 + 4;
      const labelX = Math.max(
        halfWidth - x,
        Math.min(canvasWidth - halfWidth - x, 0)
      );
      CTX.fillText(label, labelX, radius + 8);
    }

    CTX.restore();
  };

  const drawTouchOverlay = () => {
    const now = performance.now();
    const frameTime = lastOverlayTime === null ? 0 : now - lastOverlayTime;
    lastOverlayTime = now;

    // Fade in quickly, fade out a little slower so the last reading lingers
    overlayOpacity = drag
      ? Math.min(1, overlayOpacity + frameTime / 80)
      : Math.max(0, overlayOpacity - frameTime / 220);

    if (!overlay || overlayOpacity === 0) return;

    CTX.save();
    CTX.globalAlpha = overlayOpacity;
    drawJoystick(overlay);
    drawLanderDial(overlay);
    CTX.restore();
  };

  return {
    drawTouchOverlay,
    attachEventListeners,
    detachEventListeners,
    getHasKeyboard: () => hasKeyboard,
  };
};
