import { VELOCITY_MULTIPLIER, GRAVITY } from "./constants.js";

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

  return [context, width, height, element];
};

export const animate = (drawFunc) => {
  let startTime = Date.now();
  let currentFrameTime = Date.now();

  const resetStartTime = () => (startTime = Date.now());

  const drawFuncContainer = () => {
    currentFrameTime = Date.now();
    drawFunc(currentFrameTime - startTime);
    window.requestAnimationFrame(drawFuncContainer);
  };

  window.requestAnimationFrame(drawFuncContainer);

  return { resetStartTime };
};

export const randomBool = (probability = 0.5) => Math.random() >= probability;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const seededRandomBetween = (min, max, seededRandom) =>
  seededRandom.getSeededRandom() * (max - min) + min;

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
  Intl.NumberFormat().format(
    Math.abs(Math.round((yPos - groundedHeight) / 3.5))
  );

// Progress
// Transforms any number range into a range of 0–1
//
// Expected behavior:
// progress(5, 30, 17.5) -> .5
// progress(30, 5, 17.5) -> .5
// progress(5, 30, 30)   -> 1
export const progress = (start, end, current) =>
  (current - start) / (end - start);

export const percentProgress = (start, end, current) =>
  Math.max(0, Math.min(((current - start) / (end - start)) * 100, 100));

export const simpleBallisticUpdate = (
  currentPosition,
  currentVelocity,
  currentAngle,
  groundedHeight,
  rotationDirection,
  currentRotationVelocity,
  canvasWidth
) => {
  const newPosition = { ...currentPosition };
  const newVelocity = { ...currentVelocity };
  let newRotationVelocity;
  let newAngle = currentAngle;

  newPosition.y = Math.min(
    currentPosition.y + currentVelocity.y,
    groundedHeight + 1
  );
  newPosition.x = currentPosition.x + currentVelocity.x;

  if (newPosition.y <= groundedHeight) {
    newRotationVelocity = rotationDirection
      ? currentRotationVelocity + randomBetween(0, 0.01)
      : currentRotationVelocity - randomBetween(0, 0.01);
    newAngle = currentAngle + (Math.PI / 180) * newRotationVelocity;
    newVelocity.y = currentVelocity.y + GRAVITY;

    if (newPosition.x < 0) newPosition.x = canvasWidth;
    if (newPosition.x > canvasWidth) newPosition.x = 0;
  } else {
    newVelocity.x = currentVelocity.x / randomBetween(1.5, 3);
    newVelocity.y = -currentVelocity.y / randomBetween(1.5, 3);
    newRotationVelocity = currentRotationVelocity / 2;
  }

  return [newPosition, newVelocity, newRotationVelocity, newAngle];
};
