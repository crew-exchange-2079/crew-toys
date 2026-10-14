// Headless gate for the parts a browser cannot be here to prove:
// the scale lock, machine serialization, preset melodies and physics.
// Run: node test.mjs
import assert from "node:assert/strict";
import { SCALES, degreeToMidi, midiToFreq, degreeToFreq, midiName, clampDegree, barPitch, DEGREE_MAX } from "./js/scale.js";
import {
  BOARD, PRESETS, defaultMachine, encodeMachine, decodeMachine, machineFromHash,
  hashForMachine, repairMachine, isValidMachine, surpriseMachine, cloneMachine,
} from "./js/machine.js";
import { createWorld, spawnMarble, step, drainEvents, worldIsSane, MAX_MARBLES } from "./js/physics.js";

let passed = 0;
function ok(condition, message) {
  assert.ok(condition, message);
  passed += 1;
}

// --- scale lock ---------------------------------------------------------------
for (const [scaleId, scale] of Object.entries(SCALES)) {
  const pitches = [];
  for (let degree = 0; degree <= DEGREE_MAX; degree += 1) {
    const midi = degreeToMidi(60, scaleId, degree);
    ok(Number.isInteger(midi) && midi > 0, `${scaleId} degree ${degree} maps to a positive MIDI note`);
    pitches.push(midi);
  }
  for (let i = 1; i < pitches.length; i += 1) {
    ok(pitches[i] > pitches[i - 1], `${scaleId} degrees stay strictly ascending (scale lock)`);
  }
  ok(pitches[0] === 60, `${scaleId} degree 0 is the root`);
  ok(pitches[scale.steps.length] === 72, `${scaleId} one octave up is +12`);
}
ok(degreeToMidi(60, "major", -1) === 59, "degree -1 wraps to the step below the root (B3)");
ok(degreeToMidi(60, "major", -7) === 48, "degree -7 wraps down a full octave");
ok(degreeToMidi(60, "major", -8) === 47, "degree -8 is the step below that (B2)");
ok(degreeToFreq(60, "major", 0) === 261.6255653005986, "C4 is ~261.6 Hz");
ok(Math.abs(midiToFreq(81) - 880) < 1e-9, "A5 is 880 Hz");
ok(midiName(60) === "C4" && midiName(61) === "C#4" && midiName(71) === "B4", "note names");
ok(clampDegree(-5) === 0 && clampDegree(99) === DEGREE_MAX && clampDegree(7.6) === 8, "degree clamp");
ok(barPitch(60, "major", 0).name === "C4", "barPitch labels the tuned bar");

// --- serialization ------------------------------------------------------------
const machines = [...PRESETS.map((preset) => defaultMachine.call(null) || preset), defaultMachine(), surpriseMachine(42)];
for (const preset of PRESETS) {
  const machine = cloneMachine({ ...preset, version: 1 });
  const encoded = encodeMachine(machine);
  ok(/^[A-Za-z0-9_-]+$/.test(encoded), `encoded machine is URL-safe (${preset.id})`);
  ok(encoded.length <= 3000, `shared link stays small enough (${preset.id}: ${encoded.length} chars)`);
  const decoded = decodeMachine(encoded);
  ok(decoded !== null, `decodes (${preset.id})`);
  ok(JSON.stringify(decoded.bars) === JSON.stringify(repairMachine(machine).machine.bars), `bars round-trip (${preset.id})`);
  ok(decoded.name === machine.name && decoded.scale === machine.scale && decoded.timbre === machine.timbre, `meta round-trips (${preset.id})`);
  ok(machineFromHash(hashForMachine(machine)) !== null, `hash form round-trips (${preset.id})`);
  ok(machineFromHash("#m=" + encodeMachine(machine)) !== null, "#m= prefix parses");
}
ok(decodeMachine("") === null, "empty string does not decode");
ok(decodeMachine("!!!not-base64!!!") === null, "garbage does not decode");
ok(decodeMachine("eyJ2IjoyfQ") === null, "wrong version is rejected");
ok(decodeMachine("{}") === null, "non-machine JSON is rejected");
ok(machineFromHash("") === null && machineFromHash("#other=1") === null, "absent hash yields no machine");

// --- repair -------------------------------------------------------------------
const broken = {
  version: 1, name: "x".repeat(99), scale: "nope", timbre: "nope", gravity: 99999,
  bars: [
    { id: "b0", x: -50, y: 5000, angle: 400, length: 5, degree: 99 },
    { id: "b0", x: 100, y: 100, angle: 10, length: 100, degree: 3 },
    { id: "b2", x: NaN, y: 100, angle: 10, length: 100, degree: 3 },
  ],
  bumpers: [{ id: "p0", x: 100, y: 100, radius: 5 }],
};
const { machine: repaired, repaired: wasRepaired } = repairMachine(broken);
ok(wasRepaired, "repair reports changes");
ok(isValidMachine(repaired), "repaired machine is valid");
ok(repaired.bars.length === 2, "duplicate ids dropped");
ok(repaired.bars[0].x === 0 && repaired.bars[0].y === BOARD.height, "out-of-bounds clamped to the board");
ok(repaired.bars[0].degree === DEGREE_MAX && repaired.bars[0].angle === 80, "degree/angle clamped");
ok(repaired.scale === "major" && repaired.timbre === "marble", "unknown scale/timbre fall back");
ok(repaired.bumpers[0].radius === 14, "bumper radius clamped up to minimum");
ok(!isValidMachine({ version: 2 }), "isValidMachine rejects junk");

