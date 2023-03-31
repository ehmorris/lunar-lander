export const makeChallengeManager = () => {
  const getChallengeNumber = () => {
    const challengeStartDate = 1678338000000;
    return Math.floor((Date.now() - challengeStartDate) / (1000 * 3600 * 24));
  };

  const populateCornerInfo = () => {
    document.querySelector("#cornerChallengeNumber").textContent =
      getChallengeNumber();
    document.querySelector("#cornerChallenge").classList.add("show");
  };

  return {
    populateCornerInfo,
    getChallengeNumber,
  };
};
