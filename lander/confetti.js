import {
  randomBool,
  randomBetween,
  simpleBallisticUpdate,
} from "../helpers.js";

export const makeConfetti = (
  CTX,
  canvasWidth,
  canvasHeight,
  amount,
  position
) => {
  const confettiPieces = new Array(amount)
    .fill()
    .map((_, index) =>
      _makeConfettiPiece(
        CTX,
        position
          ? position
          : { x: canvasWidth / 2 + index - amount / 2, y: canvasHeight / 2 },
        { x: index < amount / 2 ? -0.5 : 0.5, y: -1 },
        canvasWidth,
        canvasHeight
      )
    );

  const draw = () => {
    confettiPieces.forEach((e) => e.draw());
  };

  return { draw };
};

const _makeConfettiPiece = (
  CTX,
  position,
  velocity,
  canvasWidth,
  canvasHeight
) => {
  const _size = randomBetween(1, 6);
  const _rotationDirection = randomBool();
  const _groundedHeight = canvasHeight - _size + _size / 2;
  const _color = `hsl(${randomBetween(0, 360)}, 100%, 50%)`;

  let _position = { ...position };
  let _velocity = {
    x: randomBetween(velocity.x / 4, velocity.x) + randomBetween(-0.1, 0.1),
    y: velocity.y + randomBetween(-0.1, 0.1),
  };
  let _rotationVelocity = 0.1;
  let _angle = Math.PI * 2;

  const draw = () => {
    [_position, _velocity, _rotationVelocity, _angle] = simpleBallisticUpdate(
      _position,
      _velocity,
      _angle,
      _groundedHeight,
      _rotationDirection,
      _rotationVelocity,
      canvasWidth
    );

    CTX.save();
    CTX.fillStyle = _color;
    CTX.translate(_position.x, _position.y);
    CTX.rotate(_angle);
    CTX.fillRect(-_size / 2, -_size / 2, _size, _size);
    CTX.restore();
  };

  return { draw };
};
