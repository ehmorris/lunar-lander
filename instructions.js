export const manageInstructions = (onCloseInstructions) => {
  // Save this to a variable so that when we access it in a loop, we're
  // not calling localStorage.getItem 60 times per second
  let _hasClosedInstructionsVar = localStorage.getItem("closedInstructions");

  // Using an approximation. controls.getHasKeyboard() can't be used here
  // because the user is unlikely to have used the keyboard when the page has
  // just loaded and is showing instructions
  const likelyTouchDevice = window.matchMedia("(any-pointer: coarse)").matches;

  const hasClosedInstructions = () => _hasClosedInstructionsVar;

  const show = () => {
    document.querySelector("#instructions").classList.add("show");
    document
      .querySelector("#instructions .buttonContainer")
      .classList.add("show");
    document
      .querySelector("#closeInstructions")
      .addEventListener("click", close);

    if (likelyTouchDevice) {
      document.querySelector("#forKeyboard").remove();
    } else {
      document.querySelector("#forTouch").remove();
    }
  };

  function close() {
    document.querySelector("#instructions").classList.remove("show");
    document
      .querySelector("#instructions .buttonContainer")
      .classList.remove("show");
    document
      .querySelector("#closeInstructions")
      .removeEventListener("click", close);

    localStorage.setItem("closedInstructions", true);
    _hasClosedInstructionsVar = true;
    onCloseInstructions();
  }

  return {
    show,
    hasClosedInstructions,
  };
};
