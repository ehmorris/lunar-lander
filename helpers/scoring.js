import {
  CRASH_VELOCITY,
  CRASH_ANGLE,
  VELOCITY_MULTIPLIER,
} from "./constants.js";
import { progress } from "./helpers.js";

export const landingScoreDescription = (score) =>
  score >= 120
    ? "So. Much. Bonus. And you landed?? Incredible"
    : score >= 99
    ? "Perfect landing, incredible, you can’t get better than this"
    : score >= 95
    ? "Near-perfect landing, super smooth"
    : score >= 90
    ? "Very nice landing, amazing"
    : score >= 85
    ? "Pretty good landing, keep going!"
    : score >= 80
    ? "A good landing, keep trying"
    : score >= 75
    ? "Just shy of a good landing"
    : score >= 70
    ? "A solid “C” landing"
    : score >= 65
    ? "You landed but it could have been slower and straighter"
    : score >= 60
    ? "Not the worst landing, but not very good either"
    : score >= 55
    ? "Pretty bad landing, but it could be worse"
    : score >= 55
    ? "Not great"
    : score >= 40
    ? "Basically a fender bender, but you landed"
    : score >= 30
    ? "A near-crash, way too fast"
    : "Terrible landing, you need to land slow and straight";

export const crashScoreDescription = (score) =>
  score >= 120
    ? "So much bonus. So much crash."
    : score >= 100
    ? "Unbelievable, the crater is visible from Earth"
    : score >= 95
    ? "Ludicrous crash! The debris has entered orbit"
    : score >= 90
    ? "Incredible crash, the lander has vaporized"
    : score >= 85
    ? "Impressive speed, impressive angle - you crashed with style"
    : score >= 80
    ? "A fast crash, but it could be faster"
    : score >= 75
    ? "I think you meant to do that"
    : score >= 70
    ? "You definitely did not land…"
    : score >= 65
    ? "I think there’s a problem with the lander"
    : score >= 60
    ? "Sick crash!"
    : score >= 50
    ? "Were you trying to land, or…"
    : score >= 40
    ? "A bad crash, but it could be worse"
    : score >= 30
    ? "I don’t think we’re getting back to Earth"
    : score >= 20
    ? "A smooth… wait… you crashed"
    : score >= 10
    ? "The lander has been… damaged"
    : score < 0
    ? "You have to land on the white landing zones"
    : "So, so close to a landing, but still a crash";

export const destroyedDescription = () => {
  const remarks = [
    "That rock came out of nowhere!",
    "It looks like you’re out of fuel… oh and you blew up",
    "So that was an asteroid",
    "Weird, I can’t find the lander…",
    "Try to avoid the space rocks next time",
    "Slamming into rocks is not great for the lander",
    "Sometimes asteroids just happen",
    "Better to have flown and been destroyed by an asteroid than never to have flown at all",
  ];
  return remarks[Math.floor(Math.random() * remarks.length)];
};

// Perfect land:
// angle: 0
// speed: 1
//
// Worst possible landing:
// angle: 11
// speed: 12
export const scoreLanding = (angle, speed) => {
  const bestPossibleCombo = 1;
  const worstPossibleCombo = CRASH_ANGLE + CRASH_VELOCITY * VELOCITY_MULTIPLIER;
  return (
    progress(
      worstPossibleCombo,
      bestPossibleCombo,
      angle + speed * VELOCITY_MULTIPLIER
    ) * 100
  );
};

export const scoreCrash = (angle, speed) => {
  const bestPossibleCombo = 900;
  const worstPossibleCombo = Math.min(
    CRASH_VELOCITY * VELOCITY_MULTIPLIER,
    CRASH_ANGLE
  );
  return (
    progress(
      worstPossibleCombo,
      bestPossibleCombo,
      angle + speed * VELOCITY_MULTIPLIER
    ) * 100
  );
};
