// Web Audio engine. Created only on a user gesture (browser policy), like the
// source instrument. One shared master -> compressor -> destination, so a
// handful of marbles can never clip the output.

import { midiToFreq } from "./scale.js";

let context = null;
let master = null;
let compressor = null;
let noiseBuffer = null;
let volume = 0.24;
let muted = false;

export function ensureAudio() {
  if (context) {
    if (context.state === "suspended") context.resume();
    return context;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  context = new AudioContext();
  compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 24;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.18;
  master = context.createGain();
  master.gain.value = muted ? 0 : volume;
  master.connect(compressor).connect(context.destination);
  // A few milliseconds of noise for the attack "tick" of each strike.
  const length = Math.floor(context.sampleRate * 0.012);
  noiseBuffer = context.createBuffer(1, length, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  return context;
}

export function setVolume(value) {
  volume = Math.min(0.6, Math.max(0, value));
  if (master && !muted) master.gain.setTargetAtTime(volume, context.currentTime, 0.02);
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, context.currentTime, 0.02);
}

export function audioState() {
  return context ? context.state : "none";
}

// A struck bar: fundamental + a soft 4th partial (marimba-ish), noise click on
// the attack, exponential decay. Velocity scales loudness, never pitch.
export function playBar(midi, velocity, timbre) {
  if (!context || context.state !== "running") return;
  const freq = midiToFreq(midi);
  const now = context.currentTime;
  const level = Math.min(1, Math.max(0.05, velocity)) * 0.5;
  const decay = timbre ? timbre.decay : 0.7;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  gain.connect(master);

  const osc = context.createOscillator();
  osc.type = timbre && timbre.wave === "triangle" ? "triangle" : "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + decay + 0.05);

  const partial = context.createOscillator();
  partial.type = "sine";
  partial.frequency.value = freq * 4.01;
  const partialGain = context.createGain();
  partialGain.gain.value = 0.18;
  partial.connect(partialGain).connect(gain);
  partial.start(now);
  partial.stop(now + decay * 0.4);

  const click = context.createBufferSource();
  click.buffer = noiseBuffer;
  const clickGain = context.createGain();
  clickGain.gain.value = (timbre ? timbre.noise : 0.1) * level;
  click.connect(clickGain).connect(master);
  click.start(now);
}

// A bumper: a short metallic tink. Smaller bumper -> higher pitch.
export function playBumper(velocity, radius) {
  if (!context || context.state !== "running") return;
  const now = context.currentTime;
  const freq = 1568 * Math.pow(20 / Math.max(14, radius || 20), 0.5);
  const level = Math.min(1, Math.max(0.05, velocity)) * 0.22;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  gain.connect(master);

  const osc = context.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.3);

  const ping = context.createOscillator();
  ping.type = "sine";
  ping.frequency.value = freq * 2.76;
  const pingGain = context.createGain();
  pingGain.gain.value = 0.25;
  ping.connect(pingGain).connect(gain);
  ping.start(now);
  ping.stop(now + 0.12);
}
