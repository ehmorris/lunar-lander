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
  let previousFrameTime = Date.now();
  let currentFrameTime = Date.now();

  const drawFuncContainer = () => {
    currentFrameTime = Date.now();
    drawFunc(currentFrameTime, previousFrameTime);
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
