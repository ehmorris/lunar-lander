export const makeAudioManager = () => {
  const audioCTX = new AudioContext();
  const themeFileBuffer = _loadFile(audioCTX, "./audio/theme.mp3");
  const engineFileBuffer = _loadFile(audioCTX, "./audio/engine.mp3");
  const boosterFileBuffer = _loadFile(audioCTX, "./audio/booster.mp3");

  let engineFileBufferSource = false;
  let booster1FileBufferSource = false;
  let booster2FileBufferSource = false;

  async function _loadFile(context, filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  async function _playTrack(audioBuffer) {
    return Promise.all([audioBuffer, audioCTX.resume()]).then((e) => {
      const trackSource = new AudioBufferSourceNode(audioCTX, {
        buffer: e[0],
        loop: true,
      });
      trackSource.connect(audioCTX.destination);
      trackSource.start();

      return trackSource;
    });
  }

  function playEngineSound() {
    if (!engineFileBufferSource) {
      engineFileBufferSource = _playTrack(engineFileBuffer);
    }
  }

  function playBoosterSound1() {
    if (!booster1FileBufferSource) {
      booster1FileBufferSource = _playTrack(boosterFileBuffer);
    }
  }

  function playBoosterSound2() {
    if (!booster2FileBufferSource) {
      booster2FileBufferSource = _playTrack(boosterFileBuffer);
    }
  }

  function stopEngineSound() {
    if (engineFileBufferSource) {
      engineFileBufferSource.then((e) => {
        e.stop();
        engineFileBufferSource = false;
      });
    }
  }

  function stopBoosterSound1() {
    if (booster1FileBufferSource) {
      booster1FileBufferSource.then((e) => {
        e.stop();
        booster1FileBufferSource = false;
      });
    }
  }

  function stopBoosterSound2() {
    if (booster2FileBufferSource) {
      booster2FileBufferSource.then((e) => {
        e.stop();
        booster2FileBufferSource = false;
      });
    }
  }

  function playTheme() {
    _playTrack(themeFileBuffer);
  }

  return {
    playEngineSound,
    playBoosterSound1,
    playBoosterSound2,
    stopEngineSound,
    stopBoosterSound1,
    stopBoosterSound2,
    playTheme,
  };
};
