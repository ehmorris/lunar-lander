const degToRad = (deg) => deg * (Math.PI / 180);

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

  return context;
};

export const nextPositionAlongHeading = ({
  position,
  velocity,
  headingInDeg,
}) => ({
  x: position.x + velocity * Math.cos(degToRad(headingInDeg)),
  y: position.y + velocity * Math.sin(degToRad(headingInDeg))
});