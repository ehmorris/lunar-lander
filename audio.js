export const makeAudioManager = () => {
  const audioCTX = new AudioContext();
  const themeFileBuffer = _loadFile(audioCTX, "./audio/theme.mp3");
  const engineFileBuffer = _loadFile(audioCTX, "./audio/engine.mp3");
  const boosterFileBuffer = _loadFile(audioCTX, "./audio/booster.mp3");

  let engineFileBufferSource = false;
  let leftBoosterFileBufferSource = false;
  let rightBoosterFileBufferSource = false;

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

  function playLeftBoosterSound() {
    if (!leftBoosterFileBufferSource) {
      leftBoosterFileBufferSource = _playTrack(boosterFileBuffer);
    }
  }

  function playRightBoosterSound() {
    if (!rightBoosterFileBufferSource) {
      rightBoosterFileBufferSource = _playTrack(boosterFileBuffer);
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

  function stopLeftBoosterSound() {
    if (leftBoosterFileBufferSource) {
      leftBoosterFileBufferSource.then((e) => {
        e.stop();
        leftBoosterFileBufferSource = false;
      });
    }
  }

  function stopRightBoosterSound() {
    if (rightBoosterFileBufferSource) {
      rightBoosterFileBufferSource.then((e) => {
        e.stop();
        rightBoosterFileBufferSource = false;
      });
    }
  }

  function playTheme() {
    _playTrack(themeFileBuffer);
  }

  return {
    playEngineSound,
    playLeftBoosterSound,
    playRightBoosterSound,
    stopEngineSound,
    stopLeftBoosterSound,
    stopRightBoosterSound,
    playTheme,
  };
};
