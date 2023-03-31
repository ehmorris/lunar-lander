// https://stackoverflow.com/a/29450606
const createRandomNumberGenerator = (seed) => {
  let mask = 0xffffffff;
  let m_w = (123456789 + seed) & mask;
  let m_z = (987654321 - seed) & mask;

  return () => {
    m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;

    let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  };
};

export const makeSeededRandom = () => {
  const today = new Date(Date.now());
  const seed = parseInt(
    `${today.getDay()}${today.getMonth()}${today.getYear()}`
  );
  let seededRandom;

  const setDailyChallengeSeed = () => {
    seededRandom = createRandomNumberGenerator(seed);
  };

  setDailyChallengeSeed();

  return {
    getSeededRandom: () => seededRandom(),
    setDailyChallengeSeed,
  };
};
