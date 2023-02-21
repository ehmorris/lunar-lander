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
  let startTime = Date.now();
  let previousFrameTime = Date.now();
  let currentFrameTime = Date.now();

  const resetStartTime = () => (startTime = Date.now());

  const drawFuncContainer = () => {
    currentFrameTime = Date.now();
    drawFunc(
      currentFrameTime - startTime,
      currentFrameTime - previousFrameTime,
      resetStartTime
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

export const landingScoreDescription = (score) =>
  score >= 100
    ? "Perfect landing, incredible, you can't get better than this"
    : score >= 97
    ? "Super smooth, soft landing - almost perfect"
    : score >= 95
    ? "Very nice landing"
    : score >= 93
    ? "Pretty good landing, could be better"
    : score >= 90
    ? "A good landing, keep trying"
    : score >= 85
    ? "You were so close to a great landing"
    : score >= 80
    ? "A solid “B” landing, as-in “be better”"
    : score >= 75
    ? "You landed but it wasn’t pretty"
    : score >= 70
    ? "Not the worst landing, but not very good either"
    : score >= 60
    ? "How did you make it through astronaut school?"
    : score >= 50
    ? "Pretty bad landing, but it could be worse"
    : score >= 40
    ? "Basically a fender bender, but you landed"
    : score >= 30
    ? "Barely a landing"
    : "That was a terrible landing, try harder";

export const crashScoreDescription = (score) =>
  score >= 100
    ? "Ludicrous crash - the debris has entered orbit"
    : score >= 97
    ? "Incredible crash, the lander has vaporized"
    : score >= 95
    ? "Impressive speed, impressive angle - you crashed with style"
    : score >= 93
    ? "A fast crash, but it could be faster"
    : score >= 90
    ? "You obviously meant to crash, so crash *harder* next time"
    : score >= 85
    ? "Why don’t you apply these crashing skills to landing instead?"
    : score >= 80
    ? "You definitely did not land…"
    : score >= 75
    ? "I think there’s a problem with the lander"
    : score >= 70
    ? "Sick crash"
    : score >= 60
    ? "Were you trying to land, or…"
    : score >= 50
    ? "A bad crash, but it could be worse - why don’t you try for worse"
    : score >= 40
    ? "It isn’t pretty"
    : score >= 30
    ? "A smooth… wait… you crashed"
    : "So, so close to a landing - but still a crash";

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
  const bestPossibleCombo = 900;
  const combinedStats = angle + speed;
  const score = Math.round(
    ((combinedStats - worstPossibleCombo) /
      (bestPossibleCombo - worstPossibleCombo)) *
      100 +
      rotations
  );
  return score;
};
