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

  const addMultiplier = (points) => {
    totalPoints *= points;
  };

  const addNamedPoint = (name) => {
    switch (name) {
      case "newRotation":
        totalPoints += 40;
        lastPointValue = 40;
        lastPointLabel = "Flip";
        break;
      case "newHeight":
        totalPoints += 80;
        lastPointValue = 80;
        lastPointLabel = "Height record";
        break;
      case "newSpeed":
        totalPoints += 80;
        lastPointValue = 80;
        lastPointLabel = "Speed record";
        break;
    }
    timeOfLastPoint = Date.now();
  };

  const reset = () => (totalPoints = 0);

  const draw = () => {
    if (
      !hidden &&
      totalPoints > 0 &&
      Date.now() - timeOfLastPoint < timeToShowPointsInMS
    ) {
      CTX.save();
      CTX.font = "800 24px/1.5 -apple-system, BlinkMacSystemFont, sans-serif";
      CTX.fillStyle = "white";
      CTX.fillText(
        `${lastPointLabel} +${lastPointValue}`,
        canvasWidth / 2 -
          CTX.measureText(`${lastPointLabel} +${lastPointValue}`).width / 2,
        canvasHeight / 2 - 16
      );

      CTX.font = "400 24px/1.5 -apple-system, BlinkMacSystemFont, sans-serif";
      CTX.fillText(
        `${totalPoints} total bonus`,
        canvasWidth / 2 -
          CTX.measureText(`${totalPoints} total bonus`).width / 2,
        canvasHeight / 2 + 16
      );
      CTX.restore();
    }
  };

  return {
    draw,
    reset,
    addMultiplier,
    addNamedPoint,
    getTotalPoints: () => totalPoints,
    hide: () => (hidden = true),
  };
};
