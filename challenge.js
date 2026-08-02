import { getUTCDayIndex } from "./helpers/seededrandom.js";

// Derived from the same UTC day index as the seed, so the number shown in
// the corner and the world being played can never disagree.
const CHALLENGE_EPOCH_DAY = Math.floor(1678338000000 / (1000 * 60 * 60 * 24));

export const makeChallengeManager = () => {
  const getChallengeNumber = () => getUTCDayIndex() - CHALLENGE_EPOCH_DAY;

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
