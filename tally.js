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

  // Storage can hold anything, and parseInt on junk yields NaN
  const toCount = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  _landingTotal = toCount(getLandingTotalStorage());
  _crashTotal = toCount(getCrashTotalStorage());

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

  // Read from memory rather than back out of storage, so the tally still
  // counts up when writes are failing (private mode, blocked cookies).
  const updateDisplay = () => {
    document.querySelector("#landingTotal").textContent = _landingTotal;
    document.querySelector("#crashTotal").textContent = _crashTotal;
  };
  updateDisplay();

  return { storeLanding, storeCrash, updateDisplay };
};
