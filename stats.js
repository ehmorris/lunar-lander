import { onActivate } from "./helpers/helpers.js";

export const showStatsAndResetControl = (
  state,
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
  let hasReset = false;

  const shareText = `Challenge #${state
    .get("challengeManager")
    .getChallengeNumber()}
${data.scoreForDisplay} point ${data.landed ? "landing" : "crash"}

${data.scoreDescription}
https://ehmorris.com/lander/

${data.speed}mph | ${data.angle}° | ${data.rotationsFormatted} flip${
    data.rotationsInt === 1 ? "" : "s"
  } | ${data.duration} | ${data.engineActivations} burn${
    data.engineActivations === 1 ? "" : "s"
  }`;

  const hideStats = () => {
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

    document.querySelector("#duration").textContent = data.duration;
    document.querySelector("#rotations").textContent = data.rotationsFormatted;
    document.querySelector("#maxSpeed").textContent = data.maxSpeed;
    document.querySelector("#maxHeight").textContent = data.maxHeight;
    document.querySelector("#engineActivations").textContent =
      data.engineActivationsFormatted;

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
    Promise.resolve()
      .then(() => navigator.share({ text: shareText }))
      .catch(() => {});
  }

  function copyShareStats() {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(shareText))
      .then(() => {
        const button = document.querySelector("#copyText span");
        if (button) {
          button.textContent = "Copied";
          setTimeout(() => (button.textContent = "Copy Stats"), 2000);
        }
      })
      .catch(() => {});
  }

  function tryAgainOnSpace({ code }) {
    if (code === "Space") tryAgain();
  }

  // Collected so that every listener attached for this game-over screen is
  // guaranteed to come back off again, including the share/copy pair that
  // used to be left behind and stack up a duplicate every round.
  let detachers = [];

  const attachEventListeners = () => {
    // Delay showing the reset button in case the user is actively tapping
    // in that area for thrust
    setTimeout(() => {
      if (hasReset) return;
      document.querySelector("#tryAgain").classList.remove("loading");
      detachers.push(
        onActivate(document.querySelector("#tryAgain"), tryAgain)
      );
    }, buttonDelayTime);

    if (canShowShareSheet) {
      detachers.push(
        onActivate(document.querySelector("#share"), showShareSheet)
      );
    } else if (canCopyText) {
      detachers.push(
        onActivate(document.querySelector("#copyText"), copyShareStats)
      );
    }

    if (hasKeyboard) {
      // Delay showing the reset button in case the user is actively tapping
      // in that area for thrust
      setTimeout(() => {
        if (hasReset) return;
        document.addEventListener("keydown", tryAgainOnSpace);
        detachers.push(() =>
          document.removeEventListener("keydown", tryAgainOnSpace)
        );
      }, buttonDelayTime);
    }
  };

  const detachEventListeners = () => {
    detachers.forEach((detach) => detach());
    detachers = [];
  };

  function tryAgain() {
    // The global Space shortcut and the focused button can both fire for one
    // keypress, and resetting the round twice would advance past the daily
    // challenge state.
    if (hasReset) return;
    hasReset = true;

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
