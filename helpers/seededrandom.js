// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
const sfc32 = (a, b, c, d) => {
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
};

export const makeSeededRandom = () => {
  const today = new Date(Date.now());
  const seed = `${today.getDay()} ${today.getMonth()} ${today.getYear()}`;
  let seededRandom;

  const setDailyChallengeSeed = () => {
    seededRandom = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);
  };

  const setRandomSeed = () => {
    seededRandom = sfc32(
      0x9e3779b9,
      0x243f6a88,
      0xb7e15162,
      `${Math.random()} seed ${Math.random()}`
    );
  };

  setDailyChallengeSeed();

  return {
    getSeededRandom: () => seededRandom(),
    setDailyChallengeSeed,
    setRandomSeed,
  };
};
