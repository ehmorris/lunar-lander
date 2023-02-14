import { randomBool, randomBetween } from "./helpers.js";

export const makeExplosionPiece = (
  CTX,
  xPos,
  velocity,
  canvasWidth,
  canvasHeight
) => {
  const _width = randomBetween(6, 14);
  const _height = randomBetween(6, 14);
  const _gravity = 0.004;
  const _rotationDirection = randomBool();
  const _groundedHeight = canvasHeight - _height + _height / 2;

  let _position = {
    x: xPos,
    y: _groundedHeight,
  };
  let _velocity = {
    x: randomBetween(velocity.x / 4, velocity.x) + randomBetween(-0.1, 0.1),
    y: randomBetween(-velocity.y / 8, -velocity.y / 3),
  };
  let _rotationVelocity = 0.1;
  let _angle = Math.PI * 2;

  const _updateProps = () => {
    _position.y = Math.min(_position.y + _velocity.y, _groundedHeight + 1);

    if (_position.y <= _groundedHeight) {
      _rotationDirection
        ? (_rotationVelocity += 0.01)
        : (_rotationVelocity -= 0.01);
      _position.x += _velocity.x;
      _angle += (Math.PI / 180) * _rotationVelocity;
      _velocity.y += _gravity;
    } else {
      _angle = Math.PI * 2;
      _velocity.x =
        _velocity.x > 0
          ? Math.max(0, _velocity.x - 0.005)
          : Math.min(0, _velocity.x + 0.005);
      _velocity.y = 0;
      _position.x += _velocity.x;
      _rotationVelocity = 0;
    }
  };

  const draw = () => {
    _updateProps();
    CTX.fillStyle = "#BDBCC3";
    CTX.save();
    CTX.translate(_position.x, _position.y);
    CTX.rotate(_angle);
    CTX.fillRect(-_width / 2, -_height / 2, _width, _height);
    CTX.restore();
  };

  return { draw };
};
