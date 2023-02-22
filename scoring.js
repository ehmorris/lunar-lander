import { VELOCITY_MULTIPLIER } from "./constants.js";
import { CRASH_VELOCITY, CRASH_ANGLE } from "./constants.js";

export const landingScoreDescription = (score) =>
  score >= 99
    ? "Perfect landing, incredible, you can't get better than this"
    : score >= 95
    ? "Super smooth, soft landing - almost perfect"
    : score >= 90
    ? "Very nice landing, amazing"
    : score >= 85
    ? "Pretty good landing, could be better"
    : score >= 80
    ? "A good landing, keep trying"
    : score >= 75
    ? "Just shy of a good landing"
    : score >= 70
    ? "A solid “C” landing"
    : score >= 65
    ? "You landed but it wasn’t pretty"
    : score >= 60
    ? "Not the worst landing, but not very good either"
    : score >= 55
    ? "Pretty bad landing, but it could be worse"
    : score >= 55
    ? "How did you make it through astronaut school?"
    : score >= 40
    ? "Basically a fender bender, but you landed"
    : score >= 30
    ? "Barely a landing"
    : "That was a terrible landing, try harder";

export const crashScoreDescription = (score) =>
  score >= 100
    ? "Ludicrous crash - the debris has entered orbit"
    : score >= 95
    ? "Incredible crash, the lander has vaporized"
    : score >= 90
    ? "Impressive speed, impressive angle - you crashed with style"
    : score >= 85
    ? "A fast crash, but it could be faster"
    : score >= 80
    ? "You obviously meant to crash, so crash *harder* next time"
    : score >= 75
    ? "Why don’t you apply these crashing skills to landing instead?"
    : score >= 70
    ? "You definitely did not land…"
    : score >= 65
    ? "I think there’s a problem with the lander"
    : score >= 60
    ? "Sick crash!"
    : score >= 50
    ? "Were you trying to land, or…"
    : score >= 40
    ? "A bad crash, but it could be worse - why don’t you try for worse"
    : score >= 30
    ? "I don’t think we’re getting back to Earth"
    : score >= 20
    ? "A smooth… wait… you crashed"
    : "So, so close to a landing - but still a crash";

// Perfect land:
// angle: 0
// speed: 1
// rotations: bonus, higher better
//
// Worst possible landing:
// angle: 11
// speed: 12
// rotations: bonus, higher better
export const scoreLanding = (angle, speed, rotations) => {
  const bestPossibleCombo = 1;
  const worstPossibleCombo = CRASH_ANGLE + CRASH_VELOCITY * VELOCITY_MULTIPLIER;
  const combinedStats = angle + speed;
  const score =
    ((combinedStats - worstPossibleCombo) /
      (bestPossibleCombo - worstPossibleCombo)) *
      100 +
    rotations;
  return score;
};

// Least bad possible crash:
// angle: 0
// speed: 9
// rotations: bonus, higher better
//
// Also least bad possible crash:
// angle: 11
// speed: 1
// rotations: bonus, higher better
//
// Expected best possible crash
// speed: 1000
// angle: 180
// rotations: bonus, higher better
export const scoreCrash = (angle, speed, rotations) => {
  const worstPossibleCombo = Math.min(CRASH_VELOCITY, CRASH_ANGLE);
  const bestPossibleCombo = 900;
  const combinedStats = angle + speed;
  const score =
    ((combinedStats - worstPossibleCombo) /
      (bestPossibleCombo - worstPossibleCombo)) *
      100 +
    rotations;
  return score;
};
