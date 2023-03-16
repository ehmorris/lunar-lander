const turnModulo = (angleInTurns) =>
  ((((angleInTurns + 0.5) % 1) + 1) % 1) - 0.5;

export const makeAutopilot = (lander) => {
  let running = false;

  const run = () => {
    const angleInTurns = turnModulo(lander.getAngle() / (Math.PI * 2));
    const targetAngularVelocity = -angleInTurns * 5;
    const angularVelocityDiff =
      lander.getRotationVelocity() - targetAngularVelocity;
    const targetVelocity = (lander.getPosition().y / 160) ** 0.5;

    let engineFacingOppositeOfXVelocity = false;
    let deathSpiralRecovery = false;

    if (angularVelocityDiff < -0.001) {
      lander.stopLeftRotation();
      lander.rotateRight();
    } else if (angularVelocityDiff > 0.001) {
      lander.stopRightRotation();
      lander.rotateLeft();
    } else {
      lander.stopLeftRotation();
      lander.stopRightRotation();
    }

    engineFacingOppositeOfXVelocity =
      Math.abs(lander.getVelocity().x) > 0.005 &&
      lander.getVelocity().x > 0 !== angleInTurns > 0;

    if (Math.abs(lander.getRotationVelocity()) > 1) {
      engineFacingOppositeOfXVelocity = false;
      deathSpiralRecovery = Math.abs(angleInTurns) < 0.25;
    }

    if (
      deathSpiralRecovery ||
      engineFacingOppositeOfXVelocity ||
      (lander.getVelocity().y > targetVelocity && Math.abs(angleInTurns) < 0.25)
    ) {
      lander.engineOn();
    } else {
      lander.engineOff();
    }

    if (running) {
      window.requestAnimationFrame(run);
    }
  };

  const on = () => {
    running = true;
    window.requestAnimationFrame(run);
    document.querySelector("#autopilotStatus").textContent = "ON";
  };

  const off = () => {
    running = false;

    lander.engineOff();
    lander.stopLeftRotation();
    lander.stopRightRotation();

    document.querySelector("#autopilotStatus").textContent = "OFF";
  };

  const toggleOnOff = () => (running ? off() : on());

  const toggleOnP = ({ key }) => {
    if (key === "p") toggleOnOff();
  };

  const attachEventListeners = () => {
    document.addEventListener("keydown", toggleOnP);
  };

  const detachEventListeners = () => {
    document.removeEventListener("keydown", toggleOnP);
  };

  return { attachEventListeners, detachEventListeners };
};
