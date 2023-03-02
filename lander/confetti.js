import {
  randomBool,
  randomBetween,
  simpleBallisticUpdate,
} from "../helpers/helpers.js";

export const makeConfetti = (state, amount, position) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");

  const _makeConfettiPiece = (position, velocity) => {
    const _size = randomBetween(1, 6);
    const _rotationDirection = randomBool();
    const _groundedHeight = canvasHeight - _size + _size / 2;
    const _color = `hsl(${randomBetween(0, 360)}, 100%, 50%)`;

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
      CTX.fillStyle = _color;
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);
      CTX.fillRect(-_size / 2, -_size / 2, _size, _size);
      CTX.restore();
    };

    return { draw };
  };

  const confettiPieces = new Array(amount)
    .fill()
    .map((_, index) =>
      _makeConfettiPiece(
        position
          ? position
          : { x: canvasWidth / 2 + index - amount / 2, y: canvasHeight / 2 },
        { x: index < amount / 2 ? -0.5 : 0.5, y: -1 }
      )
    );

  const draw = () => {
    confettiPieces.forEach((e) => e.draw());
  };

  return { draw };
};
