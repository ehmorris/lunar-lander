import { GRAVITY, LANDER_HEIGHT, CRASH_ANGLE } from "../helpers/constants.js";

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

  // Iterate on ballistic properties until hitting the ground, and push these
  // points into an array to draw later
  const generateTrajectoryPoints = () => {
    let projectedXPosition = currentPosition.x;
    let projectedYPosition = currentPosition.y;
    let projectedYVelocity = currentVelocity.y;
    let projectedAngle = currentAngle;
    const segments = [];

    while (
      projectedYPosition <= canvasHeight &&
      projectedXPosition <= canvasWidth &&
      projectedXPosition >= 0 &&
      !CTX.isPointInPath(
        terrainLandingData.terrainPath2D,
        projectedXPosition * scaleFactor,
        projectedYPosition * scaleFactor
      )
    ) {
      segments.push({ x: projectedXPosition, y: projectedYPosition });

      projectedYPosition = Math.min(
        projectedYPosition + projectedYVelocity,
        canvasHeight
      );
      projectedXPosition += currentVelocity.x;
      projectedAngle += (Math.PI / 180) * currentRotationVelocity;
      projectedYVelocity += GRAVITY;
    }

    return [
      segments,
      {
        projectedXPosition,
        projectedYPosition,
        projectedYVelocity,
        projectedAngle,
      },
    ];
  };

  const [segments, lastSegment] = generateTrajectoryPoints();

  if (segments.length > 20) {
    CTX.save();
    CTX.globalAlpha = 0.4;

    const gradientLength = Math.floor(segments.length / 2);
    segments.forEach(({ x, y }, index) => {
      if (segments.length > index + 1) {
        const nextSegment = segments[index + 1];
        CTX.beginPath();
        CTX.moveTo(x, y);
        CTX.lineTo(nextSegment.x, nextSegment.y);
        CTX.strokeStyle = `rgba(255, 255, 255, ${index / gradientLength})`;
        CTX.stroke();
      }
    });

    // Draw landing zone angle indicator
    if (
      lastSegment.projectedXPosition > 0 &&
      lastSegment.projectedXPosition < canvasWidth
    ) {
      const arrowSize = Math.max(
        Math.min(lastSegment.projectedYVelocity * 4, 20),
        2
      );
      const arrowLength = Math.max(
        Math.min(lastSegment.projectedYVelocity * 30, 60),
        5
      );
      CTX.globalAlpha = 1;
      CTX.strokeStyle = "#fff";
      CTX.translate(
        lastSegment.projectedXPosition,
        lastSegment.projectedYPosition
      );
      CTX.rotate(lastSegment.projectedAngle + Math.PI);
      CTX.beginPath();
      CTX.moveTo(0, 0);
      CTX.lineTo(0, arrowLength);
      CTX.lineTo(-arrowSize, arrowLength);
      CTX.lineTo(0, arrowLength + arrowSize);
      CTX.lineTo(arrowSize, arrowLength);
      CTX.lineTo(0, arrowLength);
      CTX.closePath();
      CTX.stroke();
    }
    CTX.restore();
  }
};
