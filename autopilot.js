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
  // https://stackoverflow.com/q/4467539
  return ((((angleInTurns + 0.5) % 1) + 1) % 1) - 0.5;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const autopilot = {
  get on() {
    return Boolean(autopilot.mode);
  },

  set on(setting) {
    if (setting === autopilot.on) {
      return;
    } else if (setting) {
      autopilot.mode = "v2";
    } else {
      autopilot.mode = "";
    }
  },

  get mode() {
    let radio = document.querySelector(
      `#autopilot-details input[name="autopilot-mode"]:checked`
    );
    return (radio instanceof HTMLInputElement && radio.value) || "";
  },

  set mode(value) {
    let quotedValue = JSON.stringify(value);
    let radio = document.querySelector(
      `#autopilot-details input[name="autopilot-mode"][value=${quotedValue}]`
    );
    if (radio instanceof HTMLInputElement) {
      radio.checked = true;
    }

    let checkbox = document.querySelector("#autopilot");
    if (checkbox instanceof HTMLInputElement) {
      checkbox.checked = Boolean(value);
    }

    if (value) {
      autopilot.step();
    }
  },

  step() {
    const lander = global.lander;

    if (landerStats.gameEndData || !autopilot.on) {
      autopilot.turnOff();
      return;
    }

    {
      let angleInTurns = turnModulo(landerStats.angle / Turn);
      let projectedAngleInTurns = turnModulo(landerStats.projectedAngle / Turn);

      let targetAngleInTurns = clamp(projectedAngleInTurns, -0.125, 0.125);

      let angleDiff = turnModulo(angleInTurns - targetAngleInTurns);

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
      let targetVelocity;
      if (autopilot.mode === "v2") {
        targetVelocity = (altitude / 160) ** 0.5;
      } else {
        targetVelocity = clamp(
          (150 / landerStats.landerHeight) ** 1.2 * 0.02 * (altitude / 3.5) +
            0.03,
          0,
          altitude > 10 ? altitude / 160 : Infinity
        );
      }

      let xVelocity = landerStats.velocity.x;
      let engineFacingOppositeOfXVelocity = false;
      if (autopilot.mode === "v2") {
        engineFacingOppositeOfXVelocity =
          Math.abs(xVelocity) > 0.005 && xVelocity > 0 !== angleInTurns > 0;
      }

      let deathSpiralRecovery = false;
      if (autopilot.mode === "v2") {
        if (Math.abs(landerStats.rotationVelocity) > 1) {
          engineFacingOppositeOfXVelocity = false;
          deathSpiralRecovery = Math.abs(angleInTurns) < 0.25;
        }
      }

      if (
        deathSpiralRecovery ||
        engineFacingOppositeOfXVelocity ||
        (velocity > targetVelocity && Math.abs(angleInTurns) < 0.25)
      ) {
        lander.engineOn();
      } else {
        lander.engineOff();
      }

      console.info(
        "[autopilot]",

        "altitude:",
        altitude.toExponential(3).padStart(5, " "),

        "|",

        "angular velocity:",
        landerStats.rotationVelocity.toFixed(2).padStart(5, " "),
        "->",
        targetAngularVelocity.toFixed(2).padStart(5, " "),

        "|",

        ...(deathSpiralRecovery
          ? ["death spiral recovery"]
          : engineFacingOppositeOfXVelocity
          ? ["reducing x velocity:", xVelocity.toFixed(2).padStart(5, " ")]
          : [
              "y velocity:",
              velocity.toFixed(2).padStart(5, " "),
              "->",
              targetVelocity.toFixed(2).padStart(5, " "),
            ])
      );
    }

    window.requestAnimationFrame(autopilot.step);
  },
  turnOff() {
    const lander = global.lander;
    if (!lander) return;

    lander.engineOff();
    lander.stopLeftRotation();
    lander.stopRightRotation();
  },
};
global.autopilot = autopilot;

{
  /** @type {NodeListOf<HTMLInputElement>} */
  const checkboxes = document.querySelectorAll(`#autopilot`);
  for (const checkbox of checkboxes) {
    checkbox.addEventListener("click", () => {
      checkbox.blur();
      autopilot.on = checkbox.checked;

      let links = document.querySelector("#autopilot-links");
      if (links instanceof HTMLElement) {
        links.className = "hidden";
      }

      let hint = document.querySelector("#autopilot-hint");
      if (hint instanceof HTMLElement) {
        hint.className = "hidden";
      }
    });
  }
}

{
  /** @type {NodeListOf<HTMLInputElement>} */
  const radios = document.querySelectorAll(
    `#autopilot-details input[name="autopilot-mode"]`
  );
  for (const radio of radios) {
    radio.addEventListener("click", () => {
      radio.blur();
      autopilot.mode = radio.value;
    });
  }
}
