import {
  randomBool,
  randomBetween,
  simpleBallisticUpdate,
} from "../helpers/helpers.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "../helpers/constants.js";
import { drawLanderGradient } from "./gradient.js";

export const makeExplosion = (state, position, velocity, angle) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");

  const _makeLanderChunk = (drawInstructions, yOffset) => {
    const _rotationDirection = randomBool();
    const _height = LANDER_HEIGHT / 3 + yOffset;
    const _groundedHeight = canvasHeight - _height + _height / 2;

    let _position = { ...position };
    let _velocity = { ...velocity };
    let _rotationVelocity = 0.1;
    let _angle = 0;

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

      // In order to render three separate pieces in the same location as the
      // single-piece lander, we have to render them all at the x and y
      // and rotation of the lander, then offset each piece on the y axis. We
      // also want these pieces to move and rotate independently. To do this,
      // they need their own axis of rotation, but we have to move the lander
      // x and y rather than the offset piece's x and y.
      //
      // Step 1: move to lander position and rotation. This is the position
      // which will be updated by the ballistic update. This rotation is the
      // angle of the lander on crash and will not be updated.
      CTX.save();
      CTX.translate(_position.x, _position.y);
      CTX.rotate(angle);

      // Step 2: adjust this chunk to its own offset position and own axis of
      // rotation. This is the rotation that's updated by the ballistic update
      CTX.fillStyle = drawLanderGradient(CTX);
      CTX.translate(0, yOffset);
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
    const _width = randomBetween(2, 20);
    const _height = randomBetween(2, 20);
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
    CTX.moveTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 4 - 4);
    CTX.lineTo(0, -LANDER_HEIGHT / 4 - 4);
    CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 4 - 4);
  }, -LANDER_HEIGHT / 2 + 4);

  const chunk1 = _makeLanderChunk(() => {
    CTX.moveTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
    CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
    CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
    CTX.lineTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
  }, LANDER_HEIGHT / 2);

  const chunk2 = _makeLanderChunk(() => {
    CTX.lineTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
    CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
    CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
    CTX.lineTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
  }, 0);

  const smallExplosionChunks = new Array(32)
    .fill()
    .map(() => _makeRandomExplosionPiece(position, velocity));

  const draw = () => {
    noseCone.draw();
    chunk1.draw();
    chunk2.draw();
    smallExplosionChunks.forEach((e) => e.draw());
  };

  return { draw };
};
