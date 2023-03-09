import {
  randomBool,
  randomBetween,
  simpleBallisticUpdate,
} from "../helpers/helpers.js";
import { makeExplosion } from "./lander/explosion.js";

export const launchAstroid = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const _size = randomBetween(12, 30);
  const _rotationDirection = randomBool();
  const _groundedHeight = canvasHeight - _size + _size / 2;
  const _leftOfScreen = randomBool();

  let _position = {
    x: _leftOfScreen ? -_size : canvasWidth + _size,
    y: randomBetween(0, canvasHeight / 2),
  };
  let _velocity = {
    x: _leftOfScreen ? randomBetween(1, 10) : randomBetween(-1, -10),
    y: randomBetween(-1, 4),
  };
  let _rotationVelocity = 0.1;
  let _angle = Math.PI * 2;
  let _impact = false;

  const draw = () => {
    if (_position.y < _groundedHeight) {
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
      CTX.fillStyle = "red";
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);
      CTX.fillRect(-_size / 2, -_size / 2, _size, _size);
      CTX.restore();
    } else if (!_impact) {
      _impact = makeExplosion(
        state,
        _position,
        _velocity,
        "red",
        _size / 2,
        Math.floor(_size)
      );
    }

    if (_impact) {
      _impact.draw();
    }
  };

  return { draw };
};
