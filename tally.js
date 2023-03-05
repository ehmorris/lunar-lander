export const makeTallyManger = () => {
  let _landingTotal = localStorage.getItem("landingTotal")
    ? parseInt(localStorage.getItem("landingTotal"))
    : 0;
  let _crashTotal = localStorage.getItem("crashTotal")
    ? parseInt(localStorage.getItem("crashTotal"))
    : 0;

  const storeLanding = () => {
    _landingTotal++;
    localStorage.setItem("landingTotal", _landingTotal);
  };

  const storeCrash = () => {
    _crashTotal++;
    localStorage.setItem("crashTotal", _crashTotal);
  };

  const _getLandingTotal = () =>
    localStorage.getItem("landingTotal")
      ? localStorage.getItem("landingTotal")
      : _landingTotal;

  const _getCrashTotal = () =>
    localStorage.getItem("crashTotal")
      ? localStorage.getItem("crashTotal")
      : _crashTotal;

  const updateDisplay = () => {
    document.querySelector("#landingTotal").textContent = _getLandingTotal();
    document.querySelector("#crashTotal").textContent = _getCrashTotal();
  };
  updateDisplay();

  return { storeLanding, storeCrash, updateDisplay };
};
