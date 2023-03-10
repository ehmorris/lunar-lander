// @ts-check

const global = /** @type {any} */ (window);

const landerStats = {
  gameEndData: {},
  angle: 0,
  projectedAngle: 0,
  rotationVelocity: 0,
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  groundedHeight: 0,
  landerHeight: 0,
};
global.landerStats = landerStats;

const Turn = Math.PI * 2;

function turnModulo(angleInTurns) {
  return ((angleInTurns + 0.5) % 1) - 0.5;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const autopilot = {
  checkbox: /** @type {HTMLInputElement} */ (
    document.querySelector("#autopilot")
  ),
  step() {
    const lander = global.lander;

    if (landerStats.gameEndData || !autopilot.checkbox.checked) {
      autopilot.off();
      return;
    }

    {
      let angleInTurns = turnModulo(landerStats.angle / Turn);
      let projectedAngleInTurns = turnModulo(landerStats.projectedAngle / Turn);

      let angleDiff = turnModulo(angleInTurns - projectedAngleInTurns);

      let targetAngularVelocity = -angleDiff * 5;
      let angularVelocityDiff =
        landerStats.rotationVelocity - targetAngularVelocity;

      if (angularVelocityDiff < -0.001) {
        lander.rotateRight();
        lander.stopLeftRotation();
      } else if (angularVelocityDiff > 0.001) {
        lander.rotateLeft();
        lander.stopRightRotation();
      } else {
        lander.stopLeftRotation();
        lander.stopRightRotation();
      }

      let altitude = landerStats.groundedHeight - landerStats.position.y;

      let velocity = landerStats.velocity.y;
      let targetVelocity = clamp(
        (150 / landerStats.landerHeight) ** 1.2 * 0.02 * (altitude / 3.5) +
          0.03,
        0,
        altitude > 10 ? altitude / 160 : Infinity
      );

      if (velocity > targetVelocity && Math.abs(angleInTurns) < 0.45) {
        lander.engineOn();
      } else {
        lander.engineOff();
      }

      console.info(
        "[autopilot]",

        "altitude:",
        altitude.toFixed(1),

        "|",

        "y velocity:",
        velocity.toFixed(2).padStart(5, " "),
        "->",
        targetVelocity.toFixed(2).padStart(5, " "),

        "|",

        "angular velocity:",
        landerStats.rotationVelocity.toFixed(2).padStart(5, " "),
        "->",
        targetAngularVelocity.toFixed(2).padStart(5, " ")
      );
    }

    window.requestAnimationFrame(autopilot.step);
  },
  off() {
    const lander = global.lander;
    if (!lander) return;

    lander.engineOff();
    lander.stopLeftRotation();
    lander.stopRightRotation();
  },
};
global.autopilot = autopilot;

autopilot.checkbox.addEventListener("click", () => {
  autopilot.checkbox.blur();
  autopilot.step();
});
