export const makeTallyManger = () => {
  const storeLanding = () => {
    const landings = localStorage.getItem("landingTotal");
    localStorage.setItem("landingTotal", landings ? parseInt(landings) + 1 : 1);
  };

  const storeCrash = () => {
    const crashes = localStorage.getItem("crashTotal");
    localStorage.setItem("crashTotal", crashes ? parseInt(crashes) + 1 : 1);
  };

  const _landingTotal = () => {
    const landings = localStorage.getItem("landingTotal");
    return landings ? localStorage.getItem("landingTotal") : 0;
  };

  const _crashTotal = () => {
    const crashes = localStorage.getItem("crashTotal");
    return crashes ? localStorage.getItem("crashTotal") : 0;
  };

  const updateDisplay = () => {
    document.querySelector("#landingTotal").textContent = _landingTotal();
    document.querySelector("#crashTotal").textContent = _crashTotal();
  };
  updateDisplay();

  return { storeLanding, storeCrash, updateDisplay };
};