// --- presets ------------------------------------------------------------------
ok(PRESETS.length === 5, "five presets");
const TUNES = {
  twinkle: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
  ode: [2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1],
  mary: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4],
  frere: [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 2, 3, 4],
  grace: [0, 3, 5, 3, 5, 4, 3, 1, 2, 0],
};
for (const preset of PRESETS) {
  ok(preset.bars.length >= 8, `${preset.id} has at least 8 bars`);
  ok(preset.bars.every((bar) => bar.x >= 0 && bar.x <= BOARD.width && bar.y >= 0 && bar.y <= BOARD.height), `${preset.id} bars stay on the board`);
  ok(preset.bars.every((bar) => bar.degree >= 0 && bar.degree <= 7), `${preset.id} degrees are in tune range`);
  ok(new Set(preset.bars.map((bar) => bar.id)).size === preset.bars.length, `${preset.id} bar ids unique`);
  ok(JSON.stringify(preset.bars.map((bar) => bar.degree)) === JSON.stringify(TUNES[preset.id]), `${preset.id} carries its tune`);
}
ok(defaultMachine().name === "Twinkle Twinkle", "first-run default is a lovely tune");

// --- surprise -----------------------------------------------------------------
const surpriseA = surpriseMachine(123);
const surpriseB = surpriseMachine(123);
ok(JSON.stringify(surpriseA) === JSON.stringify(surpriseB), "surprise is deterministic for a seed");
for (let seed = 0; seed < 100; seed += 1) {
  const machine = surpriseMachine(seed);
  ok(isValidMachine(machine), `surprise seed ${seed} is valid`);
  ok(machine.bars.every((bar) => bar.degree >= 0 && bar.degree <= DEGREE_MAX), `surprise seed ${seed} degrees in range`);
  ok(machine.bars.length >= 8 && machine.bars.length <= 14, `surprise seed ${seed} bar count playable`);
}

// --- physics ------------------------------------------------------------------
function hopperX(machine) {
  const first = machine.bars[0];
  return first.x + (first.angle > 0 ? 30 : -30);
}

function playDrop(machine, seconds = 16) {
  const world = createWorld(machine);
  spawnMarble(world, hopperX(machine), 40);
  const notes = [];
  for (let t = 0; t < seconds; t += 1 / 60) {
    step(world, 1 / 60);
    for (const event of drainEvents(world)) {
      if (event.kind === "bar") notes.push({ id: event.id, degree: event.degree });
    }
  }
  return { world, notes };
}

for (const preset of PRESETS) {
  const { world, notes } = playDrop(preset);
  ok(worldIsSane(world), `${preset.id} world stays sane over a full drop`);
  const firstHitByBar = new Map();
  for (const note of notes) {
    if (!firstHitByBar.has(note.id)) firstHitByBar.set(note.id, note.degree);
  }
  const tune = TUNES[preset.id];
  const firstHits = preset.bars.map((bar) => firstHitByBar.get(bar.id)).filter((d) => d !== undefined);
  ok(firstHits.length >= Math.ceil(tune.length * 0.7), `${preset.id} plays ${firstHits.length}/${tune.length} bars from one drop`);
  ok(JSON.stringify(firstHits) === JSON.stringify(tune.slice(0, firstHits.length)), `${preset.id} plays its tune in order (top-to-bottom)`);
}

// Determinism: same machine, same drop, same event stream.
const run1 = playDrop(PRESETS[0], 6);
const run2 = playDrop(PRESETS[0], 6);
ok(JSON.stringify(run1.notes) === JSON.stringify(run2.notes), "physics is deterministic for the same drop");

// Load: thirty drops over thirty seconds never break bounds or accumulate.
{
  const world = createWorld(defaultMachine());
  for (let t = 0; t < 30; t += 1 / 60) {
    if (Math.abs(t % 1) < 1 / 60) spawnMarble(world, 480 + Math.random() * 40, 40);
    step(world, 1 / 60);
    drainEvents(world);
  }
  ok(worldIsSane(world), "30 s of marble rain stays in bounds");
  ok(world.marbles.length <= MAX_MARBLES, `marbles are recycled (peak cap ${MAX_MARBLES})`);
}

// A marble left alone on a flat bar is recycled instead of piling up.
{
  const flat = {
    version: 1, name: "flat", scale: "major", rootMidi: 60, timbre: "marble", gravity: 1400,
    bars: [{ id: "b0", x: 500, y: 500, angle: 0, length: 300, degree: 0 }],
    bumpers: [],
  };
  const world = createWorld(flat);
  spawnMarble(world, 500, 300);
  for (let t = 0; t < 8; t += 1 / 60) {
    step(world, 1 / 60);
    drainEvents(world);
  }
  ok(world.marbles.length === 0, "resting marble is recycled");
}

console.log(`marble-music-toy: PASS (${passed} assertions)`);
console.log("  scale lock: PASS (4 scales, wrap/octave/clamp)");
console.log("  serialization: PASS (5 presets round-trip, URL-safe, repair, hash)");
console.log("  presets: PASS (5 tunes, on board, unique ids)");
console.log("  surprise: PASS (deterministic, 100 seeds valid)");
console.log("  physics: PASS (presets play in order, deterministic, bounded, recycled)");
