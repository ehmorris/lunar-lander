import {
  randomBool,
  randomBetween,
  simpleBallisticUpdate,
  isAboveTerrain,
} from "./helpers/helpers.js";
import { makeExplosion } from "./lander/explosion.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "./helpers/constants.js";

export const launchAsteroid = (state, getLanderPosition, onLanderCollision) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const _size = randomBetween(12, 30);
  const _rotationDirection = randomBool();
  const _leftOfScreen = randomBool();

  let _position = {
    x: _leftOfScreen ? 0 : canvasWidth,
    y: randomBetween(0, canvasHeight / 2),
  };
  let _velocity = {
    x: _leftOfScreen ? randomBetween(4, 10) : randomBetween(-4, -10),
    y: randomBetween(1, 4),
  };
  let _rotationVelocity = 0.1;
  let _angle = Math.PI * 2;
  let _impact = false;

  const draw = () => {
    if (
      !_impact &&
      isAboveTerrain(
        CTX,
        _position,
        state.get("terrain"),
        state.get("scaleFactor")
      )
    ) {
      [_position, _velocity, _rotationVelocity, _angle] = simpleBallisticUpdate(
        state,
        _position,
        _velocity,
        _angle,
        _rotationDirection,
        _rotationVelocity
      );

      const landerPosition = getLanderPosition();
      const impactXPadding = LANDER_WIDTH;
      const impactYPadding = LANDER_HEIGHT;
      if (
        _position.x > landerPosition.x - impactXPadding &&
        _position.x < landerPosition.x + impactXPadding &&
        _position.y > landerPosition.y - impactYPadding &&
        _position.y < landerPosition.y + impactYPadding
      ) {
        onLanderCollision(_velocity);
        _impact = makeExplosion(
          state,
          _position,
          _velocity,
          "gray",
          _size / 2,
          Math.floor(_size)
        );
      }

      CTX.save();
      CTX.fillStyle = "gray";
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);
      CTX.beginPath();
      CTX.moveTo(-_size * 0.5, 0);
      CTX.lineTo(-_size * 0.4, -_size * 0.4);
      CTX.lineTo(0, -_size * 0.5);
      CTX.lineTo(_size * 0.4, -_size * 0.4);
      CTX.lineTo(_size * 0.5, 0);
      CTX.lineTo(_size * 0.3, _size * 0.3);
      CTX.lineTo(0, _size * 0.5);
      CTX.lineTo(-_size * 0.35, _size * 0.4);
      CTX.closePath();
      CTX.fill();
      CTX.restore();
    } else if (!_impact) {
      _impact = makeExplosion(
        state,
        _position,
        _velocity,
        "gray",
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
