import { VELOCITY_MULTIPLIER } from "./constants.js";

export const generateCanvas = ({ width, height, attachNode }) => {
  const element = document.createElement("canvas");
  const context = element.getContext("2d");

  const scale = window.devicePixelRatio;
  element.width = Math.floor(width * scale);
  element.height = Math.floor(height * scale);
  context.scale(scale, scale);

  // The game world is generated once at this size and never regenerated, so
  // the canvas is laid out to fit whatever the viewport becomes rather than
  // being left at its original pixel size. Without this, rotating a phone (or
  // the mobile URL bar collapsing) left part of the screen as bare background
  // with no touch listeners on it at all.
  const fitToViewport = () => {
    const viewportScale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height
    );
    element.style.width = width * viewportScale + "px";
    element.style.height = height * viewportScale + "px";
  };
  fitToViewport();
  window.addEventListener("resize", fitToViewport);
  window.addEventListener("orientationchange", fitToViewport);

  document.querySelector(attachNode).appendChild(element);

  return [context, width, height, element, scale];
};

// A frame gap longer than this is treated as a pause rather than as elapsed
// game time. requestAnimationFrame is throttled to zero while a tab is
// hidden, so without a ceiling the first frame back carries the whole hidden
// duration — at INTERVAL 8 a 30s tab switch yields a multiplier of ~3750,
// which teleports the lander straight through the terrain.
const MAX_DELTA_TIME = 100;

export const animate = (drawFunc) => {
  let elapsed = 0;
  let previousTimestamp = false;

  const resetStartTime = () => (elapsed = 0);

  const drawFuncContainer = (timestamp) => {
    // Queue the next frame before drawing this one. Scheduling afterwards
    // means a single exception anywhere in the render tree stops the loop
    // forever, with no way back short of a reload.
    window.requestAnimationFrame(drawFuncContainer);

    const deltaTime = Math.min(
      previousTimestamp ? timestamp - previousTimestamp : 0,
      MAX_DELTA_TIME
    );
    previousTimestamp = timestamp;

    // Accumulated from clamped deltas rather than read off the wall clock, so
    // that time spent in a hidden tab doesn't inflate the reported duration.
    elapsed += deltaTime;

    drawFunc(elapsed, deltaTime);
  };

  window.requestAnimationFrame(drawFuncContainer);

  return { resetStartTime };
};

// Intl.DurationFormat only became widely available in late 2024, and building
// a formatter is the expensive part of the Intl APIs. Construct one up front,
// once, and only when it is actually supported: this runs inside the render
// loop, so an unguarded `new Intl.DurationFormat` throws on every frame and
// takes the whole game down with it on an older engine.
const durationFormatter = (() => {
  try {
    return new Intl.DurationFormat(undefined, {
      style: "narrow",
      hoursDisplay: "auto",
      minutesDisplay: "auto",
      secondsDisplay: "always",
    });
  } catch {
    return null;
  }
})();

// Fallback for engines without DurationFormat. Still localised — the unit
// style of NumberFormat has been available far longer.
const fallbackUnitFormatters = (() => {
  try {
    const make = (unit) =>
      new Intl.NumberFormat(undefined, {
        style: "unit",
        unit,
        unitDisplay: "narrow",
      });
    return { hours: make("hour"), minutes: make("minute"), seconds: make("second") };
  } catch {
    return null;
  }
})();

// Shows seconds, then minutes, then hours, in the player's own locale.
export const formatDuration = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const duration = {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };

  if (durationFormatter) return durationFormatter.format(duration);

  // Skip leading units that are still zero, so short times stay short
  const units = ["hours", "minutes", "seconds"];
  const shown = units.slice(units.findIndex((unit) => duration[unit] > 0));
  const visible = shown.length ? shown : ["seconds"];

  return visible
    .map((unit) =>
      fallbackUnitFormatters
        ? fallbackUnitFormatters[unit].format(duration[unit])
        : `${duration[unit]}${unit[0]}`
    )
    .join(" ");
};

// role="button" elements are focusable and announced as buttons, but unlike a
// real <button> they do not fire click on Enter or Space. Returns a detach
// function so callers can tear both listeners down together.
export const onActivate = (element, handler) => {
  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler(event);
    }
  };

  element.addEventListener("click", handler);
  element.addEventListener("keydown", onKeyDown);

  return () => {
    element.removeEventListener("click", handler);
    element.removeEventListener("keydown", onKeyDown);
  };
};

