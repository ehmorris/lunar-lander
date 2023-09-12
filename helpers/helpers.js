import { VELOCITY_MULTIPLIER } from "./constants.js";

export const generateCanvas = ({ width, height, attachNode }) => {
  const element = document.createElement("canvas");
  const context = element.getContext("2d");

  element.style.width = width + "px";
  element.style.height = height + "px";

  const scale = window.devicePixelRatio;
  element.width = Math.floor(width * scale);
  element.height = Math.floor(height * scale);
  context.scale(scale, scale);

  document.querySelector(attachNode).appendChild(element);

  return [context, width, height, element, scale];
};

export const animate = (drawFunc) => {
  let startTime = Date.now();
  let currentFrameTime = Date.now();
  let previousTimestamp = false;

  const resetStartTime = () => (startTime = Date.now());

  const drawFuncContainer = (timestamp) => {
    currentFrameTime = Date.now();
    const deltaTime = previousTimestamp
      ? timestamp - previousTimestamp
      : performance.now() - timestamp;
    drawFunc(currentFrameTime - startTime, deltaTime);
    window.requestAnimationFrame(drawFuncContainer);
    previousTimestamp = timestamp;
  };

  window.requestAnimationFrame(drawFuncContainer);

  return { resetStartTime };
};

export const randomBool = (probability = 0.5) => Math.random() >= probability;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const seededRandomBetween = (min, max, seededRandom) =>
  seededRandom.getSeededRandom() * (max - min) + min;

export const seededRandomBool = (seededRandom, probability = 0.5) =>
  seededRandom.getSeededRandom() >= probability;

export const getVectorVelocity = (velocity) =>
  Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));

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

export const velocityInMPH = (velocity) =>
  Intl.NumberFormat().format(
    (getVectorVelocity(velocity) * VELOCITY_MULTIPLIER).toFixed(1)
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
