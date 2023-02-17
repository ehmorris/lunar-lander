import { makeExplosion } from "./explosion.js";
import { randomBetween, randomBool } from "./helpers.js";

export const makeLander = (CTX, canvasWidth, canvasHeight) => {
  const _width = 20;
  const _height = 40;
  const _gravity = 0.004;
  const _thrust = 0.01;
  const _crashVelocity = 0.4;
  const _crashAngle = 10;
  const _groundedHeight = canvasHeight - _height + _height / 2;

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
      y: _height * 2,
    };
    _velocity = {
      x: randomBetween(
        -_thrust * (canvasWidth / 10),
        _thrust * (canvasWidth / 10)
      ),
      y: randomBetween(0, _thrust * (canvasWidth / 10)),
    };
    _rotationVelocity = randomBetween(-0.1, 0.1);
    _angle = randomBetween(Math.PI * 2, Math.PI);
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
      _position.x += _velocity.x;
      _angle += (Math.PI / 180) * _rotationVelocity;
      _velocity.y += _gravity;

      if (_engineOn) {
        _velocity.x += _thrust * Math.sin(_angle);
        _velocity.y -= _thrust * Math.cos(_angle);
      }
    }
    // Just landed
    else if (
      !_landed &&
      _velocity.y < _crashVelocity &&
      _velocity.x < _crashVelocity &&
      Math.abs((_angle * 180) / Math.PI - 360) < _crashAngle
    ) {
      _landed = { angle: _angle, velocity: _velocity };
      _confetti = [
        makeExplosion(
          CTX,
          { x: canvasWidth / 2 - 100, y: canvasHeight / 2 },
          { x: -0.5, y: 3 },
          canvasHeight
        ),
        makeExplosion(
          CTX,
          { x: canvasWidth / 2 + 100, y: canvasHeight / 2 },
          { x: 0.5, y: 3 },
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
        { x: _position.x, y: _groundedHeight },
        _velocity,
        canvasHeight
      );
      _crashedTime = Date.now();
    }
    // Crashed some time ago
    else if (_crashedTime) {
      if (Date.now() - _crashedTime > 4_000) _resetProps();
    }
  };

  const _drawTrajectory = () => {
    let projectedYPosition = _position.y;
    let projectedXPosition = _position.x;
    let projectedAngle = _angle;
    let projectedYVelocity = _velocity.y;
    let index = 0;

    // Start trajectory line
    CTX.save();
    CTX.translate(_width / 2, _height / 2);
    CTX.beginPath();
    CTX.moveTo(
      projectedXPosition - _width / 2,
      projectedYPosition - _height / 2
    );

    // Draw line
    while (projectedYPosition < _groundedHeight) {
      projectedYPosition = Math.min(
        projectedYPosition + projectedYVelocity,
        _groundedHeight
      );
      projectedXPosition += _velocity.x;
      projectedAngle += (Math.PI / 180) * _rotationVelocity;
      projectedYVelocity += _gravity;

      if (index % 2) {
        CTX.lineTo(
          projectedXPosition - _width / 2,
          projectedYPosition - _height / 2
        );
      }

      index++;
    }

    CTX.strokeStyle = "rgb(255, 255, 255, .25)";
    CTX.stroke();

    // Draw landing zone angle indicator
    if (Math.abs((projectedAngle * 180) / Math.PI - 360) < _crashAngle) {
      CTX.strokeStyle = "green";
    } else {
      CTX.strokeStyle = "red";
    }
    const arrowSize = projectedYVelocity * 4;
    CTX.translate(projectedXPosition - _width / 2, canvasHeight - _height);
    CTX.rotate(projectedAngle + Math.PI);
    CTX.beginPath();
    CTX.moveTo(0, 0);
    CTX.lineTo(0, _height);
    CTX.lineTo(-arrowSize, _height);
    CTX.lineTo(0, _height + arrowSize);
    CTX.lineTo(arrowSize, _height);
    CTX.lineTo(0, _height);
    CTX.closePath();
    CTX.stroke();
    CTX.restore();
  };

  const _drawSpeed = () => {
    CTX.save();
    CTX.fillStyle =
      _velocity.y > _crashVelocity || _velocity.x > _crashVelocity
        ? "red"
        : "green";
    CTX.fillText(
      `${Math.abs(Math.round(_velocity.y * 20))} MPH`,
      _position.x + _width * 2,
      _position.y
    );
    CTX.restore();
  };

  const _drawLandedMessage = () => {
    const speedInMPH = Math.round(_landed.velocity.y * 20);
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

  const draw = () => {
    _updateProps();

    if (!_engineOn && !_rotatingLeft && !_rotatingRight) _drawTrajectory();

    _drawSpeed();

    if (_landed) _drawLandedMessage();

    if (_explosion) {
      _explosion.draw();
    } else {
      // Draw gradient for lander
      const gradient = CTX.createLinearGradient(-_width / 2, 0, _width / 2, 0);
      gradient.addColorStop(0, "#DFE5E5");
      gradient.addColorStop(0.3, "#BDBCC3");
      gradient.addColorStop(0.6, "#4A4E6F");
      gradient.addColorStop(1, "#3D4264");
      CTX.fillStyle = gradient;

      // Move to top left of the lander and then rotate at that origin
      CTX.save();
      CTX.translate(_position.x, _position.y);
      CTX.rotate(_angle);

      // Draw the lander
      //
      // We want the center of rotation to be in the center of the bottom
      // rectangle, excluding the tip of the lander. To accomplish this, the
      // lander is drawn offset to the top and left of _position.x and y.
      // The tip is also drawn offset to the top of that so that the lander
      // is a bit taller than _height.
      //
      //                                      /\
      //                                     /  \
      // Start at top left of this segment → |  |
      // and work clockwise.                 |__|
      CTX.beginPath();
      CTX.moveTo(-_width / 2, -_height / 2);
      CTX.lineTo(0, -_height);
      CTX.lineTo(_width / 2, -_height / 2);
      CTX.lineTo(_width / 2, _height / 2);
      CTX.lineTo(-_width / 2, _height / 2);
      CTX.closePath();
      CTX.fill();

      // Translate to the top-left corner of the lander for engine flames
      CTX.translate(-_width / 2, -_height / 2);

      if (_engineOn || _rotatingLeft || _rotatingRight) {
        CTX.fillStyle = randomBool() ? "#415B8C" : "#F3AFA3";
      }

      // Main engine flame
      if (_engineOn) {
        CTX.beginPath();
        CTX.moveTo(0, _height);
        CTX.lineTo(_width, _height);
        CTX.lineTo(_width / 2, _height + Math.random() * _height);
        CTX.lineTo(0, _height);
        CTX.closePath();
        CTX.fill();
      }

      // Right booster flame
      if (_rotatingLeft) {
        CTX.beginPath();
        CTX.moveTo(_width, 0);
        CTX.lineTo(_width + Math.random() * _width, _height * 0.05);
        CTX.lineTo(_width, _height * 0.1);
        CTX.lineTo(_width, 0);
        CTX.closePath();
        CTX.fill();
      }

      // Left booster flame
      if (_rotatingRight) {
        CTX.beginPath();
        CTX.moveTo(0, 0);
        CTX.lineTo(-Math.random() * _width, _height * 0.05);
        CTX.lineTo(0, _height * 0.1);
        CTX.lineTo(0, 0);
        CTX.closePath();
        CTX.fill();
      }
    }

    CTX.restore();
  };

  return {
    draw,
    getVelocity: () => _velocity,
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
