/**
 * Web Audio API Synthesizer for Procedural Game Sound Effects
 * Generates low-latency footsteps, flashlight clicks, terminal beeps, and achievement cues.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('schrodinger-abyss-bgm-muted') === 'true';
}

function getMasterVolume(): number {
  if (typeof window === 'undefined') return 0.35;
  const stored = window.localStorage.getItem('schrodinger-abyss-bgm-vol');
  return stored !== null ? Math.max(0, Math.min(1, parseFloat(stored))) : 0.35;
}

let footstepToggle = false;

/** Synthesize dynamic walking footstep on metal/grate flooring */
export function playFootstep() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.25;

  footstepToggle = !footstepToggle;
  const baseFreq = footstepToggle ? 85 : 92;

  // 1. Low Thud (Oscillator)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

  oscGain.gain.setValueAtTime(vol * 1.2, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  // 2. High Grit / Noise (Metal scuff)
  const bufferSize = ctx.sampleRate * 0.05;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(footstepToggle ? 1400 : 1600, now);
  filter.Q.setValueAtTime(3, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.45, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  whiteNoise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
  whiteNoise.start(now);
  whiteNoise.stop(now + 0.06);
}

/** Synthesize tactical flashlight switch toggle */
export function playFlashlightToggle(turningOn: boolean) {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.4;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const startFreq = turningOn ? 1200 : 800;
  const endFreq = turningOn ? 2400 : 400;

  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);

  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/** Synthesize terminal keypress / interaction beep */
export function playTerminalBlip() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.25;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(960 + Math.random() * 80, now);

  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/** Synthesize puzzle correct access granted chime */
export function playSolveChime() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.4;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(vol, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.4);
  });
}

/** Synthesize glitch error buzzer */
export function playErrorGlitch() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.45;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.setValueAtTime(95, now + 0.08);

  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.26);
}

/** Synthesize celestial resonance chord when an achievement is unlocked */
export function playAchievementJingle() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.45;

  const notes = [440, 554.37, 659.25, 880, 1108.73]; // A Major 9th
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.06;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(vol, noteTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.85);
  });
}

/** Synthesize deep heavy metal door slam with industrial reverberation */
export function playHeavyDoorSlam() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.95;

  // 1. Massive Sub-Bass Impact
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(120, now);
  subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.4);

  subGain.gain.setValueAtTime(vol * 1.5, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 1.3);

  // 2. Heavy Metallic Clang (Distorted Triangle)
  const clangOsc = ctx.createOscillator();
  const clangGain = ctx.createGain();
  clangOsc.type = 'sawtooth';
  clangOsc.frequency.setValueAtTime(280, now);
  clangOsc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

  const clangFilter = ctx.createBiquadFilter();
  clangFilter.type = 'bandpass';
  clangFilter.frequency.setValueAtTime(320, now);
  clangFilter.Q.setValueAtTime(8, now);

  clangGain.gain.setValueAtTime(vol * 0.85, now);
  clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  clangOsc.connect(clangFilter);
  clangFilter.connect(clangGain);
  clangGain.connect(ctx.destination);
  clangOsc.start(now);
  clangOsc.stop(now + 0.85);

  // 3. Metallic Resonant Scraping Burst
  const bufferSize = ctx.sampleRate * 0.4;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.9, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  whiteNoise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  whiteNoise.start(now);
  whiteNoise.stop(now + 0.42);
}

/** Synthesize deep visceral anatomical heartbeat thump */
export function playHeartbeatThump(intensity = 1.0) {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.75 * intensity;

  // Lub
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(75, now);
  osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);

  gain1.gain.setValueAtTime(vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.15);

  // Dub (slight offset)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(65, now + 0.11);
  osc2.frequency.exponentialRampToValueAtTime(28, now + 0.22);

  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(vol * 0.8, now + 0.11);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.11);
  osc2.stop(now + 0.26);
}

/** Synthesize eerie sentient machine awakening drone */
export function playMachineHum() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.5;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(40, now);
  osc.frequency.linearRampToValueAtTime(110, now + 2.5);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(90, now);
  filter.frequency.linearRampToValueAtTime(350, now + 2.5);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(vol, now + 1.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 4.6);
}

/** Synthesize tape hiss / eerie whisper glitch */
export function playTapeStatic(duration = 1.0) {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume() * 0.35;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.05);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(2.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.05);
}
