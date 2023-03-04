import { randomBool } from "./helpers.js";

export const makeAudioManager = () => {
  const audioCTX = new AudioContext();
  const engineFileBuffer = _loadFile(audioCTX, "./audio/engine.mp3");
  const boosterFileBuffer = _loadFile(audioCTX, "./audio/booster.mp3");
  const crash1FileBuffer = _loadFile(audioCTX, "./audio/crash1.mp3");
  const crash2FileBuffer = _loadFile(audioCTX, "./audio/crash2.mp3");
  const landing1FileBuffer = _loadFile(audioCTX, "./audio/landing1.mp3");
  const landing2FileBuffer = _loadFile(audioCTX, "./audio/landing2.mp3");
  const confetti1FileBuffer = _loadFile(audioCTX, "./audio/confetti1.mp3");
  const confetti2FileBuffer = _loadFile(audioCTX, "./audio/confetti2.mp3");
  const babyFileBuffer = _loadFile(audioCTX, "./audio/baby.mp3");

  let engineFileBufferSource = false;
  let booster1FileBufferSource = false;
  let booster2FileBufferSource = false;

  // Play theme in a loop in the background on instantiation. Playing some
  // audio continuously with the HTML audio API will allow audio via the Web
  // Audio API to play on the main sound channel in iOS, rather than the
  // ringer channel.
  let themeAudio = false;
  const playTheme = () => {
    if (!themeAudio) {
      themeAudio = new Audio("./audio/theme.mp3");
      themeAudio.loop = true;
      themeAudio.play();
    } else {
      themeAudio.play();
    }
  };

  const options = { once: true };
  document.addEventListener("touchend", playTheme, options);
  document.addEventListener("keyup", playTheme, options);

  async function _loadFile(context, filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  async function _playTrack(audioBuffer, loop = true) {
    return Promise.all([audioBuffer, audioCTX.resume()]).then((e) => {
      const trackSource = new AudioBufferSourceNode(audioCTX, {
        buffer: e[0],
        loop: loop,
      });
      trackSource.connect(audioCTX.destination);
      trackSource.start();

      return trackSource;
    });
  }

  const playEngineSound = () => {
    if (!engineFileBufferSource) {
      engineFileBufferSource = _playTrack(engineFileBuffer);
    }
  };

  const playBoosterSound1 = () => {
    if (!booster1FileBufferSource) {
      booster1FileBufferSource = _playTrack(boosterFileBuffer);
    }
  };

  const playBoosterSound2 = () => {
    if (!booster2FileBufferSource) {
      booster2FileBufferSource = _playTrack(boosterFileBuffer);
    }
  };

  const stopEngineSound = () => {
    if (engineFileBufferSource) {
      engineFileBufferSource.then((e) => {
        e.stop();
        engineFileBufferSource = false;
      });
    }
  };

  const stopBoosterSound1 = () => {
    if (booster1FileBufferSource) {
      booster1FileBufferSource.then((e) => {
        e.stop();
        booster1FileBufferSource = false;
      });
    }
  };

  const stopBoosterSound2 = () => {
    if (booster2FileBufferSource) {
      booster2FileBufferSource.then((e) => {
        e.stop();
        booster2FileBufferSource = false;
      });
    }
  };

  const playCrash = () => {
    _playTrack(randomBool() ? crash1FileBuffer : crash2FileBuffer, false);
  };

  const playLanding = () => {
    _playTrack(randomBool() ? landing1FileBuffer : landing2FileBuffer, false);
  };

  const playConfetti = () => {
    _playTrack(randomBool() ? confetti1FileBuffer : confetti2FileBuffer, false);
  };

  const playBaby = () => {
    _playTrack(babyFileBuffer, false);
  };

  return {
    playEngineSound,
    playBoosterSound1,
    playBoosterSound2,
    stopEngineSound,
    stopBoosterSound1,
    stopBoosterSound2,
    playCrash,
    playLanding,
    playConfetti,
    playBaby,
  };
};
