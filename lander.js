import { degToRad, clampNumber } from "./helpers.js";

export const makeLander = (CTX, canvasProps) => {
  let _width = 20;
  let _height = 20;
  let _gravity = 0.04;
  let _position = {
    x: 50,
    y: 0,
  };

  let _boosterThrust = 0;
  let _boosterAngle = 0;
  let _boosterThrusting = false;
  let _boosterStartTime = null;

  let _engineThrusting = false;
  let _engineStartTime = null;

  const props = {
    speed: 0,
    heading: 90,
    MAX_FUEL: 300,
    MAX_BOOSTER_FUEL: 300,
    THRUST_MAX: 0.1,
  };

  const boosterProps = {
    fuel: props.MAX_BOOSTER_FUEL,
  };

  const engineProps = {
    thrust: 0,
    fuel: props.MAX_FUEL,
  };

  const startBooster = ({ angle }) => {
    if (boosterProps.fuel > 0) {
      if (!_boosterThrusting) {
        _boosterStartTime = Date.now();
        _boosterAngle = angle;
        _boosterThrusting = true;
      }
      const timeDelta = (Date.now() - _boosterStartTime) / 100;
      boosterProps.fuel = Math.max(boosterProps.fuel - timeDelta, 0);
      _boosterThrust = clampNumber({
        number: (props.THRUST_MAX / 4) * timeDelta,
        min: 0,
        max: props.THRUST_MAX,
      });
      angle < props.heading ? (props.heading += 1) : (props.heading -= 1);
    } else {
      endBooster();
    }
  };

  const endBooster = () => {
    _boosterThrusting = false;
    _boosterThrust = 0;
  };

  const startEngine = () => {
    if (engineProps.fuel > 0) {
      if (!_engineThrusting) {
        _engineStartTime = Date.now();
        _engineThrusting = true;
      }
      const timeDelta = (Date.now() - _engineStartTime) / 100;
      engineProps.fuel = Math.max(engineProps.fuel - timeDelta, 0);
      engineProps.thrust = clampNumber({
        number: 0.05 * timeDelta,
        min: 0,
        max: props.THRUST_MAX,
      });
      props.heading = 90;
    } else {
      endEngine();
    }
  };

  const endEngine = () => {
    _engineThrusting = false;
    engineProps.thrust = 0;
  };

  const _getSpeed = (currentFrameTime, previousFrameTime) => {
    return new Promise((resolve) => {
      const timeDelta = (currentFrameTime - previousFrameTime) / 100;
      const isGrounded = _position.y >= canvasProps.height - _height;
      const boundedCurrentSpeed = isGrounded ? 0 : props.speed;
      const newSpeed =
        boundedCurrentSpeed - engineProps.thrust + _gravity * timeDelta;
      const boundedNewSpeed = isGrounded ? Math.min(newSpeed, 0) : newSpeed;

      return resolve(boundedNewSpeed);
    });
  };

  const _getNextPosition = () => {
    return new Promise((resolve) => {
      const prospectiveNewLocation = {
        x: _position.x + props.speed * Math.cos(degToRad(props.heading)),
        y: _position.y + props.speed * Math.sin(degToRad(props.heading)),
      };

      if (prospectiveNewLocation.y > canvasProps.height - _height) {
        return resolve({
          x: prospectiveNewLocation.x,
          y: canvasProps.height - _height,
        });
      } else {
        return resolve(prospectiveNewLocation);
      }
    });
  };

  async function draw(currentFrameTime, previousFrameTime) {
    props.speed = await _getSpeed(currentFrameTime, previousFrameTime);

    // RENDER LANDER
    CTX.fillStyle = "green";
    CTX.fillRect(_position.x, _position.y, _width, _height);

    if (engineProps.thrust > 0) {
      CTX.fillStyle = "orange";
      const thrustSize = _width / 2;
      CTX.fillRect(
        _position.x + _width / 2 - thrustSize / 2,
        _position.y + _height,
        thrustSize,
        thrustSize
      );
    }

    if (_boosterThrust > 0) {
      CTX.save();
      CTX.fillStyle = "orange";
      const boosterSize = _width / 3;
      CTX.translate(_position.x + _width / 2, _position.y + _height / 2);
      CTX.rotate(degToRad(_boosterAngle));
      CTX.fillRect(0, 0, boosterSize, boosterSize);
      CTX.restore();
    }

    _position = await _getNextPosition();
  }

  return {
    draw,
    startBooster,
    endBooster,
    startEngine,
    endEngine,
    props,
    engineProps,
    boosterProps,
  };
};
