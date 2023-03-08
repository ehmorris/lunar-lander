export const makeTallyManger = () => {
  let _landingTotal = 0;
  let _crashTotal = 0;

  const getLandingTotalStorage = () => {
    try {
      return localStorage.getItem("landingTotal")
        ? localStorage.getItem("landingTotal")
        : 0;
    } catch {
      return _landingTotal;
    }
  };

  const getCrashTotalStorage = () => {
    try {
      return localStorage.getItem("crashTotal")
        ? localStorage.getItem("crashTotal")
        : 0;
    } catch {
      return _crashTotal;
    }
  };

  _landingTotal = parseInt(getLandingTotalStorage());
  _crashTotal = parseInt(getCrashTotalStorage());

  const storeLanding = () => {
    _landingTotal++;
    try {
      localStorage.setItem("landingTotal", _landingTotal);
    } catch {}
  };

  const storeCrash = () => {
    _crashTotal++;
    try {
      localStorage.setItem("crashTotal", _crashTotal);
    } catch {}
  };

  const updateDisplay = () => {
    document.querySelector("#landingTotal").textContent =
      getLandingTotalStorage();
    document.querySelector("#crashTotal").textContent = getCrashTotalStorage();
  };
  updateDisplay();

  return { storeLanding, storeCrash, updateDisplay };
};
