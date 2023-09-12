import { LANDER_HEIGHT } from "./helpers/constants.js";
import {
  clampedProgress,
  transition,
  easeOutBack,
  easeInOutSine,
} from "./helpers/helpers.js";

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

  const transitionInOut = (
    inStart,
    inEnd,
    outEnd,
    animationDuration,
    totalLiveTime,
    timeElapsed,
    easingIn,
    easingOut
  ) => {
    const animateInProgress = clampedProgress(
      0,
      animationDuration,
      timeElapsed
    );
    const animateOutProgress = clampedProgress(
      totalLiveTime - animationDuration,
      totalLiveTime,
      timeElapsed
    );

    if (timeElapsed <= animationDuration) {
      return transition(inStart, inEnd, animateInProgress, easingIn);
    } else {
      return transition(inEnd, outEnd, animateOutProgress, easingOut);
    }
  };

  const draw = (displayOffset) => {
    const timeElapsed = Date.now() - timeOfLastPoint;

    if (!hidden && totalPoints > 0 && timeElapsed < timeToShowPointsInMS) {
      const yPosBasis = displayOffset ? LANDER_HEIGHT * 2 : canvasHeight / 2;

      CTX.save();
      CTX.fillStyle = state.get("theme").headlineFontColor;
      CTX.translate(
        canvasWidth / 2,
        yPosBasis -
          transitionInOut(
            -16,
            0,
            24,
            500,
            timeToShowPointsInMS,
            timeElapsed,
            easeOutBack,
            easeInOutSine
          )
      );
      CTX.globalAlpha = transitionInOut(
        0.5,
        1,
        0,
        400,
        timeToShowPointsInMS,
        timeElapsed,
        easeInOutSine,
        easeInOutSine
      );
      CTX.scale(
        transitionInOut(
          0.98,
          1,
          1,
          600,
          timeToShowPointsInMS,
          timeElapsed,
          easeOutBack,
          easeInOutSine
        ),
        transitionInOut(
          0.98,
          1,
          1,
          600,
          timeToShowPointsInMS,
          timeElapsed,
          easeOutBack,
          easeInOutSine
        )
      );

      CTX.font = "800 24px/1.5 -apple-system, BlinkMacSystemFont, sans-serif";
      CTX.textAlign = "center";
      CTX.fillText(`${lastPointLabel} +${lastPointValue}`, 0, -12);

      CTX.font = "400 16px/1.5 -apple-system, BlinkMacSystemFont, sans-serif";
      CTX.letterSpacing = "1px";
      CTX.fillText(`${totalPoints} TOTAL BONUS`, 0, 12);
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
