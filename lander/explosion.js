import {
  randomBool,
  randomBetween,
  simpleBallisticUpdate,
} from "../helpers.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "../constants.js";
import { drawLanderGradient } from "./gradient.js";

export const makeExplosion = (
  CTX,
  position,
  velocity,
  angle,
  canvasWidth,
  canvasHeight
) => {
  const _makeLanderChunk = (drawInstructions, height) => {
    const _rotationDirection = randomBool();
    const _groundedHeight = canvasHeight - height + height / 2;

    let _position = { ...position };
    let _velocity = { ...velocity };
    let _rotationVelocity = 0.1;
    let _angle = angle;

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
      CTX.fillStyle = drawLanderGradient(CTX);
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);
      CTX.beginPath();
      drawInstructions();
      CTX.closePath();
      CTX.fill();
      CTX.restore();
    };

    return { draw };
  };

  const _makeRandomExplosionPiece = (position, velocity) => {
    const _width = randomBetween(1, 20);
    const _height = randomBetween(1, 40);
    const _rotationDirection = randomBool();
    const _groundedHeight = canvasHeight - _height + _height / 2;

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
      CTX.fillStyle = drawLanderGradient(CTX);
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);
      CTX.fillRect(-_width / 2, -_height / 2, _width, _height);
      CTX.restore();
    };

    return { draw };
  };

  const noseCone = _makeLanderChunk(() => {
    CTX.moveTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);
    CTX.lineTo(0, -LANDER_HEIGHT);
    CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);
  }, LANDER_HEIGHT / 2);

  const chunk1 = _makeLanderChunk(() => {
    CTX.moveTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);
    CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);
    CTX.lineTo(LANDER_WIDTH / 2, 0);
    CTX.lineTo(-LANDER_WIDTH / 2, 0);
  }, LANDER_HEIGHT / 2);

  const chunk2 = _makeLanderChunk(() => {
    CTX.lineTo(-LANDER_WIDTH / 2, 0);
    CTX.lineTo(LANDER_WIDTH / 2, 0);
    CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 2);
    CTX.lineTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 2);
  }, LANDER_HEIGHT / 2);

  const smallExplosionChunks = new Array(20)
    .fill()
    .map(() => _makeRandomExplosionPiece(position, velocity));

  const draw = () => {
    // noseCone.draw();
    // chunk1.draw();
    // chunk2.draw();
    smallExplosionChunks.forEach((e) => e.draw());
  };

  return { draw };
};
