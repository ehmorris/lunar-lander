import {
  GRAVITY,
  LANDER_WIDTH,
  LANDER_HEIGHT,
  CRASH_ANGLE,
} from "../helpers/constants.js";

export const drawTrajectory = (
  state,
  currentPosition,
  currentAngle,
  currentVelocity,
  currentRotationVelocity
) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const terrainLandingData = state.get("terrain").getLandingData();
  const scaleFactor = state.get("scaleFactor");
  let projectedXPosition = currentPosition.x;
  let projectedYPosition = currentPosition.y;
  let projectedAngle = currentAngle;
  let projectedYVelocity = currentVelocity.y;
  let index = 0;

  const incrementValues = () => {
    projectedYPosition = Math.min(
      projectedYPosition + projectedYVelocity,
      canvasHeight
    );
    projectedXPosition += currentVelocity.x;
    projectedAngle += (Math.PI / 180) * currentRotationVelocity;
    projectedYVelocity += GRAVITY;
  };

  // Start trajectory line
  CTX.save();
  CTX.beginPath();
  CTX.moveTo(projectedXPosition, projectedYPosition);

  // Draw the line in two segments: above the max terrainHeight, where we
  // don't have to do any terrain detection; and below the max terrainHeight,
  // where we have to call isPointInPath
  while (projectedYPosition < terrainLandingData.terrainHeight) {
    incrementValues();

    if (index % 2) {
      CTX.lineTo(projectedXPosition, projectedYPosition);
    }
    index++;
  }

  // Draw line between max terrain height and actual terrain
  while (
    projectedYPosition >= terrainLandingData.terrainHeight &&
    projectedYPosition <= canvasHeight &&
    projectedXPosition <= canvasWidth &&
    projectedXPosition >= 0 &&
    !CTX.isPointInPath(
      terrainLandingData.terrainPath2D,
      projectedXPosition * scaleFactor,
      projectedYPosition * scaleFactor
    )
  ) {
    incrementValues();

    if (index % 2) {
      CTX.lineTo(projectedXPosition, projectedYPosition);
    }
    index++;
  }

  // Finish trajectory line
  CTX.strokeStyle = "rgb(255, 255, 255, .25)";
  CTX.stroke();

  // Draw landing zone angle indicator
  if (Math.abs((projectedAngle * 180) / Math.PI - 360) < CRASH_ANGLE) {
    CTX.strokeStyle = "rgb(0, 255, 0)";
  } else {
    CTX.strokeStyle = "rgb(255, 0, 0)";
  }
  const arrowSize = Math.max(Math.min(projectedYVelocity * 4, 20), 2);
  CTX.translate(projectedXPosition, projectedYPosition);
  CTX.rotate(projectedAngle + Math.PI);
  CTX.beginPath();
  CTX.moveTo(0, 0);
  CTX.lineTo(0, LANDER_HEIGHT);
  CTX.lineTo(-arrowSize, LANDER_HEIGHT);
  CTX.lineTo(0, LANDER_HEIGHT + arrowSize);
  CTX.lineTo(arrowSize, LANDER_HEIGHT);
  CTX.lineTo(0, LANDER_HEIGHT);
  CTX.closePath();
  CTX.stroke();
  CTX.restore();
};
