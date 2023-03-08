import { randomBool } from "./helpers.js";

export const makeAudioManager = () => {
  let hasInitialized = false;
  let audioCTX;
  let engineFileBuffer;
  let boosterFileBuffer;
  let crash1FileBuffer;
  let crash2FileBuffer;
  let landing1FileBuffer;
  let landing2FileBuffer;
  let confetti1FileBuffer;
  let confetti2FileBuffer;
  let babyFileBuffer;
  let themeAudio;

  let engineFileBufferSource = false;
  let booster1FileBufferSource = false;
  let booster2FileBufferSource = false;

  async function _loadFile(context, filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  const _initialize = (e) => {
    if (!hasInitialized) {
      hasInitialized = true;
      audioCTX = new AudioContext();
      engineFileBuffer = _loadFile(audioCTX, "./audio/engine.mp3");
      boosterFileBuffer = _loadFile(audioCTX, "./audio/booster.mp3");
      crash1FileBuffer = _loadFile(audioCTX, "./audio/crash1.mp3");
      crash2FileBuffer = _loadFile(audioCTX, "./audio/crash2.mp3");
      landing1FileBuffer = _loadFile(audioCTX, "./audio/landing1.mp3");
      landing2FileBuffer = _loadFile(audioCTX, "./audio/landing2.mp3");
      confetti1FileBuffer = _loadFile(audioCTX, "./audio/confetti1.mp3");
      confetti2FileBuffer = _loadFile(audioCTX, "./audio/confetti2.mp3");
      babyFileBuffer = _loadFile(audioCTX, "./audio/baby.mp3");

      // Play theme in a loop in the background on instantiation. Playing some
      // audio continuously with the HTML audio API will allow audio via the Web
      // Audio API to play on the main sound channel in iOS, rather than the
      // ringer channel.
      themeAudio = new Audio("./audio/theme.mp3");
      themeAudio.loop = true;
      themeAudio.play();
    }
  };

  document.addEventListener("touchend", _initialize, { once: true });
  document.addEventListener(
    "keydown",
    ({ isTrusted, metaKey, shiftKey, ctrlKey, altKey, key }) => {
      if (
        isTrusted &&
        !(metaKey || shiftKey || ctrlKey || altKey) &&
        key !== "Escape" &&
        key !== "Esc"
      ) {
        _initialize();
      }
    },
    { once: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (themeAudio) {
      document.hidden ? themeAudio.pause() : themeAudio.play();
    }
  });

  async function _playTrack(audioBuffer, loop = true) {
    const playBuffer = (buffer) => {
      const trackSource = new AudioBufferSourceNode(audioCTX, {
        buffer: buffer,
        loop: loop,
      });
      trackSource.connect(audioCTX.destination);
      trackSource.start();
      return trackSource;
    };

    if (hasInitialized) {
      return Promise.all([audioCTX.resume(), audioBuffer]).then((e) =>
        playBuffer(e[1])
      );
    } else {
      return Promise.all([_initialize(), audioBuffer]).then((e) =>
        playBuffer(e[1])
      );
    }
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
