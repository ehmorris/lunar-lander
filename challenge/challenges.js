const startDate = 1678338000000;

const challenges = [
  {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotationVelocity: 0.1,
    angle: Math.PI * 2,
  },
  {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotationVelocity: 0.1,
    angle: Math.PI * 2,
  },
];

export const getDayChallenge = (timestamp) => {
  const daysFromStart = Math.floor(
    (timestamp - startDate) / (1000 * 3600 * 24)
  );
  return challenges[daysFromStart];
};
