import { makeExplosion } from "./explosion.js";
import { makeConfetti } from "./confetti.js";
import {
  randomBetween,
  randomBool,
  getVectorVelocity,
  getDisplayVelocity,
  getAngleDeltaUpright,
  scoreLanding,
  scoreCrash,
} from "./helpers.js";
import { drawTrajectory } from "./trajectory.js";
import {
  GRAVITY,
  LANDER_WIDTH,
  LANDER_HEIGHT,
  CRASH_VELOCITY,
  CRASH_ANGLE,
} from "./constants.js";

export const makeLander = (CTX, canvasWidth, canvasHeight, onGameEnd) => {
  const _thrust = 0.01;
  const _groundedHeight = canvasHeight - LANDER_HEIGHT + LANDER_HEIGHT / 2;

  let _position;
  let _velocity;
  let _rotationVelocity;
  let _angle;
  let _engineOn;
  let _rotatingLeft;
  let _rotatingRight;
  let _crashed;
  let _landed;
  let _flipConfetti;
  let _lastRotation;
  let _lastRotationAngle;
  let _rotationCount;

  const resetProps = () => {
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
    _crashed = false;
    _flipConfetti = [];
    _lastRotation = 1;
    _lastRotationAngle = Math.PI * 2;
    _rotationCount = 0;
  };
  resetProps();

  const _updateProps = (timeSinceStart, timeSinceLastFrame) => {
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

      // Count rotations and update state
      const rotations = Math.floor(_angle / (Math.PI * 2));
      if (
        Math.abs(_angle - _lastRotationAngle) > Math.PI * 2 &&
        (rotations > _lastRotation || rotations < _lastRotation)
      ) {
        _rotationCount++;
        _lastRotation = rotations;
        _lastRotationAngle = _angle;
        _flipConfetti.push(
          makeConfetti(CTX, canvasWidth, canvasHeight, 10, _position)
        );
      }
    }
    // Just landed
    else if (
      !_landed &&
      getVectorVelocity(_velocity) < CRASH_VELOCITY &&
      getAngleDeltaUpright(_angle) < CRASH_ANGLE
    ) {
      const speedInMPH = getDisplayVelocity(_velocity);
      const angleInDeg = Math.round(getAngleDeltaUpright(_angle));
      const score = scoreLanding(speedInMPH, angleInDeg, _rotationCount);
      _landed = {
        type: "landing",
        score,
        speed: speedInMPH,
        angle: angleInDeg,
        rotations: _rotationCount,
        confetti: makeConfetti(
          CTX,
          canvasWidth,
          canvasHeight,
          Math.round(score)
        ),
      };

      onGameEnd(_landed);

      _angle = Math.PI * 2;
      _velocity = { x: 0, y: 0 };
      _rotationVelocity = 0;
    }
    // Just crashed
    else if (!_landed && !_crashed) {
      const speedInMPH = getDisplayVelocity(_velocity);
      const angleInDeg = Math.round(getAngleDeltaUpright(_angle));
      _crashed = {
        type: "crash",
        score: scoreCrash(speedInMPH, angleInDeg, _rotationCount),
        speed: speedInMPH,
        angle: angleInDeg,
        rotations: _rotationCount,
        explosion: makeExplosion(
          CTX,
          _position,
          _velocity,
          canvasWidth,
          canvasHeight
        ),
      };
      onGameEnd(_crashed);
    }
  };

  const draw = (timeSinceStart, timeSinceLastFrame) => {
    _updateProps(timeSinceStart, timeSinceLastFrame);

    if (!_engineOn && !_rotatingLeft && !_rotatingRight) {
      drawTrajectory(
        CTX,
        _position,
        _angle,
        _velocity,
        _rotationVelocity,
        canvasHeight,
        _groundedHeight
      );
    }

    if (_flipConfetti.length > 0) {
      _flipConfetti.forEach((c) => c.draw());
    }

    if (_landed) {
      _landed.confetti.draw();
    }

    // Draw the lander when it hasn't crashed
    if (_crashed) {
      _crashed.explosion.draw();
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

      // Translate to the top-left corner of the lander so engine and booster
      // flames can be drawn from 0, 0
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

      CTX.restore();
    }

    // Draw speed and angle text beside lander, even after crashing
    CTX.save();
    CTX.fillStyle =
      getVectorVelocity(_velocity) > CRASH_VELOCITY
        ? "rgb(255, 0, 0)"
        : "rgb(0, 255, 0)";
    CTX.fillText(
      `${getDisplayVelocity(_velocity)} MPH`,
      _position.x + LANDER_WIDTH * 2,
      _position.y - 8
    );
    CTX.fillStyle =
      getAngleDeltaUpright(_angle) > CRASH_ANGLE
        ? "rgb(255, 0, 0)"
        : "rgb(0, 255, 0)";
    CTX.fillText(
      `${Math.round(getAngleDeltaUpright(_angle))}°`,
      _position.x + LANDER_WIDTH * 2,
      _position.y + 8
    );
    CTX.restore();
  };

  return {
    draw,
    resetProps,
    engineOn: () => (_engineOn = true),
    engineOff: () => (_engineOn = false),
    rotateLeft: () => (_rotatingLeft = true),
    rotateRight: () => (_rotatingRight = true),
    stopLeftRotation: () => (_rotatingLeft = false),
    stopRightRotation: () => (_rotatingRight = false),
  };
};
