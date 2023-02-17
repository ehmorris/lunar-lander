export const drawTrajectory = (
  CTX,
  currentPosition,
  currentAngle,
  currentVelocity,
  currentRotationVelocity,
  gravity,
  vehicleWidth,
  vehicleHeight,
  canvasHeight,
  groundedHeight,
  crashAngle
) => {
  let projectedXPosition = currentPosition.x;
  let projectedYPosition = currentPosition.y;
  let projectedAngle = currentAngle;
  let projectedYVelocity = currentVelocity.y;
  let index = 0;

  // Start trajectory line
  CTX.save();
  CTX.translate(vehicleWidth / 2, vehicleHeight / 2);
  CTX.beginPath();
  CTX.moveTo(
    projectedXPosition - vehicleWidth / 2,
    projectedYPosition - vehicleHeight / 2
  );

  // Draw line
  while (projectedYPosition < groundedHeight) {
    projectedYPosition = Math.min(
      projectedYPosition + projectedYVelocity,
      groundedHeight
    );
    projectedXPosition += currentVelocity.x;
    projectedAngle += (Math.PI / 180) * currentRotationVelocity;
    projectedYVelocity += gravity;

    if (index % 2) {
      CTX.lineTo(
        projectedXPosition - vehicleWidth / 2,
        projectedYPosition - vehicleHeight / 2
      );
    }

    index++;
  }

  CTX.strokeStyle = "rgb(255, 255, 255, .25)";
  CTX.stroke();

  // Draw landing zone angle indicator
  if (Math.abs((projectedAngle * 180) / Math.PI - 360) < crashAngle) {
    CTX.strokeStyle = "green";
  } else {
    CTX.strokeStyle = "red";
  }
  const arrowSize = projectedYVelocity * 4;
  CTX.translate(
    projectedXPosition - vehicleWidth / 2,
    canvasHeight - vehicleHeight
  );
  CTX.rotate(projectedAngle + Math.PI);
  CTX.beginPath();
  CTX.moveTo(0, 0);
  CTX.lineTo(0, vehicleHeight);
  CTX.lineTo(-arrowSize, vehicleHeight);
  CTX.lineTo(0, vehicleHeight + arrowSize);
  CTX.lineTo(arrowSize, vehicleHeight);
  CTX.lineTo(0, vehicleHeight);
  CTX.closePath();
  CTX.stroke();
  CTX.restore();
};
