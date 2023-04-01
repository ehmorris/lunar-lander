import { randomBool, randomBetween } from "../helpers/helpers.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "../helpers/constants.js";
import { drawLanderGradient } from "./gradient.js";
import { makeParticle } from "../particle.js";

export const makeExplosion = (
  state,
  position,
  velocity,
  fill,
  size,
  amount
) => {
  const smallExplosionChunks = new Array(amount)
    .fill()
    .map(() =>
      makeParticle(
        state,
        position,
        velocity,
        randomBetween(size / 4, size),
        randomBetween(size / 4, size),
        fill
      )
    );

  return {
    draw: () => smallExplosionChunks.forEach((e) => e.draw()),
  };
};

export const makeLanderExplosion = (state, position, velocity, angle) => {
  const CTX = state.get("CTX");

  const _makeLanderChunk = (drawInstructions, yOffset) => {
    const _rotationDirection = randomBool();

    let _position = { ...position };
    let _velocity = { ...velocity };
    let _rotationVelocity = 0.1;
    let _angle = 0;

    const draw = () => {
      [_position, _velocity, _rotationVelocity, _angle] = simpleBallisticUpdate(
        state,
        _position,
        _velocity,
        _angle,
        _rotationDirection,
        _rotationVelocity
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

  const randomPieces = makeExplosion(
    state,
    position,
    velocity,
    drawLanderGradient(CTX),
    randomBetween(2, 20),
    32
  );

  const draw = () => {
    noseCone.draw();
    chunk1.draw();
    chunk2.draw();
    randomPieces.draw();
  };

  return { draw };
};
