import {
  CRASH_ANGLE,
  CRASH_VELOCITY,
  VELOCITY_MULTIPLIER,
} from "./constants.js";

export const manageInstructions = (onCloseInstructions) => {
  let _engineDone = false;
  let _leftRotationDone = false;
  let _rightRotationDone = false;
  let _engineAndRotationDone = false;

  // Save this to a variable so that when we access it in a loop, we're
  // not calling localStorage.getItem 60 times per second
  let _hasClosedInstructionsVar = localStorage.getItem("closedInstructions");

  // Using an approximation. controls.getHasKeyboard() can't be used here
  // because the user is unlikely to have used the keyboard when the page has
  // just loaded and is showing instructions
  const likelyTouchDevice = window.matchMedia("(any-pointer: coarse)").matches;

  const show = () => {
    document.querySelector("#instructions").classList.add("show");
    document.querySelector("#crashSpeed").textContent = `${
      CRASH_VELOCITY * VELOCITY_MULTIPLIER
    } MPH`;
    document.querySelector("#crashAngle").textContent = `${CRASH_ANGLE}°`;
    if (likelyTouchDevice) {
      document.querySelector("#forKeyboard").remove();
    } else {
      document.querySelector("#forTouch").remove();
    }
  };

  function close() {
    document.querySelector("#instructions").classList.remove("show");
    localStorage.setItem("closedInstructions", true);
    _hasClosedInstructionsVar = true;
    onCloseInstructions();
  }

  const checkDone = () => {
    if (
      _engineDone &&
      _leftRotationDone &&
      _rightRotationDone &&
      _engineAndRotationDone &&
      !_hasClosedInstructionsVar
    ) {
      document.addEventListener(
        "touchend",
        () => {
          setTimeout(close, 1000);
        },
        { once: true }
      );
      document.addEventListener(
        "keyup",
        () => {
          setTimeout(close, 1000);
        },
        { once: true }
      );
    }
  };

  const setEngineDone = () => {
    _engineDone = true;
    document.querySelector("#engineCheck").classList.add("strikethrough");
    checkDone();
  };

  const setLeftRotationDone = () => {
    _leftRotationDone = true;
    document
      .querySelector("#rightRotationCheck")
      .classList.add("strikethrough");
    checkDone();
  };

  const setRightRotationDone = () => {
    _rightRotationDone = true;
    document.querySelector("#leftRotationCheck").classList.add("strikethrough");
    checkDone();
  };

  const setEngineAndRotationDone = () => {
    _engineAndRotationDone = true;
    document
      .querySelector("#engineAndRotationCheck")
      .classList.add("strikethrough");
    checkDone();
  };

  return {
    show,
    hasClosedInstructions: () => _hasClosedInstructionsVar,
    setEngineDone,
    setLeftRotationDone,
    setRightRotationDone,
    setEngineAndRotationDone,
  };
};
