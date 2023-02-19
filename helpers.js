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

export const textLayout = ({
  CTX,
  fontSize,
  canvasWidth,
  canvasHeight,
  lines,
}) => {
  const lineHeight = 1.5 * fontSize;
  const verticalCenterOffset = ((lines.length - 1) * lineHeight) / 2;
  CTX.save();
  CTX.textAlign = "center";
  CTX.fillStyle = "rgba(255, 255, 255, .8)";
  CTX.font = `${fontSize}px sans-serif`;
  lines.forEach((line, index) => {
    CTX.fillText(
      line,
      canvasWidth / 2,
      canvasHeight / 2 + (index * lineHeight - verticalCenterOffset)
    );
  });
  CTX.restore();
};
export const randomBool = (probability = 0.5) => Math.random() >= probability;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const roundToNDigits = (number, digits = 0) =>
  Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

export const getVectorVelocity = (velocity) =>
  Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));

export const getAngleDeltaUpright = (angle) =>
  Math.abs((angle * 180) / Math.PI - 360) % 360;
