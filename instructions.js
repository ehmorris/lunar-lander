export const manageInstructions = (onCloseInstructions) => {
  let _engineDone = false;
  let _leftRotationDone = false;
  let _rightRotationDone = false;
  let _engineAndRotationDone = false;

  let _hasClosedInstructionsVar = (() => {
    try {
      return localStorage.getItem("closedInstructions");
    } catch {
      return false;
    }
  })();

  // Using an approximation. controls.getHasKeyboard() can't be used here
  // because the user is unlikely to have used the keyboard when the page has
  // just loaded and is showing instructions
  const likelyTouchDevice = window.matchMedia("(any-pointer: coarse)").matches;

  const show = () => {
    document.querySelector("#instructions").classList.add("show");

    if (likelyTouchDevice) {
      document.querySelector("#forKeyboard").remove();
    } else {
      document.querySelector("#forTouch").remove();
    }
  };

  function close() {
    // May be called twice in checkDone() on devices with both touch support
    // and a keyboard
    if (!_hasClosedInstructionsVar) {
      document.querySelector("#instructions").classList.remove("show");
      try {
        localStorage.setItem("closedInstructions", true);
      } catch {}
      _hasClosedInstructionsVar = true;
      onCloseInstructions();
    }
  }

  const checkDone = () => {
    if (
      _engineDone &&
      _leftRotationDone &&
      _rightRotationDone &&
      _engineAndRotationDone
    ) {
      const closeTimeout = () => setTimeout(close, 1000);
      const options = { once: true };
      document.addEventListener("touchend", closeTimeout, options);
      document.addEventListener("keyup", closeTimeout, options);
    }
  };

  const setEngineDone = () => {
    _engineDone = true;
    document.querySelector("#engineCheck").classList.add("strikethrough");
    document.querySelector("#engineCheck input").checked = true;
    checkDone();
  };

  const setLeftRotationDone = () => {
    _leftRotationDone = true;
    document
      .querySelector("#rightRotationCheck")
      .classList.add("strikethrough");
    document.querySelector("#rightRotationCheck input").checked = true;

    checkDone();
  };

  const setRightRotationDone = () => {
    _rightRotationDone = true;
    document.querySelector("#leftRotationCheck").classList.add("strikethrough");
    document.querySelector("#leftRotationCheck input").checked = true;

    checkDone();
  };

  const setEngineAndRotationDone = () => {
    _engineAndRotationDone = true;
    document
      .querySelector("#engineAndRotationCheck")
      .classList.add("strikethrough");
    document.querySelector("#engineAndRotationCheck input").checked = true;
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
