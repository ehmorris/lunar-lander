// Drag controls point the lander straight at the player's finger, but the
// lander still turns by firing its side boosters rather than snapping to the
// new heading. Each frame the rotation velocity is steered toward whatever
// would close most of the remaining gap, capped at the speed from which the
// boosters can still stop in time, so it swings around fast without
// overshooting and without depending on the frame rate.

// How quickly the lander closes on the target: the remaining angle shrinks by
// about two thirds every STEERING_TIME_CONSTANT_MS once it's close
const STEERING_TIME_CONSTANT_MS = 40;
// Rotation velocity is in degrees per INTERVAL frame, like the rest of the
// lander physics, and acceleration in degrees per INTERVAL frame squared
const MAX_STEERING_VELOCITY = 12;
const MAX_STEERING_ACCELERATION = 1.2;

// Corrections smaller than this are the lander holding its heading and don't
// read as a booster firing
const BOOSTER_THRESHOLD = 0.04;

// Keep a booster lit briefly after its last correction so small wobbles around
// the target don't flicker the flame and restart the sound every frame
const BOOSTER_HOLD_MS = 140;

export const makeSteering = (audioManager) => {
  let _targetAngle = null;
  let _boostingLeftUntil = 0;
  let _boostingRightUntil = 0;
  let _boostingLeft = false;
  let _boostingRight = false;
  let _time = 0;

  const _setBoosters = (left, right) => {
    if (left !== _boostingLeft && audioManager) {
      if (left) audioManager.playBoosterSound1();
      else audioManager.stopBoosterSound1();
    }
    if (right !== _boostingRight && audioManager) {
      if (right) audioManager.playBoosterSound2();
      else audioManager.stopBoosterSound2();
    }
    _boostingLeft = left;
    _boostingRight = right;
  };

  // Returns the new rotation velocity. Called every frame whether or not the
  // player is steering so the boosters can time out.
  const update = (angle, rotationVelocity, deltaTime, deltaTimeMultiplier) => {
    _time += deltaTime;

    if (_targetAngle === null) {
      _setBoosters(false, false);
      return rotationVelocity;
    }

    // Shortest signed distance to the target, so a lander that has already
    // flipped five times doesn't unwind all five to get back to upright
    const delta = Math.atan2(
      Math.sin(_targetAngle - angle),
      Math.cos(_targetAngle - angle)
    );
    const deltaDegrees = (delta * 180) / Math.PI;
    const distance = Math.abs(deltaDegrees);

    // Per frame rather than per INTERVAL, so that a slow frame closes more of
    // the gap instead of overshooting it
    const closingSpeed =
      (distance * (1 - Math.exp(-deltaTime / STEERING_TIME_CONSTANT_MS))) /
      Math.max(deltaTimeMultiplier, 1e-6);
    // Fastest speed the boosters can still brake from before the target
    const brakingSpeed = Math.sqrt(2 * MAX_STEERING_ACCELERATION * distance);
    const desiredVelocity =
      Math.sign(deltaDegrees) *
      Math.min(closingSpeed, brakingSpeed, MAX_STEERING_VELOCITY);
    const maxChange = MAX_STEERING_ACCELERATION * deltaTimeMultiplier;
    const change = Math.max(
      -maxChange,
      Math.min(maxChange, desiredVelocity - rotationVelocity)
    );

    if (change > BOOSTER_THRESHOLD * deltaTimeMultiplier) {
      _boostingRightUntil = _time + BOOSTER_HOLD_MS;
    } else if (change < -BOOSTER_THRESHOLD * deltaTimeMultiplier) {
      _boostingLeftUntil = _time + BOOSTER_HOLD_MS;
    }
    _setBoosters(_time < _boostingLeftUntil, _time < _boostingRightUntil);

    return rotationVelocity + change;
  };

  const reset = () => {
    _targetAngle = null;
    _boostingLeftUntil = 0;
    _boostingRightUntil = 0;
    _setBoosters(false, false);
  };

  return {
    update,
    reset,
    setTargetAngle: (angle) => (_targetAngle = angle),
    clearTargetAngle: () => (_targetAngle = null),
    isBoostingLeft: () => _boostingLeft,
    isBoostingRight: () => _boostingRight,
  };
};
