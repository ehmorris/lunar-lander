import {
  seededRandomBool,
  seededRandomBetween,
  getVectorVelocity,
  transition,
  clampedProgress,
  easeInExpo,
} from "./helpers/helpers.js";
import { makeExplosion } from "./lander/explosion.js";
import { LANDER_WIDTH, LANDER_HEIGHT } from "./helpers/constants.js";
import { makeParticle } from "./particle.js";

export const makeAsteroid = (state, getLanderPosition, onLanderCollision) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const seededRandom = state.get("seededRandom").getStream("asteroids");
  const visibilityDuration = 5_000;
  const fill = state.get("theme").asteroid;
  const size = seededRandomBetween(12, 30, seededRandom);
  const leftOfScreen = seededRandomBool(seededRandom);
  let timeOfExplosion = Date.now();
  let startPosition = {
    x: leftOfScreen ? 0 : canvasWidth,
    y: seededRandomBetween(0, canvasHeight / 2, seededRandom),
  };
  let startVelocity = {
    x: leftOfScreen
      ? seededRandomBetween(4, 10, seededRandom)
      : seededRandomBetween(-4, -10, seededRandom),
    y: seededRandomBetween(1, 4, seededRandom),
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
      Math.floor(size)
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
    true,
    onImpact
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
          y: asteroid.getVelocity().y * 0.1,
        },
        fill,
        // Smaller pieces for faster impacts (vaporized)
        // Typical vector velocity range is .5–10
        transition(15, 3, getVectorVelocity(asteroid.getVelocity()) / 10),
        Math.floor(size)
      );
    }
  };

  const draw = (deltaTime, displayOffset = 0) => {
    if (!explosion) {
      const landerPosition = getLanderPosition();
      const impactXPadding = LANDER_WIDTH;
      const impactYPadding = LANDER_HEIGHT;
      const asteroidPosition = asteroid.getPosition();
      // Asteroids are drawn inside a translate that grows as the lander
      // climbs, while the lander is drawn outside it. Comparing raw positions
      // meant the hit test drifted hundreds of pixels away from what was on
      // screen, so apply the same offset the renderer does.
      const asteroidScreenY = asteroidPosition.y + displayOffset;
      if (
        asteroidPosition.x > landerPosition.x - impactXPadding &&
        asteroidPosition.x < landerPosition.x + impactXPadding &&
        asteroidScreenY > landerPosition.y - impactYPadding &&
        asteroidScreenY < landerPosition.y + impactYPadding
      ) {
        onLanderCollision(asteroid.getVelocity());
        onImpact(asteroidPosition, asteroid.getVelocity());
      }

      asteroid.draw(deltaTime);
    } else if (explosion && Date.now() - timeOfExplosion < visibilityDuration) {
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
  };

  return { draw, destroy };
};
