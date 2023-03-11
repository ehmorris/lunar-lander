export const showStatsAndResetControl = (
  state,
  lander,
  animationObject,
  data,
  hasKeyboard
) => {
  const buttonDelayTime = 1500;
  const canShowShareSheet = navigator.canShare;
  const showStats = () => {
    document.querySelector("#endGameStats").classList.add("show");
    document.querySelector("#tryAgain").classList.add("loading");
    document.querySelector("#randomStart").classList.add("loading");
  };
  const canCopyText = navigator && navigator.clipboard;

  const shareTextChallengeInfo = `Lander Daily Challenge #${state
    .get("challengeManager")
    .getChallengeNumber()}
Score: ${data.score} point ${data.landed ? "landing" : "crash"}

${data.description}`;

  const shareTextRandomInfo = `${data.description}
Score: ${data.score} point ${data.landed ? "landing" : "crash"}`;

  const shareTextSecondaryInfo = `Speed: ${data.speed}mph
Angle: ${data.angle}°
Time: ${data.durationInSeconds} seconds
Flips: ${data.rotations}
Max speed: ${data.maxSpeed}mph
Max height: ${data.maxHeight}ft
Engine used: ${data.engineUsed} times
Boosters used: ${data.boostersUsed} times
Game size: ${state.get("canvasWidth")}x${state.get("canvasHeight")}
https://ehmorris.com/lander/`;

  const shareText = `${
    state.get("challengeManager").isChallengeOn()
      ? shareTextChallengeInfo
      : shareTextRandomInfo
  }

${shareTextSecondaryInfo}`;

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
    document.querySelector("#score").textContent = data.score;
    document.querySelector("#statsChallengeNumber").textContent = state
      .get("challengeManager")
      .getChallengeNumber();
    document.querySelector("#type").textContent = data.landed
      ? "landing"
      : "crash";
    populateMeter("speed", data.speedPercent, data.speed);
    populateMeter("angle", data.anglePercent, data.angle);
    document.querySelector("#duration").textContent = data.durationInSeconds;
    document.querySelector("#rotations").textContent = data.rotations;
    document.querySelector("#maxSpeed").textContent = data.maxSpeed;
    document.querySelector("#maxHeight").textContent = data.maxHeight;
    document.querySelector("#engineUsed").textContent = data.engineUsed;
    document.querySelector("#boostersUsed").textContent = data.boostersUsed;
    document.querySelector("#canvasWidth").textContent =
      state.get("canvasWidth");
    document.querySelector("#canvasHeight").textContent =
      state.get("canvasHeight");

    if (state.get("challengeManager").isChallengeOn()) {
      document.querySelector("#statsChallengeText").classList.add("show");
    } else {
      document.querySelector("#statsChallengeText").classList.remove("show");
    }

    if (hasKeyboard) {
      document.querySelector("#tryAgainText").textContent = "Challenge (Space)";
      document.querySelector("#randomStartText").textContent = "Randomize (R)";
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

  function randomizeOnR({ code }) {
    if (code === "KeyR") randomize();
  }

  const attachEventListeners = () => {
    // Delay showing the reset button in case the user is actively tapping
    // in that area for thrust
    setTimeout(() => {
      document.querySelector("#tryAgain").classList.remove("loading");
      document.querySelector("#tryAgain").addEventListener("click", tryAgain);
      document.querySelector("#randomStart").classList.remove("loading");
      document
        .querySelector("#randomStart")
        .addEventListener("click", randomize);
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
        document.addEventListener("keydown", randomizeOnR);
      }, buttonDelayTime);
    }
  };

  const detachEventListeners = () => {
    document.querySelector("#tryAgain").removeEventListener("click", tryAgain);
    document
      .querySelector("#randomStart")
      .removeEventListener("click", randomize);

    if (canShowShareSheet) {
      document
        .querySelector("#share")
        .removeEventListener("click", showShareSheet);
    }

    if (hasKeyboard) {
      document.removeEventListener("keydown", tryAgainOnSpace);
      document.removeEventListener("keydown", randomizeOnR);
    }
  };

  function tryAgain() {
    lander.resetProps({ challenge: true });
    state.get("challengeManager").challengeOn();
    animationObject.resetStartTime();
    resetMeter("speed");
    resetMeter("angle");
    hideStats();
    detachEventListeners();
  }

  function randomize() {
    lander.resetProps({ challenge: false });
    state.get("challengeManager").challengeOff();
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
