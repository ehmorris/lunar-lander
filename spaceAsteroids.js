import {
  getVectorVelocity,
  transition,
  randomBetween,
  clampedProgress,
  easeInExpo,
} from "./helpers/helpers.js";
import { makeExplosion } from "./lander/explosion.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "./helpers/constants.js";
import { makeParticle } from "./particle.js";

export const makeSpaceAsteroid = (
  state,
  getLanderVelocity,
  getLanderPosition,
  onLanderCollision
) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const fill = state.get("theme").asteroid;
  const size = randomBetween(12, 30);
  const visibilityDuration = 5_000;
  let timeOfExplosion = Date.now();
  let offScreen = false;
  let startPosition = {
    x: randomBetween(0, canvasWidth),
    y: -size,
  };
  let startVelocity = {
    x: randomBetween(-1, 1),
    y: -getLanderVelocity().y,
  };

  let explosion = false;

  const onImpact = (collisionPoint, collisionVelocity) => {
    timeOfExplosion = Date.now();
    explosion = makeExplosion(
      state,
      collisionPoint,
      // Slow down velocity to prevent debris from going really high in the air
      { x: collisionVelocity.x * 0.8, y: collisionVelocity.y * 0.2 },
      fill,
      // Smaller pieces for faster impacts (vaporized)
      // Typical vector velocity range is .5–10
      transition(15, 3, getVectorVelocity(collisionVelocity) / 10),
      Math.floor(size),
      false
    );
  };

  const asteroid = makeParticle(
    state,
    startPosition,
    startVelocity,
    size,
    size,
    fill,
    (CTX, position, _, rotationAngle, fill) => {
      CTX.fillStyle = fill;
      CTX.translate(position.x, position.y);
      CTX.rotate(rotationAngle);
      CTX.beginPath();
      CTX.moveTo(-size * 0.5, 0);
      CTX.lineTo(-size * 0.4, -size * 0.4);
      CTX.lineTo(0, -size * 0.5);
      CTX.lineTo(size * 0.4, -size * 0.4);
      CTX.lineTo(size * 0.5, 0);
      CTX.lineTo(size * 0.3, size * 0.3);
      CTX.lineTo(0, size * 0.5);
      CTX.lineTo(-size * 0.35, size * 0.4);
      CTX.closePath();
      CTX.fill();
    },
    false
  );

  const destroy = () => {
    if (!explosion) {
      timeOfExplosion = Date.now();
      explosion = makeExplosion(
        state,
        asteroid.getPosition(),
        // Slow down velocity to prevent debris from going really high in the air
        {
          x: asteroid.getVelocity().x * 0.4,
          y: asteroid.getVelocity().y * 0.4,
        },
        fill,
        // Smaller pieces for faster impacts (vaporized)
        // Typical vector velocity range is .5–10
        transition(15, 3, getVectorVelocity(asteroid.getVelocity()) / 10),
        Math.floor(size),
        false
      );
    }
  };

  const draw = (deltaTime) => {
    if (!offScreen) {
      if (asteroid.getPosition().y > canvasHeight + size) {
        offScreen = true;
      }

      if (!explosion) {
        const landerPosition = getLanderPosition();
        const impactXPadding = LANDER_WIDTH;
        const impactYPadding = LANDER_HEIGHT;
        const asteroidPosition = asteroid.getPosition();
        if (
          asteroidPosition.x > landerPosition.x - impactXPadding &&
          asteroidPosition.x < landerPosition.x + impactXPadding &&
          asteroidPosition.y > landerPosition.y - impactYPadding &&
          asteroidPosition.y < landerPosition.y + impactYPadding
        ) {
          onLanderCollision(asteroid.getVelocity());
          onImpact(asteroidPosition, asteroid.getVelocity());
        }

        asteroid.draw(deltaTime);
      } else if (
        explosion &&
        Date.now() - timeOfExplosion < visibilityDuration
      ) {
        CTX.save();
        const animationProgress = clampedProgress(
          0,
          visibilityDuration,
          Date.now() - timeOfExplosion
        );
        CTX.globalAlpha = transition(1, 0, animationProgress, easeInExpo);

        explosion.draw(deltaTime);
        CTX.restore();
      }
    }
  };

  // Nothing ever removed these from the array, so they accumulated for as
  // long as the player stayed in space.
  const isFinished = () =>
    offScreen || (explosion && Date.now() - timeOfExplosion >= visibilityDuration);

  return { draw, destroy, isFinished };
};
