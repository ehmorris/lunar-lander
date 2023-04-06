export const showStatsAndResetControl = (
  state,
  lander,
  animationObject,
  data,
  hasKeyboard,
  onReset
) => {
  const buttonDelayTime = 1500;
  const canShowShareSheet = navigator.canShare;
  const showStats = () => {
    document.querySelector("#endGameStats").classList.add("show");
    document.querySelector("#tryAgain").classList.add("loading");
  };
  const canCopyText = navigator && navigator.clipboard;

  const shareText = `Challenge #${state
    .get("challengeManager")
    .getChallengeNumber()}
${data.scoreForDisplay} point ${data.landed ? "landing" : "crash"}

${data.scoreDescription}
https://ehmorris.com/lander/

${data.speed}mph | ${data.angle}° | ${data.rotationsFormatted} flip${
    data.rotationsInt === 1 ? "" : "s"
  } | ${data.durationInSeconds}s`;

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
    document.querySelector("#description").textContent = data.scoreDescription;
    document.querySelector("#score").textContent = data.scoreForDisplay;
    document.querySelector("#type").textContent = data.landed
      ? "landing"
      : "crash";
    populateMeter("speed", data.speedPercent, data.speed);
    populateMeter("angle", data.anglePercent, data.angle);

    document.querySelector("#duration").textContent = data.durationInSeconds;
    document.querySelector("#rotations").textContent = data.rotationsFormatted;
    document.querySelector("#maxSpeed").textContent = data.maxSpeed;
    document.querySelector("#maxHeight").textContent = data.maxHeight;
    document.querySelector("#maxHeight").textContent = data.maxHeight;

    if (hasKeyboard) {
      document.querySelector("#tryAgainText").textContent =
        "Play Again (Space)";
    }

    if (canShowShareSheet) {
      if (document.querySelector("#copyText")) {
        document.querySelector("#copyText").remove();
      }
    } else if (document.querySelector("#share")) {
      document.querySelector("#share").remove();
    }

    if (!canCopyText && document.querySelector("#copyText")) {
      document.querySelector("#copyText").remove();
    }
  };

  function showShareSheet() {
    try {
      navigator.share({ text: shareText });
    } catch {}
  }

  function copyShareStats() {
    try {
      navigator.clipboard.writeText(shareText);
    } catch {}
  }

  function tryAgainOnSpace({ code }) {
    if (code === "Space") tryAgain();
  }

  const attachEventListeners = () => {
    // Delay showing the reset button in case the user is actively tapping
    // in that area for thrust
    setTimeout(() => {
      document.querySelector("#tryAgain").classList.remove("loading");
      document.querySelector("#tryAgain").addEventListener("click", tryAgain);
    }, buttonDelayTime);

    if (canShowShareSheet) {
      document
        .querySelector("#share")
        .addEventListener("click", showShareSheet);
    } else if (canCopyText) {
      document
        .querySelector("#copyText")
        .addEventListener("click", copyShareStats);
    }

    if (hasKeyboard) {
      // Delay showing the reset button in case the user is actively tapping
      // in that area for thrust
      setTimeout(() => {
        document.addEventListener("keydown", tryAgainOnSpace);
      }, buttonDelayTime);
    }
  };

  const detachEventListeners = () => {
    document.querySelector("#tryAgain").removeEventListener("click", tryAgain);

    if (canShowShareSheet) {
      document
        .querySelector("#share")
        .removeEventListener("click", showShareSheet);
    }

    if (hasKeyboard) {
      document.removeEventListener("keydown", tryAgainOnSpace);
    }
  };

  function tryAgain() {
    lander.resetProps();
    animationObject.resetStartTime();
    resetMeter("speed");
    resetMeter("angle");
    hideStats();
    detachEventListeners();
    onReset();
  }

  populateStats(data);
  showStats();
  attachEventListeners();
};
