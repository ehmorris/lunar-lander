import { randomBool, randomBetween } from "./helpers.js";
import { GRAVITY } from "./constants.js";

export const makeConfetti = (
  CTX,
  canvasWidth,
  canvasHeight,
  magnitude,
  position
) => {
  const confettiPieces = new Array(magnitude)
    .fill()
    .map((_, index) =>
      _makeConfettiPiece(
        CTX,
        position
          ? position
          : { x: canvasWidth / 2 + index - magnitude / 2, y: canvasHeight / 2 },
        { x: index < magnitude / 2 ? -0.5 : 0.5, y: -1 },
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

  const _updateProps = () => {
    _position.y = Math.min(_position.y + _velocity.y, _groundedHeight + 1);

    if (_position.y <= _groundedHeight) {
      if (_position.x < 0) {
        _position.x = canvasWidth;
      }
      if (_position.x > canvasWidth) {
        _position.x = 0;
      }

      _rotationDirection
        ? (_rotationVelocity += 0.01)
        : (_rotationVelocity -= 0.01);
      _position.x += _velocity.x;
      _angle += (Math.PI / 180) * _rotationVelocity;
      _velocity.y += GRAVITY;
    } else {
      _velocity.x = _velocity.x / randomBetween(1.5, 3);
      _velocity.y = -_velocity.y / randomBetween(1.5, 3);
      _position.x += _velocity.x;
      _rotationVelocity = _rotationVelocity / 2;
    }
  };

  const draw = () => {
    _updateProps();
    CTX.fillStyle = _color;
    CTX.save();
    CTX.translate(_position.x, _position.y);
    CTX.rotate(_angle);
    CTX.fillRect(-_size / 2, -_size / 2, _size, _size);
    CTX.restore();
  };

  return { draw };
};
