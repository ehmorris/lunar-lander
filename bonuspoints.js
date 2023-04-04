import { progress, transition } from "./helpers/helpers.js";

export const makeBonusPointsManager = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const timeToShowPointsInMS = 2000;
  let timeOfLastPoint = 0;
  let totalPoints = 0;
  let lastPointValue = 0;
  let lastPointLabel = "";
  let hidden = false;

  const namePointMapping = new Map([
    ["smallLandingSurface", 4],
    ["largeLandingSurface", 0],
    ["newRotation", 2],
    ["newHeight", 6],
    ["newSpeed", 6],
  ]);

  const nameLabelMapping = new Map([
    ["smallLandingSurface", "Landed"],
    ["largeLandingSurface", "Landed"],
    ["newRotation", "Flip!"],
    ["newHeight", "Height record!"],
    ["newSpeed", "Speed record!"],
  ]);

  const getPointValue = (name) => namePointMapping.get(name);

  const addNamedPoint = (name) => {
    totalPoints += namePointMapping.get(name);
    lastPointValue = namePointMapping.get(name);
    lastPointLabel = nameLabelMapping.get(name);
    timeOfLastPoint = Date.now();
  };

  const reset = () => {
    timeOfLastPoint = 0;
    totalPoints = 0;
    lastPointValue = 0;
    lastPointLabel = "";
    hidden = false;
  };

  const draw = () => {
    if (
      !hidden &&
      totalPoints > 0 &&
      Date.now() - timeOfLastPoint < timeToShowPointsInMS
    ) {
      const animateInProgress = Math.min(
        1,
        progress(0, 400, Date.now() - timeOfLastPoint)
      );

      function easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      }

      CTX.save();
      CTX.fillStyle = "white";
      CTX.translate(
        canvasWidth / 2,
        canvasHeight / 2 - transition(-16, 0, animateInProgress, easeOutBack)
      );
      CTX.globalAlpha = transition(0, 1, animateInProgress, easeOutBack);
      CTX.scale(
        transition(0.98, 1, animateInProgress, easeOutBack),
        transition(0.98, 1, animateInProgress, easeOutBack)
      );

      CTX.font = "800 24px/1.5 -apple-system, BlinkMacSystemFont, sans-serif";
      const textLine1 = `${lastPointLabel} +${lastPointValue}`;
      CTX.fillText(textLine1, -CTX.measureText(textLine1).width / 2, -16);

      CTX.font = "400 24px/1.5 -apple-system, BlinkMacSystemFont, sans-serif";
      const textLine2 = `${totalPoints} total bonus`;
      CTX.fillText(textLine2, -CTX.measureText(textLine2).width / 2, 16);
      CTX.restore();
    }
  };

  return {
    draw,
    reset,
    getPointValue,
    addNamedPoint,
    getTotalPoints: () => totalPoints,
    hide: () => (hidden = true),
  };
};
