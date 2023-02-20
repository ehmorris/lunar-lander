import {
  CRASH_ANGLE,
  CRASH_VELOCITY,
  VELOCITY_MULTIPLIER,
} from "./constants.js";

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
  const startTime = Date.now();
  let previousFrameTime = Date.now();
  let currentFrameTime = Date.now();

  const drawFuncContainer = () => {
    currentFrameTime = Date.now();
    drawFunc(
      currentFrameTime - startTime,
      currentFrameTime - previousFrameTime
    );
    previousFrameTime = Date.now();
    window.requestAnimationFrame(drawFuncContainer);
  };

  window.requestAnimationFrame(drawFuncContainer);
};

export const randomBool = (probability = 0.5) => Math.random() >= probability;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const roundToNDigits = (number, digits = 0) =>
  Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

export const getVectorVelocity = (velocity) =>
  Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));

export const getAngleDeltaUpright = (angle) => {
  const angleInDeg = (angle * 180) / Math.PI;
  return angle % (Math.PI * 2) > Math.PI
    ? Math.abs(360 - (angleInDeg % 360))
    : Math.abs(angleInDeg % 360);
};

export const getDisplayVelocity = (velocity) =>
  Math.round(getVectorVelocity(velocity) * VELOCITY_MULTIPLIER);

export const scoreToLetterGrade = (score) =>
  score >= 97
    ? "A+"
    : score >= 93
    ? "A"
    : score >= 90
    ? "A-"
    : score >= 87
    ? "B+"
    : score >= 83
    ? "B"
    : score >= 80
    ? "B-"
    : score >= 77
    ? "C+"
    : score >= 73
    ? "C"
    : score >= 70
    ? "C-"
    : score >= 67
    ? "D+"
    : score >= 63
    ? "D"
    : score >= 60
    ? "D-"
    : "F";

// Near perfect land:
// angle: 0
// speed: 1
// rotations: bonus, higher better
//
// Worst possible land:
// angle: 10
// speed: 8
// rotations: bonus, higher better
export const scoreLanding = (angle, speed, rotations) => {
  const worstPossibleCombo = CRASH_ANGLE + CRASH_VELOCITY * VELOCITY_MULTIPLIER;
  const combinedStats = angle + speed;
  const score = Math.round(
    ((combinedStats - worstPossibleCombo) / -worstPossibleCombo) * 100 +
      rotations
  );
  return score;
};

// Least bad possible crash:
// angle: 0
// speed: 9
// rotations: bonus, higher better
//
// Also least bad possible crash:
// angle: 11
// speed: 1
// rotations: bonus, higher better
//
// Expected best possible crash
// speed: 500
// angle: 180
// rotations: bonus, higher better
export const scoreCrash = (angle, speed, rotations) => {
  const worstPossibleCombo = Math.min(CRASH_VELOCITY, CRASH_ANGLE);
  const bestPossibleCombo = 600;
  const combinedStats = angle + speed;
  const score = Math.round(
    ((combinedStats - worstPossibleCombo) /
      (bestPossibleCombo - worstPossibleCombo)) *
      100 +
      rotations
  );
  return score;
};