export const randomBool = (probability = 0.5) => Math.random() >= probability;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const seededRandomBetween = (min, max, seededRandom) =>
  seededRandom.getSeededRandom() * (max - min) + min;

export const seededRandomBool = (seededRandom, probability = 0.5) =>
  seededRandom.getSeededRandom() >= probability;

export const getVectorVelocity = (velocity) =>
  Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));

// How many more frames the lander could have kept falling before a full-thrust
// burn became the last thing that could still bring it in under safeSpeed.
//
// Distance needed to shed the excess speed is (v² - safeSpeed²) / 2a, so the
// burn is mandatory the instant altitude equals that. Solving
// altitude(t) === stoppingDistance(speed(t)) for t collapses to
// gravity*t² + 2*descentSpeed*t - k = 0.
//
// Everything is in the game's native px-per-INTERVAL units, matching the
// secondsUntilTerrain math in the lander's bottom HUD. Returns 0 when the burn
// is mandatory right now, negative when the window has already closed (which is
// reachable — ground level is approximated by the average terrain height, so a
// low patch of terrain buys real margin), and Infinity when no burn is needed.
export const framesOfBurnSlack = ({
  altitude,
  descentSpeed,
  safeSpeed,
  thrust,
  gravity,
}) => {
  const netDeceleration = thrust - gravity;
  if (netDeceleration <= 0) return -Infinity;

  // Already slow enough to touch down safely, so this isn't a burn that saved
  // anything. Also catches a lander that's rising rather than falling.
  if (descentSpeed <= safeSpeed) return Infinity;

  const stoppingDistance =
    (Math.pow(descentSpeed, 2) - Math.pow(safeSpeed, 2)) /
    (2 * netDeceleration);
  const spareDistance = altitude - stoppingDistance;
  const k = (2 * netDeceleration * spareDistance) / thrust;
  const discriminant = Math.pow(descentSpeed, 2) + gravity * k;

  if (discriminant < 0) return -Infinity;

  return (Math.sqrt(discriminant) - descentSpeed) / gravity;
};

export const getAngleDeltaUpright = (angle) => {
  const angleInDeg = (angle * 180) / Math.PI;
  const repeatingAngle = Math.abs(angleInDeg) % 360;
  return repeatingAngle > 180 ? Math.abs(repeatingAngle - 360) : repeatingAngle;
};

export const getAngleDeltaUprightWithSign = (angle) => {
  const angleInDeg = (angle * 180) / Math.PI;
  const repeatingAngle = Math.abs(angleInDeg) % 360;
  return repeatingAngle > 180 ? repeatingAngle - 360 : repeatingAngle;
};

export const velocityInMPH = (velocity, decimals = 1) =>
  Intl.NumberFormat().format(
    (getVectorVelocity(velocity) * VELOCITY_MULTIPLIER).toFixed(decimals)
  );

export const heightInFeet = (yPos, groundedHeight) =>
  Intl.NumberFormat().format(-1 * Math.round((yPos - groundedHeight) / 3.5));

export const progress = (start, end, current) =>
  (current - start) / (end - start);

export const clampedProgress = (start, end, current) =>
  Math.max(0, Math.min(1, (current - start) / (end - start)));

export const mirroredLoopingProgress = (start, end, current) => {
  const loopedProgress = progress(start, end, current) % 1;
  return Math.floor(current / end) % 2
    ? Math.abs(loopedProgress - 1)
    : loopedProgress;
};

export const percentProgress = (start, end, current) =>
  Math.max(0, Math.min(((current - start) / (end - start)) * 100, 100));

export const transition = (start, end, progress, easingFunc) => {
  const easedProgress = easingFunc ? easingFunc(progress) : progress;
  return start + Math.sign(end - start) * Math.abs(end - start) * easedProgress;
};

export const getLineAngle = (startCoordinate, endCoordinate) => {
  const dy = endCoordinate.y - startCoordinate.y;
  const dx = endCoordinate.x - startCoordinate.x;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  return theta;
};

export const seededShuffleArray = (array, seededRandom) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom.getSeededRandom() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

export const jitterCoordinate = ({ x, y }, jitterAmount = 1) => ({
  x: x + randomBetween(-jitterAmount, jitterAmount),
  y: y + randomBetween(-jitterAmount, jitterAmount),
});

export const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;

export const easeInExpo = (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10));
