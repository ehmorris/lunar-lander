export const makeChallengeManager = () => {
  let isChallengeOn = true;

  const getChallengeNumber = () => {
    const challengeStartDate = 1678338000000;
    return Math.floor((Date.now() - challengeStartDate) / (1000 * 3600 * 24));
  };

  const populateCornerInfo = () => {
    if (isChallengeOn) {
      document.querySelector("#cornerChallengeNumber").textContent =
        getChallengeNumber();
      document.querySelector("#cornerRandom").classList.remove("show");
      document.querySelector("#cornerChallenge").classList.add("show");
    } else {
      document.querySelector("#cornerChallenge").classList.remove("show");
      document.querySelector("#cornerRandom").classList.add("show");
    }
  };

  const challengeOff = () => {
    isChallengeOn = false;
    populateCornerInfo();
  };

  const challengeOn = () => {
    isChallengeOn = true;
    populateCornerInfo();
  };

  return {
    isChallengeOn: () => isChallengeOn,
    populateCornerInfo,
    getChallengeNumber,
    challengeOff,
    challengeOn,
  };
};
