import { randomBetween, randomBool } from "../helpers/helpers.js";
import { INTERVAL } from "../helpers/constants.js";

export const makeToyLander = (
  state,
  onEngineOn,
  onLeftRotation,
  onRightRotation,
  onEngineAndRotation
) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");

  const _toyLanderWidth = Math.min(canvasWidth, canvasHeight) / 7;
  const _toyLanderHeight = _toyLanderWidth * 2;
  const _toyLanderBoosterLengthMin = _toyLanderWidth / 4;
  const _toyLanderBoosterLengthMax = _toyLanderWidth * 1.25;
  const _toyLanderEngineLengthMin = _toyLanderHeight / 4;
  const _toyLanderEngineLengthMax = _toyLanderHeight * 1.25;

  let _position = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
  };
  let _rotationVelocity = 0;
  let _angle = Math.PI * 2;
  let _engineOn = false;
  let _rotatingLeft = false;
  let _rotatingRight = false;

  const engineOn = () => {
    _engineOn = true;
    onEngineOn();
  };

  const rotateLeft = () => {
    _rotatingLeft = true;
    onLeftRotation();
  };

  const rotateRight = () => {
    _rotatingRight = true;
    onRightRotation();
  };

  const draw = (deltaTime) => {
    const deltaTimeMultiplier = deltaTime / INTERVAL;

    if ((_engineOn && _rotatingLeft) || (_engineOn && _rotatingRight)) {
      onEngineAndRotation();
    }

    if (_rotatingRight) _rotationVelocity += deltaTimeMultiplier * 0.01;
    if (_rotatingLeft) _rotationVelocity -= deltaTimeMultiplier * 0.01;
    _angle += (Math.PI / 180) * _rotationVelocity;

    // Move to top left of the lander and then rotate at that origin
    CTX.save();
    CTX.fillStyle = state.get("theme").toyLanderGradient(_toyLanderWidth);
    CTX.translate(_position.x, _position.y);
    CTX.rotate(_angle);

    // Draw the lander
    //
    // We want the center of rotation to be in the center of the bottom
    // rectangle, excluding the tip of the lander. To accomplish this, the
    // lander is drawn offset to the top and left of _position.x and y.
    // The tip is also drawn offset to the top of that so that the lander
    // is a bit taller than _toyLanderHeight.
    //
    //                                      /\
    //                                     /  \
    // Start at top left of this segment → |  |
    // and work clockwise.                 |__|
    CTX.beginPath();
    CTX.moveTo(-_toyLanderWidth / 2, -_toyLanderHeight / 2);
    CTX.lineTo(0, -(_toyLanderHeight * 0.9));
    CTX.lineTo(_toyLanderWidth / 2, -_toyLanderHeight / 2);
    CTX.lineTo(_toyLanderWidth / 2, _toyLanderHeight / 2);
    CTX.lineTo(-_toyLanderWidth / 2, _toyLanderHeight / 2);
    CTX.closePath();
    CTX.fill();

    // Translate to the top-left corner of the lander so engine and booster
    // flames can be drawn from 0, 0
    CTX.translate(-_toyLanderWidth / 2, -_toyLanderHeight / 2);

    if (_engineOn || _rotatingLeft || _rotatingRight) {
      CTX.fillStyle = randomBool() ? "#415B8C" : "#F3AFA3";
    }

    // Main engine flame
    if (_engineOn) {
      const _flameHeight = randomBetween(
        _toyLanderEngineLengthMin,
        _toyLanderEngineLengthMax
      );
      const _flameMargin = _toyLanderWidth / 6;
      CTX.beginPath();
      CTX.moveTo(_flameMargin, _toyLanderHeight);
      CTX.lineTo(_toyLanderWidth - _flameMargin, _toyLanderHeight);
      CTX.lineTo(_toyLanderWidth / 2, _toyLanderHeight + _flameHeight);
      CTX.closePath();
      CTX.fill();
    }

    const _boosterLength = randomBetween(
      _toyLanderBoosterLengthMin,
      _toyLanderBoosterLengthMax
    );
    // Right booster flame
    if (_rotatingLeft) {
      CTX.beginPath();
      CTX.moveTo(_toyLanderWidth, 0);
      CTX.lineTo(_toyLanderWidth + _boosterLength, _toyLanderHeight * 0.05);
      CTX.lineTo(_toyLanderWidth, _toyLanderHeight * 0.1);
      CTX.closePath();
      CTX.fill();
    }

    // Left booster flame
    if (_rotatingRight) {
      CTX.beginPath();
      CTX.moveTo(0, 0);
      CTX.lineTo(-_boosterLength, _toyLanderHeight * 0.05);
      CTX.lineTo(0, _toyLanderHeight * 0.1);
      CTX.closePath();
      CTX.fill();
    }

    CTX.restore();
  };

  return {
    draw,
    engineOn,
    engineOff: () => (_engineOn = false),
    rotateLeft,
    rotateRight,
    stopLeftRotation: () => (_rotatingLeft = false),
    stopRightRotation: () => (_rotatingRight = false),
  };
};
