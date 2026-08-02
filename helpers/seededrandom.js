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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Whole days since the Unix epoch. UTC by construction, so every player in
// the world gets the same challenge and it rolls over at 00:00 UTC.
export const getUTCDayIndex = () => Math.floor(Date.now() / MS_PER_DAY);

// The generator's output is linear in its seed, so consecutive day indices
// would hand out near-identical worlds that drift by a fixed step each day.
// Running the day index through a splitmix32 finalizer decorrelates them, and
// discarding the first several outputs clears the residual seed correlation.
const WARMUP_DRAWS = 16;

const hashSeed = (value) => {
  let x = (value ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97) >>> 0;
  return (x ^ (x >>> 15)) >>> 0;
};

// Each consumer draws from its own stream, so neither the order in which
// consumers run nor the number of draws any one of them makes can shift the
// sequence another consumer sees.
const STREAM_NAMES = ["terrain", "lander", "asteroids"];

export const makeSeededRandom = () => {
  const streams = new Map();

  const setDailyChallengeSeed = () => {
    // Re-read the day on every reset so a tab left open overnight picks up
    // the new challenge instead of replaying yesterday's.
    const dayIndex = getUTCDayIndex();

    STREAM_NAMES.forEach((name, index) => {
      const generator = createRandomNumberGenerator(
        hashSeed(dayIndex * STREAM_NAMES.length + index)
      );
      for (let i = 0; i < WARMUP_DRAWS; i++) generator();
      streams.set(name, generator);
    });
  };
  setDailyChallengeSeed();

  // The stream is looked up per call rather than captured, so a consumer that
  // holds on to its stream across a reseed transparently gets the new
  // sequence rather than continuing the old one.
  const getStream = (name) => {
    if (!STREAM_NAMES.includes(name)) {
      throw new Error(`Unknown seeded random stream "${name}"`);
    }

    return { getSeededRandom: () => streams.get(name)() };
  };

  return { getStream, setDailyChallengeSeed };
};
