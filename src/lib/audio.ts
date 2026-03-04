// Meditation bell sounds using Web Audio API
// No external files needed — generates tones programmatically

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playBellStart() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Singing bowl tone — warm, resonant
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(528, now); // C5 — Solfeggio frequency
  osc1.frequency.exponentialRampToValueAtTime(520, now + 2);

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(396, now); // Subtle harmonic
  osc2.frequency.exponentialRampToValueAtTime(392, now + 2);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 3);
  osc2.stop(now + 3);
}

export function playBellEnd() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Three gentle bells
  for (let i = 0; i < 3; i++) {
    const offset = i * 1.2;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(639, now + offset); // Heart chakra freq
    osc.frequency.exponentialRampToValueAtTime(630, now + offset + 2.5);

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.25, now + offset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 2.5);
  }
}

export function resumeAudioContext() {
  if (audioCtx?.state === "suspended") {
    audioCtx.resume();
  }
}
