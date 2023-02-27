export const makeAudioManager = () => {
  const audioCTX = new AudioContext();
  const themeFileBuffer = _loadFile(audioCTX, "./audio/theme.mp3");
  const engineFileBuffer = _loadFile(audioCTX, "./audio/engine.mp3");
  const boosterFileBuffer = _loadFile(audioCTX, "./audio/booster.mp3");

  let engineFileBufferSource = false;
  let boosterFileBufferSource = false;

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

  async function playEngineSound() {
    if (!engineFileBufferSource) {
      engineFileBufferSource = _playTrack(engineFileBuffer);
    }
  }

  async function playBoosterSound() {
    if (!boosterFileBufferSource) {
      boosterFileBufferSource = _playTrack(boosterFileBuffer);
    }
  }

  async function stopEngineSound() {
    if (engineFileBufferSource) {
      engineFileBufferSource.then((e) => {
        e.stop();
        engineFileBufferSource = false;
      });
    }
  }

  async function stopBoosterSound() {
    if (boosterFileBufferSource) {
      boosterFileBufferSource.then((e) => {
        e.stop();
        boosterFileBufferSource = false;
      });
    }
  }

  async function playTheme() {
    _playTrack(themeFileBuffer);
  }

  return {
    playEngineSound,
    playBoosterSound,
    stopEngineSound,
    stopBoosterSound,
    playTheme,
  };
};
