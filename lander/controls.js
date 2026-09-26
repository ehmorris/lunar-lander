export const makeControls = (state, lander, audioManager) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const canvasElement = state.get("canvasElement");
  // Drag controls, with one finger or two, placed anywhere.
  //
  // One finger is a combined stick: the lander points the way the drag points,
  // and the further the drag, the harder the engine burns.
  //
  // A second finger splits the job by where the two fingers are relative to
  // each other: the left one steers and the right one is a throttle fader,
  // pushed up for more thrust. The throttle carries over at the handoff so
  // the engine doesn't cut out, and each finger keeps its role until it lifts.
  //
  // Sizes are in CSS pixels and scale with the screen, big enough that thumb
  // jitter barely moves the throttle but still within a thumb's reach.
  const outerRadius = Math.max(
    120,
    Math.min(200, Math.min(canvasWidth, canvasHeight) * 0.36)
  );
  // Inside this ring the stick only steers, so the lander can be turned
  // without firing the engine
  const deadZoneRadius = outerRadius * 0.2;
  // Below this the drag direction is too noisy to steer by
  const aimRadius = 12;
  // A steering-only finger only needs direction, so it floats much closer
  const steerRadius = 48;
  // The fader covers the same distance as the stick, above a small dead band
  // so a thumb resting on it doesn't flicker the engine
  const faderTravel = outerRadius - deadZoneRadius;
  const faderDeadBand = 10;
  // Throttle rises with the square of the drag, so the first half of the
  // drag covers only the first quarter of the thrust. Hovering needs about
  // 30%, which lands a little past the middle of the drag.
  const throttleCurve = 2;

  // Active fingers (or the mouse), keyed by pointerId. Each has a role:
  // "stick", "steer" or "throttle". A third finger is ignored.
  const pointers = new Map();
  // Pointer events can arrive several times per frame. They only record where
  // the fingers are; the result is worked out and handed to the lander once
  // per frame, just before it's drawn.
  let pointersChanged = false;
  // Read once per gesture: getBoundingClientRect can force a layout, and the
  // canvas doesn't move while a finger is down
  let canvasBounds = null;
  // What was last drawn and how visible it is, so the overlay can fade out in
  // place after the fingers lift
  let lastWidgets = [];
  let lastDial = { angle: null, throttle: 0 };
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
    const bounds = canvasBounds;
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

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  // Dragging past the edge of a ring pulls its origin along, so backing off
  // responds right away instead of first retracing a long overshoot
  const pullOrigin = (pointer, radius) => {
    const { origin, position } = pointer;
    const distance = Math.hypot(position.x - origin.x, position.y - origin.y);
    if (distance > radius) {
      const pull = (distance - radius) / distance;
      origin.x += (position.x - origin.x) * pull;
      origin.y += (position.y - origin.y) * pull;
      return radius;
    }
    return distance;
  };

  const updateStick = (pointer) => {
    pointer.distance = pullOrigin(pointer, outerRadius);
    pointer.throttle = Math.pow(
      clamp01(
        (pointer.distance - deadZoneRadius) / (outerRadius - deadZoneRadius)
      ),
      throttleCurve
    );
    if (pointer.distance > aimRadius) pointer.angle = dragAngle(pointer);
  };

  const updateSteer = (pointer) => {
    pointer.distance = pullOrigin(pointer, steerRadius);
    if (pointer.distance > aimRadius) pointer.angle = dragAngle(pointer);
  };

  // The fader's zero point floats too: sliding below it drags it down, and
  // pushing past full drags it up, so the thumb never has to hunt for zero
  const updateThrottle = (pointer) => {
    const height = pointer.zeroY - pointer.position.y;
    if (height < 0) {
      pointer.zeroY = pointer.position.y;
    } else if (height > faderDeadBand + faderTravel) {
      pointer.zeroY = pointer.position.y + faderDeadBand + faderTravel;
    }
    pointer.throttle = Math.pow(
      clamp01(
        (pointer.zeroY - pointer.position.y - faderDeadBand) / faderTravel
      ),
      throttleCurve
    );
  };

  const updaters = {
    stick: updateStick,
    steer: updateSteer,
    throttle: updateThrottle,
  };

  const makeSteer = (pointerId, position, origin = position, angle = null) => {
    const pointer = {
      pointerId,
      role: "steer",
      origin: { ...origin },
      position,
      distance: 0,
      angle,
    };
    updateSteer(pointer);
    return pointer;
  };

  // Starting throttle places the zero point below the finger so the fader
  // picks up exactly where the engine already is
  const makeThrottle = (pointerId, position, throttle = 0) => {
    const faderPosition = Math.pow(throttle, 1 / throttleCurve);
    const pointer = {
      pointerId,
      role: "throttle",
      position,
      zeroY:
        position.y +
        (throttle > 0 ? faderDeadBand + faderPosition * faderTravel : 0),
      throttle: 0,
    };
    updateThrottle(pointer);
    return pointer;
  };

  // Combine whatever the fingers are doing and hand it to the lander
  const applyControls = () => {
    let angle = null;
    let throttle = 0;
    pointers.forEach((pointer) => {
      if (pointer.role !== "throttle" && pointer.angle !== null) {
        angle = pointer.angle;
      }
      if (pointer.role !== "steer") throttle = pointer.throttle;
    });

    // Letting go stops steering but leaves the lander's spin alone, so a
    // quick circular drag and release can still send it into a flip
    if (angle === null) lander.clearTargetAngle();
    else lander.setTargetAngle(angle);

    lander.setThrottle(throttle);
    if (throttle > 0) {
      audioManager.playEngineSound();
      audioManager.setEngineVolume(0.35 + 0.65 * throttle);
    } else {
      audioManager.stopEngineSound();
    }

    // Once every finger is up, keep the last frame so it can fade out in
    // place. A lifted pointer's object is never touched again, so holding on
    // to it is as good as a copy.
    if (pointers.size > 0) {
      lastDial = { angle, throttle };
      lastWidgets = [...pointers.values()];
    }
  };

  // A second finger landing next to a lone stick splits it into a steering
  // finger on the left and a throttle finger on the right
  const addSecondPointer = (pointerId, position) => {
    const [first] = pointers.values();

    if (first.role === "stick") {
      if (position.x >= first.position.x) {
        pointers.set(
          first.pointerId,
          makeSteer(first.pointerId, first.position, first.origin, first.angle)
        );
        pointers.set(
          pointerId,
          makeThrottle(pointerId, position, first.throttle)
        );
      } else {
        pointers.set(
          first.pointerId,
          makeThrottle(first.pointerId, first.position, first.throttle)
        );
        // Holds the current heading until this finger starts dragging
        pointers.set(
          pointerId,
          makeSteer(pointerId, position, position, first.angle)
        );
      }
    } else if (first.role === "steer") {
      pointers.set(pointerId, makeThrottle(pointerId, position));
    } else {
      pointers.set(pointerId, makeSteer(pointerId, position));
    }
  };

  function onPointerDown(e) {
    if (pointers.size >= 2 || (e.pointerType === "mouse" && e.button !== 0)) {
      return;
    }

    if (pointers.size === 0) {
      canvasBounds = canvasElement.getBoundingClientRect();
    }
    const position = toCanvasPoint(e.clientX, e.clientY);
    if (pointers.size === 0) {
      pointers.set(e.pointerId, {
        pointerId: e.pointerId,
        role: "stick",
        origin: { ...position },
        position,
        distance: 0,
        throttle: 0,
        angle: null,
      });
    } else {
      addSecondPointer(e.pointerId, position);
    }
    pointersChanged = true;

    // Keep receiving moves when the finger or mouse leaves the canvas
    try {
      canvasElement.setPointerCapture(e.pointerId);
    } catch {}

    if (e.cancelable) e.preventDefault();
  }

  function onPointerMove(e) {
    const pointer = pointers.get(e.pointerId);
    if (!pointer) return;

    pointer.position = toCanvasPoint(e.clientX, e.clientY);
    updaters[pointer.role](pointer);
    pointersChanged = true;

    if (e.cancelable) e.preventDefault();
  }

  // pointercancel covers a touch the browser takes away — a system gesture, an
  // incoming call — which never gets its pointerup
  function onPointerUp(e) {
    if (!pointers.delete(e.pointerId)) return;
    pointersChanged = true;
  }

  const releaseAllPointers = () => {
    if (pointers.size === 0 && !pointersChanged) return;
    pointers.clear();
    // Immediately, since the overlay may never be drawn again to apply it
    applyControls();
    pointersChanged = false;
  };

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
    releaseAllPointers();
    lander.stopLeftRotation();
    lander.stopRightRotation();
    audioManager.stopBoosterSound1();
    audioManager.stopBoosterSound2();
  };

  // Under the thumb: only where each finger is relative to its controls.
  // None of it needs reading, since the thumb covers most of it.
  const flameGradient = (x0, y0, x1, y1) => {
    const gradient = CTX.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, "#415B8C");
    gradient.addColorStop(1, "#F3AFA3");
    return gradient;
  };

  const drawOriginDot = ({ x, y }) => {
    CTX.fillStyle = "rgba(255, 255, 255, 0.5)";
    CTX.beginPath();
    CTX.arc(x, y, 3, 0, Math.PI * 2);
    CTX.fill();
  };

  const drawStick = ({ origin, distance, throttle, angle }) => {
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

      // Throttle bar from the dead zone out to the finger
      if (throttle > 0) {
        CTX.strokeStyle = flameGradient(deadZoneRadius, 0, outerRadius, 0);
        CTX.lineWidth = 4;
        CTX.beginPath();
        CTX.moveTo(deadZoneRadius, 0);
        CTX.lineTo(Math.min(distance, outerRadius), 0);
        CTX.stroke();
      }
    }

    CTX.restore();
    drawOriginDot(origin);
  };

  const drawSteer = ({ origin, distance, angle }) => {
    CTX.save();
    CTX.translate(origin.x, origin.y);
    CTX.lineCap = "round";

    CTX.strokeStyle = "rgba(255, 255, 255, 0.16)";
    CTX.lineWidth = 1;
    CTX.setLineDash([2, 4]);
    CTX.beginPath();
    CTX.arc(0, 0, steerRadius, 0, Math.PI * 2);
    CTX.stroke();
    CTX.setLineDash([]);

    if (angle !== null) {
      CTX.rotate(angle - Math.PI / 2);
      CTX.strokeStyle = "rgba(255, 255, 255, 0.5)";
      CTX.lineWidth = 2;
      CTX.beginPath();
      CTX.moveTo(0, 0);
      CTX.lineTo(Math.min(distance, steerRadius), 0);
      CTX.stroke();
    }

    CTX.restore();
    drawOriginDot(origin);
  };

  const drawThrottle = ({ position, zeroY }) => {
    const x = position.x;
    const bottom = zeroY - faderDeadBand;
    const top = bottom - faderTravel;

    CTX.save();
    CTX.lineCap = "round";

    // Track, with a tick at zero
    CTX.strokeStyle = "rgba(255, 255, 255, 0.16)";
    CTX.lineWidth = 1;
    CTX.beginPath();
    CTX.moveTo(x, zeroY);
    CTX.lineTo(x, top);
    CTX.moveTo(x - 8, zeroY);
    CTX.lineTo(x + 8, zeroY);
    CTX.moveTo(x - 8, top);
    CTX.lineTo(x + 8, top);
    CTX.stroke();

    // Fill from the bottom of the travel up to the finger
    if (position.y < bottom) {
      CTX.strokeStyle = flameGradient(x, bottom, x, top);
      CTX.lineWidth = 4;
      CTX.beginPath();
      CTX.moveTo(x, bottom);
      CTX.lineTo(x, Math.max(position.y, top));
      CTX.stroke();
    }

    CTX.restore();
  };

  const widgetDrawers = {
    stick: drawStick,
    steer: drawSteer,
    throttle: drawThrottle,
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

    CTX.save();
    // With only a throttle finger down there's no target heading, so the arc
    // follows the lander itself
    CTX.rotate(angle === null ? lander.getAngle() : angle);

    // Throttle arc on the exhaust side, growing outward from straight behind
    // the heading like a second flame
    if (throttle > 0) {
      const sweep = (Math.PI / 2) * throttle;
      CTX.strokeStyle = "#F3AFA3";
      CTX.lineWidth = 3;
      CTX.beginPath();
      CTX.arc(0, 0, radius, Math.PI / 2 - sweep, Math.PI / 2 + sweep);
      CTX.stroke();
    }

    // Target heading: a notch pointing in at the ring
    if (angle !== null) {
      const size = 5;
      CTX.fillStyle = "#fff";
      CTX.beginPath();
      CTX.moveTo(0, -radius + 1);
      CTX.lineTo(-size, -radius - size * 1.4);
      CTX.lineTo(size, -radius - size * 1.4);
      CTX.closePath();
      CTX.fill();
    }
    CTX.restore();

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

  // Called once per frame before the lander is drawn, so this is also where
  // the frame's input takes effect
  const drawTouchOverlay = () => {
    if (pointersChanged) {
      pointersChanged = false;
      applyControls();
    }

    const now = performance.now();
    const frameTime = lastOverlayTime === null ? 0 : now - lastOverlayTime;
    lastOverlayTime = now;

    // Fade in quickly, fade out a little slower so the last reading lingers
    overlayOpacity =
      pointers.size > 0
        ? Math.min(1, overlayOpacity + frameTime / 80)
        : Math.max(0, overlayOpacity - frameTime / 220);

    if (overlayOpacity === 0) return;

    CTX.save();
    CTX.globalAlpha = overlayOpacity;
    lastWidgets.forEach((widget) => widgetDrawers[widget.role](widget));
    drawLanderDial(lastDial);
    CTX.restore();
  };

  return {
    drawTouchOverlay,
    attachEventListeners,
    detachEventListeners,
    getHasKeyboard: () => hasKeyboard,
  };
};
