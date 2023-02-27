export const showStatsAndResetControl = (
  lander,
  animationObject,
  data,
  hasKeyboard
) => {
  const resetButtonDelay = 1500;
  const canShowShareSheet = navigator.canShare;
  const showStats = () => {
    document.querySelector("#endGameStats").classList.add("show");
    document.querySelector("#reset").classList.add("loading");
  };

  const hideStats = () => {
    document
      .querySelector("#endGameStats .buttonContainer")
      .classList.remove("show");
    document.querySelector("#endGameStats").classList.remove("show");
  };

  const populateMeter = (name, percentPosition, textValue) => {
    const meter = document.querySelector(`[data-stat-name="${name}"]`);
    meter.querySelector("[data-value]").textContent = textValue;

    // This timeout enables a CSS transition to play from left: 0 to the
    // override we're applying
    setTimeout(() => {
      meter.querySelector(
        "[data-percent-position]"
      ).style.left = `${percentPosition}%`;
    }, 0);
  };

  const resetMeter = (name) => {
    const meter = document.querySelector(`[data-stat-name="${name}"]`);
    meter.querySelector("[data-value]").textContent = "";

    meter.querySelector("[data-percent-position]").style.left = `0`;
  };

  const populateStats = (data) => {
    document.querySelector("#description").textContent = data.description;
    populateMeter("speed", data.speedPercent, data.speed);
    populateMeter("angle", data.anglePercent, data.angle);
    document.querySelector("#duration").textContent = data.durationInSeconds;
    document.querySelector("#rotations").textContent = data.rotations;
    document.querySelector("#maxSpeed").textContent = data.maxSpeed;
    document.querySelector("#maxHeight").textContent = data.maxHeight;

    if (hasKeyboard) {
      document.querySelector("#resetText").textContent = "Reset (Spacebar)";
    }

    if (!canShowShareSheet && document.querySelector("#share")) {
      document.querySelector("#share").remove();
    }
  };

  function showShareSheet() {
    navigator.share({
      text: `Speed: ${data.speed} MPH
Angle: ${data.angle}°
Time: ${data.durationInSeconds} S
Flips: ${data.rotations}
Max speed: ${data.maxSpeed} MPH
Max height: ${data.maxHeight} FT
https://ehmorris.com/lander/`,
    });
  }

  function resetOnSpace({ code }) {
    if (code === "Space") resetGame();
  }

  const attachEventListeners = () => {
    // Delay showing the reset button in case the user is actively tapping
    // in that area for thrust
    setTimeout(() => {
      document.querySelector("#reset").classList.remove("loading");
      document.querySelector("#reset").addEventListener("click", resetGame);
    }, resetButtonDelay);

    if (canShowShareSheet) {
      document
        .querySelector("#share")
        .addEventListener("click", showShareSheet);
    }

    if (hasKeyboard) {
      // Delay showing the reset button in case the user is actively tapping
      // in that area for thrust
      setTimeout(() => {
        document.addEventListener("keydown", resetOnSpace);
      }, resetButtonDelay);
    }
  };

  const detachEventListeners = () => {
    document.querySelector("#reset").removeEventListener("click", resetGame);

    if (canShowShareSheet) {
      document
        .querySelector("#share")
        .removeEventListener("click", showShareSheet);
    }

    if (hasKeyboard) {
      document.removeEventListener("keydown", resetOnSpace);
    }
  };

  function resetGame() {
    lander.resetProps();
    animationObject.resetStartTime();
    resetMeter("speed");
    resetMeter("angle");
    hideStats();
    detachEventListeners();
  }

  populateStats(data);
  showStats();
  attachEventListeners();
};
