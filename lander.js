import { makeExplosion } from "./explosion.js";
import { makeConfetti } from "./confetti.js";
import { randomBetween, randomBool, getVectorVelocity } from "./helpers.js";
import { drawTrajectory } from "./trajectory.js";
import { GRAVITY, LANDER_WIDTH, LANDER_HEIGHT } from "./constants.js";

export const makeLander = (CTX, canvasWidth, canvasHeight) => {
  const _thrust = 0.01;
  const _crashVelocity = 0.4;
  const _crashAngle = 10;
  const _groundedHeight = canvasHeight - LANDER_HEIGHT + LANDER_HEIGHT / 2;

  let _position;
  let _velocity;
  let _rotationVelocity;
  let _angle;
  let _engineOn;
  let _rotatingLeft;
  let _rotatingRight;
  let _crashedTime;
  let _landed;
  let _confetti;
  let _explosion;

  const _resetProps = () => {
    _position = {
      x: randomBetween(canvasWidth * 0.33, canvasWidth * 0.66),
      y: LANDER_HEIGHT * 2,
    };
    _velocity = {
      x: randomBetween(
        -_thrust * (canvasWidth / 10),
        _thrust * (canvasWidth / 10)
      ),
      y: randomBetween(0, _thrust * (canvasWidth / 10)),
    };
    _rotationVelocity = randomBetween(-0.1, 0.1);
    _angle = randomBetween(Math.PI * 1.5, Math.PI * 2.5);
    _engineOn = false;
    _rotatingLeft = false;
    _rotatingRight = false;
    _landed = false;
    _confetti = false;
    _crashedTime = false;
    _explosion = false;
  };
  _resetProps();

  const _updateProps = () => {
    _position.y = Math.min(_position.y + _velocity.y, _groundedHeight);

    // Is above ground
    if (_position.y < _groundedHeight) {
      if (_rotatingRight) {
        _rotationVelocity += 0.01;
      }
      if (_rotatingLeft) {
        _rotationVelocity -= 0.01;
      }
      if (_position.x < 0) {
        _position.x = canvasWidth;
      }
      if (_position.x > canvasWidth) {
        _position.x = 0;
      }

      _position.x += _velocity.x;
      _angle += (Math.PI / 180) * _rotationVelocity;
      _velocity.y += GRAVITY;

      if (_engineOn) {
        _velocity.x += _thrust * Math.sin(_angle);
        _velocity.y -= _thrust * Math.cos(_angle);
      }
    }
    // Just landed
    else if (
      !_landed &&
      getVectorVelocity(_velocity) < _crashVelocity &&
      Math.abs((_angle * 180) / Math.PI - 360) < _crashAngle
    ) {
      _landed = { angle: _angle, velocity: _velocity };
      _confetti = [
        makeConfetti(
          CTX,
          { x: canvasWidth / 2 - 100, y: canvasHeight / 2 },
          { x: -0.5, y: -1 },
          canvasWidth,
          canvasHeight
        ),
        makeConfetti(
          CTX,
          { x: canvasWidth / 2 + 100, y: canvasHeight / 2 },
          { x: 0.5, y: -1 },
          canvasWidth,
          canvasHeight
        ),
      ];
      _angle = Math.PI * 2;
      _velocity = { x: 0, y: 0 };
      _rotationVelocity = 0;
    }
    // Just crashed
    else if (!_landed && !_crashedTime) {
      _explosion = makeExplosion(
        CTX,
        _position,
        _velocity,
        canvasWidth,
        canvasHeight
      );
      _crashedTime = Date.now();
    }
    // Crashed some time ago
    else if (_crashedTime) {
      if (Date.now() - _crashedTime > 4_000) _resetProps();
    }
  };

  const _drawLandedMessage = () => {
    const speedInMPH = Math.round(getVectorVelocity(_landed.velocity) * 20);
    const angleInDeg = Math.round(
      Math.abs((_landed.angle * 180) / Math.PI - 360)
    );
    let landingType;
    if (speedInMPH < 3 && angleInDeg < 3) landingType = "Perfect";
    else if (speedInMPH < 5 && angleInDeg < 5) landingType = "Decent";
    else if (speedInMPH < 7 && angleInDeg < 7) landingType = "OK";
    else landingType = "Bad";
    const line1 = `${landingType} landing`;
    const line2 = `Speed: ${speedInMPH} MPH`;
    const line3 = `Angle: ${angleInDeg}°`;

    _confetti.forEach((c) => c.draw());

    CTX.save();
    CTX.textAlign = "center";
    CTX.fillStyle = "rgba(255, 255, 255, .8)";
    CTX.font = "normal 24px sans-serif";
    CTX.fillText(line1, canvasWidth / 2, canvasHeight / 2 - 36);
    CTX.fillText(line2, canvasWidth / 2, canvasHeight / 2);
    CTX.fillText(line3, canvasWidth / 2, canvasHeight / 2 + 36);
    CTX.restore();
  };

  const _drawCrashedMessage = () => {
    const speedInMPH = Math.round(getVectorVelocity(_velocity) * 20);
    let crashType;
    if (speedInMPH > 200) crashType = "Incredible";
    else if (speedInMPH > 100) crashType = "Sick";
    else if (speedInMPH > 50) crashType = "Cool";
    else crashType = "Meh";
    const line1 = `${crashType} crash`;
    const line2 = `Speed: ${speedInMPH} MPH`;
    const line3 = `Angle: ${Math.round(
      Math.abs((_angle * 180) / Math.PI - 360)
    )}°`;

    CTX.save();
    CTX.textAlign = "center";
    CTX.fillStyle = "rgba(255, 255, 255, .8)";
    CTX.font = "normal 24px sans-serif";
    CTX.fillText(line1, canvasWidth / 2, canvasHeight / 2 - 36);
    CTX.fillText(line2, canvasWidth / 2, canvasHeight / 2);
    CTX.fillText(line3, canvasWidth / 2, canvasHeight / 2 + 36);
    CTX.restore();
  };

  const draw = () => {
    _updateProps();

    if (!_engineOn && !_rotatingLeft && !_rotatingRight)
      drawTrajectory(
        CTX,
        _position,
        _angle,
        _velocity,
        _rotationVelocity,
        canvasHeight,
        _groundedHeight,
        _crashAngle
      );

    if (_landed) _drawLandedMessage();

    if (_explosion) {
      _explosion.draw();
      _drawCrashedMessage();
    } else {
      // Draw gradient for lander
      const gradient = CTX.createLinearGradient(
        -LANDER_WIDTH / 2,
        0,
        LANDER_WIDTH / 2,
        0
      );
      gradient.addColorStop(0, "#DFE5E5");
      gradient.addColorStop(0.3, "#BDBCC3");
      gradient.addColorStop(0.6, "#4A4E6F");
      gradient.addColorStop(1, "#3D4264");

      // Move to top left of the lander and then rotate at that origin
      CTX.save();
      CTX.fillStyle = gradient;
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);

      // Draw the lander
      //
      // We want the center of rotation to be in the center of the bottom
      // rectangle, excluding the tip of the lander. To accomplish this, the
      // lander is drawn offset to the top and left of _position.x and y.
      // The tip is also drawn offset to the top of that so that the lander
      // is a bit taller than LANDER_HEIGHT.
      //
      //                                      /\
      //                                     /  \
      // Start at top left of this segment → |  |
      // and work clockwise.                 |__|
      CTX.beginPath();
      CTX.moveTo(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);
      CTX.lineTo(0, -LANDER_HEIGHT);
      CTX.lineTo(LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);
      CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT / 2);
      CTX.lineTo(-LANDER_WIDTH / 2, LANDER_HEIGHT / 2);
      CTX.closePath();
      CTX.fill();

      // Translate to the top-left corner of the lander for engine flames
      CTX.translate(-LANDER_WIDTH / 2, -LANDER_HEIGHT / 2);

      if (_engineOn || _rotatingLeft || _rotatingRight) {
        CTX.fillStyle = randomBool() ? "#415B8C" : "#F3AFA3";
      }

      // Main engine flame
      if (_engineOn) {
        const _flameHeight = randomBetween(10, 50);
        const _flameMargin = 3;
        CTX.beginPath();
        CTX.moveTo(_flameMargin, LANDER_HEIGHT);
        CTX.lineTo(LANDER_WIDTH - _flameMargin, LANDER_HEIGHT);
        CTX.lineTo(LANDER_WIDTH / 2, LANDER_HEIGHT + _flameHeight);
        CTX.closePath();
        CTX.fill();
      }

      const _boosterLength = randomBetween(5, 25);
      // Right booster flame
      if (_rotatingLeft) {
        CTX.beginPath();
        CTX.moveTo(LANDER_WIDTH, 0);
        CTX.lineTo(LANDER_WIDTH + _boosterLength, LANDER_HEIGHT * 0.05);
        CTX.lineTo(LANDER_WIDTH, LANDER_HEIGHT * 0.1);
        CTX.closePath();
        CTX.fill();
      }

      // Left booster flame
      if (_rotatingRight) {
        CTX.beginPath();
        CTX.moveTo(0, 0);
        CTX.lineTo(-_boosterLength, LANDER_HEIGHT * 0.05);
        CTX.lineTo(0, LANDER_HEIGHT * 0.1);
        CTX.closePath();
        CTX.fill();
      }
    }
    CTX.restore();

    // Draw speed text beside lander
    CTX.save();
    CTX.fillStyle =
      getVectorVelocity(_velocity) > _crashVelocity
        ? "rgb(255, 0, 0)"
        : "rgb(0, 255, 0)";
    CTX.fillText(
      `${Math.round(getVectorVelocity(_velocity) * 20)} MPH`,
      _position.x + LANDER_WIDTH * 2,
      _position.y
    );
    CTX.restore();
  };

  return {
    draw,
    engineOn: () => (_engineOn = true),
    engineOff: () => (_engineOn = false),
    rotateLeft: () => (_rotatingLeft = true),
    rotateRight: () => (_rotatingRight = true),
    stopRotating: () => {
      _rotatingLeft = false;
      _rotatingRight = false;
    },
  };
};
