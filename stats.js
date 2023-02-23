export const showStatsAndResetControl = (
  lander,
  animationObject,
  data,
  hasKeyboard
) => {
  const canShowShareSheet = navigator.canShare;
  const showStats = () => {
    document.querySelector("#endGameStats").classList.add("show");

    // Delay showing the reset button in case the user is actively tapping
    // in that area for thrust
    setTimeout(() => {
      document
        .querySelector("#endGameStats .buttonContainer")
        .classList.add("show");
    }, 1000);
  };

  const hideStats = () => {
    document
      .querySelector("#endGameStats .buttonContainer")
      .classList.remove("show");
    document.querySelector("#endGameStats").classList.remove("show");
  };

  const populateStats = (data) => {
    document.querySelector("#description").textContent = data.description;
    document.querySelector("#speed").textContent = data.speed;
    document.querySelector("#angle").textContent = data.angle;
    document.querySelector("#duration").textContent = data.durationInSeconds;
    document.querySelector("#rotations").textContent = data.rotations;
    document.querySelector("#maxSpeed").textContent = data.maxSpeed;
    document.querySelector("#maxHeight").textContent = data.maxHeight;

    if (hasKeyboard) {
      document.querySelector("#reset").textContent = "Reset (Spacebar)";
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
    document.querySelector("#reset").addEventListener("click", resetGame);

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
      }, 1000);
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
    hideStats();
    detachEventListeners();
  }

  populateStats(data);
  showStats();
  attachEventListeners();
};
