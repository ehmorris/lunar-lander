import { randomBool, randomBetween } from "./helpers.js";
import { GRAVITY } from "./constants.js";

export const makeExplosion = (
  CTX,
  position,
  velocity,
  canvasWidth,
  canvasHeight
) => {
  const explosionPieces = new Array(20)
    .fill()
    .map(() =>
      _makeExplosionPiece(CTX, position, velocity, canvasWidth, canvasHeight)
    );

  const draw = () => {
    explosionPieces.forEach((e) => e.draw());
  };

  return { draw };
};

const _makeExplosionPiece = (
  CTX,
  position,
  velocity,
  canvasWidth,
  canvasHeight
) => {
  const _width = randomBetween(1, 20);
  const _height = randomBetween(1, 40);
  const _rotationDirection = randomBool();
  const _groundedHeight = canvasHeight - _height + _height / 2;
  const _gradient = CTX.createLinearGradient(-_width / 2, 0, _height / 2, 0);
  _gradient.addColorStop(0, "#DFE5E5");
  _gradient.addColorStop(0.3, "#BDBCC3");
  _gradient.addColorStop(0.6, "#4A4E6F");
  _gradient.addColorStop(1, "#3D4264");

  let _position = { ...position };
  let _velocity = {
    x: randomBetween(velocity.x / 4, velocity.x) + randomBetween(-0.1, 0.1),
    y: velocity.y + randomBetween(-0.1, 0.1),
  };
  let _rotationVelocity = 0;
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
        ? (_rotationVelocity += randomBetween(0, 0.01))
        : (_rotationVelocity -= randomBetween(0, 0.01));
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
    CTX.save();
    CTX.fillStyle = _gradient;
    CTX.translate(_position.x, _position.y);
    CTX.rotate(_angle);
    CTX.fillRect(-_width / 2, -_height / 2, _width, _height);
    CTX.restore();
  };

  return { draw };
};
