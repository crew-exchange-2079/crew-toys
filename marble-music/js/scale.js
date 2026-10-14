// Pure pitch logic. No DOM, no audio — node tests and the browser share it.
// Every bar in a machine is tuned to a DEGREE of a scale; the degree is the only
// thing that travels in a shared URL, so a machine always sounds in key.

export const SCALES = {
  major: { name: "Major", steps: [0, 2, 4, 5, 7, 9, 11] },
  minor: { name: "Minor", steps: [0, 2, 3, 5, 7, 8, 10] },
  penta: { name: "Major Pentatonic", steps: [0, 2, 4, 7, 9] },
  dorian: { name: "Dorian", steps: [0, 2, 3, 5, 7, 9, 10] },
};

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// How many degrees a machine offers: two octaves of the scale, so a zigzag of
// up to ~15 bars can carry a full tune without repeating a pitch.
export const DEGREE_MIN = 0;
export const DEGREE_MAX = 15;

export function scaleSteps(scaleId) {
  const scale = SCALES[scaleId];
  if (!scale) throw new Error(`unknown scale: ${scaleId}`);
  return scale.steps;
}

// Degree -> MIDI note number. Degrees wrap across octaves; negative degrees walk
// down (degree -1 is the scale step below the root). This is the scale lock:
// no bar can ever hold a pitch outside the scale.
export function degreeToMidi(rootMidi, scaleId, degree) {
  const steps = scaleSteps(scaleId);
  const octave = Math.floor(degree / steps.length);
  const step = ((degree % steps.length) + steps.length) % steps.length;
  return rootMidi + octave * 12 + steps[step];
}

export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function degreeToFreq(rootMidi, scaleId, degree) {
  return midiToFreq(degreeToMidi(rootMidi, scaleId, degree));
}

export function midiName(midi) {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

// Clamp a degree into the machine's range. Used by the tuner UI and by
// validation on load, so a corrupted URL can never produce an out-of-range bar.
export function clampDegree(degree) {
  if (!Number.isFinite(degree)) return DEGREE_MIN;
  return Math.min(DEGREE_MAX, Math.max(DEGREE_MIN, Math.round(degree)));
}

// The pitch a bar would sound at, for labels and tests.
export function barPitch(rootMidi, scaleId, degree) {
  const midi = degreeToMidi(rootMidi, scaleId, clampDegree(degree));
  return { midi, frequency: midiToFreq(midi), name: midiName(midi) };
}
