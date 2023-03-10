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
  currentRotationVelocity,
  groundedHeight
) => {
  const CTX = state.get("CTX");
  const canvasHeight = state.get("canvasHeight");
  let projectedXPosition = currentPosition.x;
  let projectedYPosition = currentPosition.y;
  let projectedAngle = currentAngle;
  let projectedYVelocity = currentVelocity.y;
  let index = 0;

  // Start trajectory line
  CTX.save();
  CTX.translate(LANDER_WIDTH / 2, LANDER_HEIGHT / 2);
  CTX.beginPath();
  CTX.moveTo(
    projectedXPosition - LANDER_WIDTH / 2,
    projectedYPosition - LANDER_HEIGHT / 2
  );

  // Draw line
  while (projectedYPosition < groundedHeight) {
    projectedYPosition = Math.min(
      projectedYPosition + projectedYVelocity,
      groundedHeight
    );
    projectedXPosition += currentVelocity.x;
    projectedAngle += (Math.PI / 180) * currentRotationVelocity;
    projectedYVelocity += GRAVITY;

    if (index % 2) {
      CTX.lineTo(
        projectedXPosition - LANDER_WIDTH / 2,
        projectedYPosition - LANDER_HEIGHT / 2
      );
    }

    if (index === 2) {
      let dy = projectedYPosition - currentPosition.y;
      let dx = projectedXPosition - currentPosition.x;
      window.landerStats.projectedAngle = Math.atan(-dx / dy);
    }
    index++;
  }

  CTX.strokeStyle = "rgb(255, 255, 255, .25)";
  CTX.stroke();

  // Draw landing zone angle indicator
  if (Math.abs((projectedAngle * 180) / Math.PI - 360) < CRASH_ANGLE) {
    CTX.strokeStyle = "rgb(0, 255, 0)";
  } else {
    CTX.strokeStyle = "rgb(255, 0, 0)";
  }
  const arrowSize = Math.min(projectedYVelocity * 4, 20);
  CTX.translate(
    projectedXPosition - LANDER_WIDTH / 2,
    canvasHeight - LANDER_HEIGHT
  );
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
