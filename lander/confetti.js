import {
  randomBetween,
  mirroredLoopingProgress,
  jitterCoordinate,
} from "../helpers/helpers.js";
import { makeParticle } from "../particle.js";

export const makeConfetti = (state, amount, passedPosition, passedVelocity) => {
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const audio = state.get("audioManager");
  const confettiTypeAmount = Math.round(amount / 2);
  let hasPlayedAudio = false;

  const _startingPosition = (index) =>
    passedPosition
      ? passedPosition
      : {
          x: canvasWidth / 2 + index - confettiTypeAmount / 2,
          y: canvasHeight / 2,
        };

  const _startingVelocity = (index) =>
    passedVelocity
      ? {
          x:
            index < confettiTypeAmount / 2
              ? passedVelocity.x - 1
              : passedVelocity.x + 1,
          y: passedVelocity.y - 0.6,
        }
      : {
          x: index < confettiTypeAmount / 2 ? -0.5 : 0.5,
          y: -1,
        };

  const confettiPieces = new Array(confettiTypeAmount)
    .fill()
    .map((_, index) => {
      const size = randomBetween(1, 6);
      return makeParticle(
        state,
        jitterCoordinate(_startingPosition(index)),
        jitterCoordinate(_startingVelocity(index)),
        size,
        size,
        `hsl(${randomBetween(0, 360)}, 100%, 50%)`
      );
    });

  const twirlPieces = new Array(confettiTypeAmount).fill().map((_, index) => {
    const size = randomBetween(4, 8);
    return makeParticle(
      state,
      jitterCoordinate(_startingPosition(index)),
      jitterCoordinate(_startingVelocity(index)),
      size,
      size,
      `hsl(${randomBetween(0, 360)}, 100%, 50%)`,
      (CTX, position, velocity, _, fill, rotationVelocity) => {
        const twirlWidth =
          mirroredLoopingProgress(0, 3, Math.abs(rotationVelocity)) * size;
        CTX.fillStyle = fill;
        CTX.translate(position.x, position.y);
        CTX.beginPath();
        CTX.moveTo(-twirlWidth / 2, 0);
        CTX.lineTo(0, -size / 2);
        CTX.lineTo(twirlWidth / 2, 0);
        CTX.lineTo(0, size / 2);
        CTX.closePath();
        CTX.fill();
      }
    );
  });

  const draw = (deltaTime) => {
    if (!hasPlayedAudio) {
      audio.playConfetti();
      hasPlayedAudio = true;
    }
    confettiPieces.forEach((e) => e.draw(deltaTime));
    twirlPieces.forEach((e) => e.draw(deltaTime));
  };

  return { draw };
};
