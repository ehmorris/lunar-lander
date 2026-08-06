export const GRAVITY = 0.0035;
export const LANDER_WIDTH = 20;
export const LANDER_HEIGHT = 40;
export const TRANSITION_TO_SPACE = LANDER_HEIGHT * 4;
export const CRASH_VELOCITY = 0.6;
export const VELOCITY_MULTIPLIER = 20;
export const CRASH_ANGLE = 11;
export const INTERVAL = Math.floor(1000 / 120);

// How much longer the player could have coasted before the engine had to come
// on, and still be credited with a hoverslam. 0 would mean the burn started at
// the exact last survivable instant.
export const HOVERSLAM_SLACK_MS = 500;

// A hoverslam means holding the engine all the way into the ground, but judging
// that to the frame would deny the badge to a finger that came up 8ms early —
// and the player would have no way to tell why. This is below the threshold of
// what anyone would perceive as letting go early.
export const HOVERSLAM_RELEASE_GRACE_MS = 100;
