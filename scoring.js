import { VELOCITY_MULTIPLIER } from "./constants.js";
import { CRASH_VELOCITY, CRASH_ANGLE } from "./constants.js";

export const landingScoreDescription = (score) =>
  score >= 100
    ? "Perfect landing, incredible, you can't get better than this"
    : score >= 97
    ? "Super smooth, soft landing - almost perfect"
    : score >= 95
    ? "Very nice landing"
    : score >= 93
    ? "Pretty good landing, could be better"
    : score >= 90
    ? "A good landing, keep trying"
    : score >= 85
    ? "You were so close to a great landing"
    : score >= 80
    ? "A solid “B” landing, as-in “be better”"
    : score >= 75
    ? "You landed but it wasn’t pretty"
    : score >= 70
    ? "Not the worst landing, but not very good either"
    : score >= 60
    ? "How did you make it through astronaut school?"
    : score >= 50
    ? "Pretty bad landing, but it could be worse"
    : score >= 40
    ? "Basically a fender bender, but you landed"
    : score >= 30
    ? "Barely a landing"
    : "That was a terrible landing, try harder";

export const crashScoreDescription = (score) =>
  score >= 100
    ? "Ludicrous crash - the debris has entered orbit"
    : score >= 97
    ? "Incredible crash, the lander has vaporized"
    : score >= 95
    ? "Impressive speed, impressive angle - you crashed with style"
    : score >= 93
    ? "A fast crash, but it could be faster"
    : score >= 90
    ? "You obviously meant to crash, so crash *harder* next time"
    : score >= 85
    ? "Why don’t you apply these crashing skills to landing instead?"
    : score >= 80
    ? "You definitely did not land…"
    : score >= 75
    ? "I think there’s a problem with the lander"
    : score >= 70
    ? "Sick crash"
    : score >= 60
    ? "Were you trying to land, or…"
    : score >= 50
    ? "A bad crash, but it could be worse - why don’t you try for worse"
    : score >= 40
    ? "It isn’t pretty"
    : score >= 30
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
  const score = Math.round(
    ((combinedStats - worstPossibleCombo) /
      (bestPossibleCombo - worstPossibleCombo)) *
      100 +
      rotations
  );
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
  const score = Math.round(
    ((combinedStats - worstPossibleCombo) /
      (bestPossibleCombo - worstPossibleCombo)) *
      100 +
      rotations
  );
  return score;
};
