import {
  CRASH_VELOCITY,
  CRASH_ANGLE,
  VELOCITY_MULTIPLIER,
} from "./constants.js";
import { progress } from "./helpers.js";

export const landingScoreDescription = (score) => {
  const description =
    score >= 99
      ? "perfect landing, incredible, you can’t get better than this"
      : score >= 95
      ? "near-perfect landing, super smooth"
      : score >= 90
      ? "very nice landing, amazing"
      : score >= 85
      ? "pretty good landing, keep going!"
      : score >= 80
      ? "a good landing, keep trying"
      : score >= 75
      ? "just shy of a good landing"
      : score >= 70
      ? "a solid “C” landing"
      : score >= 65
      ? "you landed but it could have been slower and straighter"
      : score >= 60
      ? "not the worst landing, but not very good either"
      : score >= 55
      ? "pretty bad landing, but it could be worse"
      : score >= 55
      ? "not great"
      : score >= 40
      ? "basically a fender bender, but you landed"
      : score >= 30
      ? "a near-crash, way too fast"
      : "terrible landing, you need to land slow and straight";

  return `${score.toFixed(1)}: ${description}`;
};

export const crashScoreDescription = (score) => {
  const description =
    score >= 100
      ? "unbelievable, the crater is visible from Earth"
      : score >= 95
      ? "ludicrous crash! The debris has entered orbit"
      : score >= 90
      ? "incredible crash, the lander has vaporized"
      : score >= 85
      ? "impressive speed, impressive angle - you crashed with style"
      : score >= 80
      ? "a fast crash, but it could be faster"
      : score >= 75
      ? "I think you meant to do that"
      : score >= 70
      ? "you definitely did not land…"
      : score >= 65
      ? "I think there’s a problem with the lander"
      : score >= 60
      ? "sick crash!"
      : score >= 50
      ? "were you trying to land, or…"
      : score >= 40
      ? "a bad crash, but it could be worse"
      : score >= 30
      ? "I don’t think we’re getting back to Earth"
      : score >= 20
      ? "a smooth… wait… you crashed"
      : score >= 10
      ? "the lander has been… damaged"
      : "so, so close to a landing, but still a crash";

  return `-${score.toFixed(1)}: ${description}`;
};

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
    progress(worstPossibleCombo, bestPossibleCombo, combinedStats) * 100;
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
    progress(worstPossibleCombo, bestPossibleCombo, combinedStats) * 100;

  return score;
};
