window.BirthdayAudio = (() => {
  let ctx = null;
  let isPlaying = false;
  let timerId = null;
  let noteIndex = 0;
  let userMuted = false;

  // Happy Birthday melody (in F major / C5-C6 range for music-box warmth)
  // [frequencyHz, durationBeats]
  const NOTE_FREQ = {
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.0,
    Bb5: 932.33,
    C6: 1046.5,
  };

  const MELODY = [
    ["C5", 0.75], ["C5", 0.25], ["D5", 1], ["C5", 1], ["F5", 1], ["E5", 2],
    ["C5", 0.75], ["C5", 0.25], ["D5", 1], ["C5", 1], ["G5", 1], ["F5", 2],
    ["C5", 0.75], ["C5", 0.25], ["C6", 1], ["A5", 1], ["F5", 1], ["E5", 1], ["D5", 2],
    ["Bb5", 0.75], ["Bb5", 0.25], ["A5", 1], ["F5", 1], ["G5", 1], ["F5", 2.5],
  ];

  const BEAT_MS = 460;

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function playMusicBoxNote(freq, durSec) {
    const audio = ensureContext();
    const now = audio.currentTime;

    const osc = audio.createOscillator();
    const overtone = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = audio.createGain();
    overtoneGain.gain.setValueAtTime(0.14, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + durSec * 1.15);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(audio.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + durSec * 1.2);
    overtone.stop(now + durSec * 1.2);
  }

  function scheduleNext() {
    if (!isPlaying) return;
    const [noteName, beats] = MELODY[noteIndex];
    const freq = NOTE_FREQ[noteName];
    const durMs = beats * BEAT_MS;

    if (freq && !userMuted) {
      playMusicBoxNote(freq, durMs / 1000);
    }

    noteIndex = (noteIndex + 1) % MELODY.length;
    timerId = setTimeout(scheduleNext, durMs);
  }

  function updateToggleUI() {
    const btn = document.getElementById("music-toggle-btn");
    if (!btn) return;
    const label = btn.querySelector(".music-label");
    if (isPlaying && !userMuted) {
      btn.classList.add("playing");
      if (label) label.textContent = "Happy Birthday (เปิด)";
    } else {
      btn.classList.remove("playing");
      if (label) label.textContent = "Happy Birthday (ปิด)";
    }
  }

  function startBackgroundMusic() {
    if (userMuted || isPlaying) {
      updateToggleUI();
      return;
    }
    ensureContext();
    isPlaying = true;
    scheduleNext();
    updateToggleUI();
  }

  function stopBackgroundMusic() {
    isPlaying = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    updateToggleUI();
  }

  function toggleBackgroundMusic() {
    if (isPlaying && !userMuted) {
      userMuted = true;
      stopBackgroundMusic();
    } else {
      userMuted = false;
      startBackgroundMusic();
    }
  }

  function playKeyTap() {
    try {
      const audio = ensureContext();
      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  function playMatchChime() {
    try {
      [659.25, 880, 1046.5].forEach((f, idx) => {
        setTimeout(() => playMusicBoxNote(f, 0.35), idx * 75);
      });
    } catch (_) {}
  }

  function playSuccessFanfare() {
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        setTimeout(() => playMusicBoxNote(f, 0.55), idx * 90);
      });
    } catch (_) {}
  }

  function playMeow(pitchOffset = 0) {
    try {
      const audio = ensureContext();
      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const base = 520 + pitchOffset * 85;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(base * 0.92, now + 0.38);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.44);
    } catch (_) {}
  }

  return {
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleBackgroundMusic,
    playKeyTap,
    playMatchChime,
    playSuccessFanfare,
    playMeow,
  };
})();
