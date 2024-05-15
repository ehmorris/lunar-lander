const makeGesturePoint = (CTX) => {
  const originPosition = { x: 0, y: 0 };
  const cursorPosition = { x: 0, y: 0, time: Date.now() };
  const speedHistoryLength = 1000;

  let visible;
  let originRadius;
  let movementSpeed;
  let movementSpeedHistory;
  let movementDirection;
  let smoothMovementSpeed;
  let smoothMovementSpeedHistory;
  let cursorPositionHistory;
  let lastCursorUpdate;

  const reset = () => {
    visible = false;
    originRadius = 32;
    movementSpeed = 0;
    movementSpeedHistory = new Array(speedHistoryLength).fill(0);
    movementDirection = false;
    smoothMovementSpeed = 0;
    smoothMovementSpeedHistory = new Array(speedHistoryLength).fill(0);
    cursorPositionHistory = [];
    lastCursorUpdate = Date.now();
  };

  reset();

  const setOriginPosition = ({ x, y }) => {
    originPosition.x = x;
    originPosition.y = y;
  };
  const getOriginPosition = () => originPosition;
  const getSize = () =>
    Math.hypot(
      originPosition.x - cursorPosition.x,
      originPosition.y - cursorPosition.y
    );
  const setOriginRadius = (r) => (originRadius = r);
  const getOriginRadius = () => originRadius;
  const setMovementSpeed = (s) => {
    movementSpeed = s;
    movementSpeedHistory.shift();
    movementSpeedHistory.push(movementSpeed);

    const hysterisis = 0.85;
    smoothMovementSpeed =
      smoothMovementSpeed * hysterisis + s * (1 - hysterisis);
    smoothMovementSpeedHistory.shift();
    smoothMovementSpeedHistory.push(smoothMovementSpeed);
  };
  const getSmoothMovementSpeedHistory = () => smoothMovementSpeedHistory;
  const setMovementDirection = (d) => (movementDirection = d);
  const getMovementDirection = () => movementDirection;
  const getCursorAngle = () => {
    const radians = Math.atan2(
      cursorPosition.y - originPosition.y,
      cursorPosition.x - originPosition.x
    );

    return {
      degrees: (radians * 180) / Math.PI,
      radians,
    };
  };
  const setCursorPosition = ({ x, y }) => {
    cursorPosition.x = x;
    cursorPosition.y = y;
    cursorPosition.time = Date.now();
    cursorPositionHistory.push({ ...cursorPosition });
    lastCursorUpdate = Date.now();
  };
  const getCursorPosition = () => cursorPosition;
  const show = () => (visible = true);

  // The gesture is paused if there have been no updates for > 1 second,
  // or if the last N updates have been very small
  const isPaused = () =>
    Date.now() - lastCursorUpdate > 1000 ||
    (movementSpeedHistory.length > 10 &&
      !movementSpeedHistory.slice(-10).some((s) => s > 0.2));

  const draw = () => {
    if (visible) {
      // Draw past N seconds of cursor positions as a polygon
      CTX.save();
      CTX.fillStyle = "#eee";
      CTX.moveTo(originPosition.x, originPosition.y);
      CTX.beginPath();
      cursorPositionHistory
        .filter(({ time }) => Date.now() - time < 100)
        .forEach(({ x, y }) => CTX.lineTo(x, y));
      CTX.lineTo(originPosition.x, originPosition.y);
      CTX.closePath();
      CTX.fill();
      CTX.restore();

      // Draw touch point in center
      CTX.save();
      CTX.fillStyle = "oklch(0.72 0.23 44.83)";
      CTX.beginPath();
      CTX.arc(originPosition.x, originPosition.y, originRadius, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.fill();
      CTX.restore();

      // Draw line
      CTX.save();
      CTX.fillStyle = "black";
      CTX.lineWidth = 2;
      CTX.beginPath();
      CTX.moveTo(originPosition.x, originPosition.y);
      CTX.lineTo(cursorPosition.x, cursorPosition.y);
      CTX.closePath();
      CTX.stroke();
      CTX.restore();
    }
  };

  return {
    draw,
    setOriginPosition,
    getOriginPosition,
    getSize,
    setOriginRadius,
    getOriginRadius,
    setMovementSpeed,
    getSmoothMovementSpeedHistory,
    setMovementDirection,
    getMovementDirection,
    getCursorAngle,
    setCursorPosition,
    getCursorPosition,
    show,
    reset,
    isPaused,
  };
};

const makeControls = (state, gesturePoint, lander, audioManager) => {
  let lastStartEvent = false;
  let lastMoveEvent = false;

  const startEventWrapper = (e, func) => {
    const isTouch = !!e.touches;
    let eventPosition;
    let eventSize;

    if (isTouch) {
      const touch = e.touches[0];
      eventPosition = { x: touch.clientX, y: touch.clientY };
      eventSize = Math.max(touch.radiusX, touch.radiusY);
    } else {
      eventPosition = { x: e.x, y: e.y };
      eventSize = 32;
    }

    lastStartEvent = {
      timeStamp: e.timeStamp,
      x: eventPosition.x,
      y: eventPosition.y,
      angle: gesturePoint.getCursorAngle(),
    };

    func({ x: eventPosition.x, y: eventPosition.y, size: eventSize });

    e.preventDefault();
  };

  const moveEventWrapper = (e, func) => {
    const isTouch = !!e.touches;
    let eventPosition;
    let eventSpeed;

    if (isTouch) {
      const touch = e.touches[0];
      eventPosition = { x: touch.clientX, y: touch.clientY };
    } else {
      eventPosition = { x: e.x, y: e.y };
    }

    // Calculate speed (velocity)
    const lastEvent = lastMoveEvent ? lastMoveEvent : lastStartEvent;
    const timeDelta = e.timeStamp - lastEvent.timeStamp;
    eventSpeed =
      timeDelta > 0
        ? Math.hypot(
            eventPosition.x - lastEvent.x,
            eventPosition.y - lastEvent.y
          ) / timeDelta
        : 0;

    // Calculate direction
    const direction =
      gesturePoint.getCursorAngle().degrees > lastEvent.angle.degrees
        ? "clockwise"
        : "counterclockwise";

    // Save this event as the last move event
    lastMoveEvent = {
      timeStamp: e.timeStamp,
      x: eventPosition.x,
      y: eventPosition.y,
      angle: gesturePoint.getCursorAngle(),
    };

    func({
      x: eventPosition.x,
      y: eventPosition.y,
      speed: eventSpeed,
      direction,
    });

    e.preventDefault();
  };

  function startEvent(e) {
    startEventWrapper(e, ({ x, y, size }) => {
      gesturePoint.setCursorPosition({ x, y });
      gesturePoint.setOriginPosition({ x, y });
      gesturePoint.setOriginRadius(size);
      gesturePoint.show();
      document.addEventListener("mousemove", moveEvent, { passive: false });
      document.addEventListener("touchmove", moveEvent, { passive: false });
    });
  }

  function moveEvent(e) {
    moveEventWrapper(e, ({ x, y, speed, direction }) => {
      gesturePoint.setCursorPosition({ x, y });
      gesturePoint.setMovementSpeed(speed);
      gesturePoint.setMovementDirection(direction);
    });
  }

  function reset() {
    gesturePoint.reset();
    document.removeEventListener("mousemove", moveEvent);
    document.removeEventListener("touchmove", moveEvent);
    lastStartEvent = false;
    lastMoveEvent = false;
  }

  const attachEventListeners = () => {
    document.addEventListener("mousedown", startEvent, { passive: false });
    document.addEventListener("touchstart", startEvent, { passive: false });
    document.addEventListener("mouseup", reset, { passive: false });
    document.addEventListener("touchend", reset, { passive: false });
    document.addEventListener("touchcancel", reset, { passive: false });
  };

  return {
    attachEventListeners,
  };
};
