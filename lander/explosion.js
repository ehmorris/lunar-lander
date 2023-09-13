import { randomBetween, jitterCoordinate } from "../helpers/helpers.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "../helpers/constants.js";
import { makeParticle } from "../particle.js";

export const makeExplosion = (
  state,
  position,
  velocity,
  fill,
  size,
  amount,
  useTerrain = true
) => {
  const smallExplosionChunks = new Array(amount)
    .fill()
    .map(() =>
      makeParticle(
        state,
        jitterCoordinate(position),
        jitterCoordinate(velocity),
        randomBetween(size / 4, size),
        randomBetween(size / 4, size),
        fill,
        false,
        useTerrain
      )
    );

  return {
    draw: (deltaTime) => smallExplosionChunks.forEach((e) => e.draw(deltaTime)),
  };
};

export const makeLanderExplosion = (
  state,
  position,
  velocity,
  angle,
  useTerrain = true
) => {
  const gradient = state.get("theme").landerGradient;

  const noseCone = makeParticle(
    state,
    position,
    jitterCoordinate(velocity),
    LANDER_WIDTH,
    LANDER_HEIGHT / 2,
    gradient,
    (CTX, position, _, rotationAngle, fill) => {
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
      CTX.translate(position.x, position.y);
      CTX.rotate(angle);

      // Step 2: adjust this chunk to its own offset position and own axis of
      // rotation. This is the rotation that's updated by the ballistic update
      CTX.fillStyle = fill;
      CTX.translate(0, -LANDER_HEIGHT / 2 + 4);
      CTX.rotate(rotationAngle);
      CTX.beginPath();
      CTX.moveTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 4 - 4);
      CTX.lineTo(0, -LANDER_HEIGHT / 4 - 4);
      CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 4 - 4);
      CTX.closePath();
      CTX.fill();
    },
    useTerrain
  );

  const chunk1 = makeParticle(
    state,
    position,
    jitterCoordinate(velocity),
    LANDER_WIDTH,
    LANDER_HEIGHT / 2,
    gradient,
    (CTX, position, _, rotationAngle, fill) => {
      CTX.translate(position.x, position.y);
      CTX.rotate(angle);
      CTX.fillStyle = fill;
      CTX.translate(0, LANDER_HEIGHT / 2);
      CTX.rotate(rotationAngle);
      CTX.beginPath();
      CTX.moveTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
      CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
      CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
      CTX.lineTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
      CTX.closePath();
      CTX.fill();
    },
    useTerrain
  );

  const chunk2 = makeParticle(
    state,
    position,
    jitterCoordinate(velocity),
    LANDER_WIDTH,
    LANDER_HEIGHT / 2,
    gradient,
    (CTX, position, _, rotationAngle, fill) => {
      CTX.translate(position.x, position.y);
      CTX.rotate(angle);
      CTX.fillStyle = fill;
      CTX.translate(0, 0);
      CTX.rotate(rotationAngle);
      CTX.beginPath();
      CTX.lineTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
      CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 4);
      CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
      CTX.lineTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 4);
      CTX.closePath();
      CTX.fill();
    },
    useTerrain
  );

  const randomPieces = makeExplosion(
    state,
    position,
    velocity,
    gradient,
    randomBetween(2, 20),
    32,
    useTerrain
  );

  const draw = (deltaTime) => {
    noseCone.draw(deltaTime);
    chunk1.draw(deltaTime);
    chunk2.draw(deltaTime);
    randomPieces.draw(deltaTime);
  };

  return { draw };
};
