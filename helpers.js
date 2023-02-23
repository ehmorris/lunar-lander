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

export const roundToNDigits = (number, digits = 0) =>
  Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

export const getVectorVelocity = (velocity) =>
  Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));

export const getAngleDeltaUpright = (angle) => {
  const angleInDeg = (angle * 180) / Math.PI;
  const repeatingAngle = Math.abs(angleInDeg) % 360;
  return repeatingAngle > 180 ? Math.abs(repeatingAngle - 360) : repeatingAngle;
};

export const getDisplayVelocity = (velocity) =>
  getVectorVelocity(velocity) * VELOCITY_MULTIPLIER;

export const getDisplayHeight = (yPos, groundedHeight) =>
  Math.abs(Math.round((yPos - groundedHeight) / 3.5));
