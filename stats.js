export const showStatsAndResetControl = (
  lander,
  animationObject,
  data,
  hasKeyboard
) => {
  const canShowShareSheet = navigator.canShare;
  const showStats = () => {
    document.querySelector(".stats").classList.add("show");

    // Delay showing the reset button in case the user is actively tapping
    // in that area for thrust
    setTimeout(() => {
      document.querySelector(".buttons").classList.add("show");
    }, 1000);
  };

  const hideStats = () => {
    document.querySelector(".buttons").classList.remove("show");
    document.querySelector(".stats").classList.remove("show");
  };

  const populateStats = (data) => {
    document.querySelector(".stats .description").textContent =
      data.description;
    document.querySelector(".stats .speed").textContent = data.speed;
    document.querySelector(".stats .angle").textContent = data.angle;
    document.querySelector(".stats .duration").textContent =
      data.durationInSeconds;
    document.querySelector(".stats .rotations").textContent = data.rotations;

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
Time: ${data.durationInSeconds}s
Rotations: ${data.rotations}
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
      document.addEventListener("keydown", resetOnSpace);
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
