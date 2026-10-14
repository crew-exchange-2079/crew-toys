// Pure machine model: presets, surprise generator, (de)serialization, repair.
// No DOM, no audio — everything here is proven by `node test.mjs`.
//
// A machine is a board layout in a fixed 1000x1000 design space. Bars are
// capsules (center x/y, angle in degrees, length, scale degree); bumpers are
// circles. The ONLY pitch data that travels is the scale degree, so a shared
// URL can never leave the key.

import { SCALES, DEGREE_MIN, DEGREE_MAX, clampDegree } from "./scale.js";

export const BOARD = { width: 1000, height: 1000 };
export const TIMBRES = {
  marble: { name: "Marble", wave: "sine", decay: 0.72, noise: 0.12 },
  wood: { name: "Wood", wave: "triangle", decay: 0.42, noise: 0.04 },
  glass: { name: "Glass", wave: "sine", decay: 1.2, noise: 0.02 },
};

export const LIMITS = {
  bars: 24,
  bumpers: 8,
  barLength: [60, 220],
  bumperRadius: [14, 42],
  angle: [-80, 80],
  gravity: [700, 2400],
};

// --- layout helper -----------------------------------------------------------
// The staircase: alternating gentle diagonals whose spans overlap heavily
// (offset 40 << length 170). A marble dropped from the hopper lands on bar 0,
// rolls to its low end, drops ~40px onto bar 1 — which covers the same ground,
// so it cannot be skipped — and so on. Top-to-bottom order IS the melody.
export function zigzag({ count, topY = 170, gapY = 58, cx = 500, offset = 40, length = 170, angleDeg = 10, startSign = 1 }) {
  const bars = [];
  for (let i = 0; i < count; i += 1) {
    const sign = i % 2 === 0 ? startSign : -startSign;
    bars.push({
      id: `b${i}`,
      x: Math.round(cx + (i % 2 === 0 ? -offset : offset)),
      y: Math.round(topY + i * gapY),
      angle: sign * angleDeg,
      length,
      degree: 0,
    });
  }
  return bars;
}

function barsWithDegrees(bars, degrees) {
  return bars.map((bar, i) => ({ ...bar, degree: degrees[i % degrees.length] }));
}

// --- presets -----------------------------------------------------------------
// Five real tunes. Degrees are C-major scale steps (0=C4 … 7=C5); the zigzag
// turns top-to-bottom into the melody. The physics test proves each preset
// actually plays its tune when a marble is dropped from the hopper.
// Zigzag geometry: last bar must stay on the 1000x1000 board, and the
// physics test proves each preset plays its tune top-to-bottom from the hopper.
export const PRESETS = [
  {
    id: "twinkle",
    name: "Twinkle Twinkle",
    timbre: "marble",
    scale: "major",
    rootMidi: 60,
    gravity: 1200,
    bars: barsWithDegrees(zigzag({ count: 14, gapY: 58 }), [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0]),
    bumpers: [],
  },
  {
    id: "ode",
    name: "Ode to Joy",
    timbre: "wood",
    scale: "major",
    rootMidi: 60,
    gravity: 1200,
    bars: barsWithDegrees(zigzag({ count: 15, gapY: 56 }), [2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1]),
    bumpers: [{ id: "p0", x: 200, y: 340, radius: 18 }],
  },
  {
    id: "mary",
    name: "Mary Had a Little Lamb",
    timbre: "glass",
    scale: "major",
    rootMidi: 60,
    gravity: 1200,
    bars: barsWithDegrees(zigzag({ count: 13, gapY: 64 }), [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4]),
    bumpers: [],
  },
  {
    id: "frere",
    name: "Frère Jacques",
    timbre: "marble",
    scale: "major",
    rootMidi: 60,
    gravity: 1200,
    bars: barsWithDegrees(zigzag({ count: 14, gapY: 58 }), [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 2, 3, 4]),
    bumpers: [{ id: "p0", x: 230, y: 430, radius: 16 }, { id: "p1", x: 770, y: 430, radius: 16 }],
  },
  {
    id: "grace",
    name: "Amazing Grace",
    timbre: "wood",
    scale: "major",
    rootMidi: 60,
    gravity: 1200,
    bars: barsWithDegrees(zigzag({ count: 10, gapY: 68 }), [0, 3, 5, 3, 5, 4, 3, 1, 2, 0]),
    bumpers: [],
  },
];

export function getPreset(id) {
  const preset = PRESETS.find((entry) => entry.id === id);
  return preset ? cloneMachine(presetMachine(preset)) : null;
}

function presetMachine(preset) {
  return {
    version: 1,
    name: preset.name,
    scale: preset.scale,
    rootMidi: preset.rootMidi,
    timbre: preset.timbre,
    gravity: preset.gravity,
    bars: preset.bars.map((bar) => ({ ...bar })),
    bumpers: preset.bumpers.map((bumper) => ({ ...bumper })),
  };
}

export function defaultMachine() {
  return getPreset("twinkle");
}

export function cloneMachine(machine) {
  return {
    ...machine,
    bars: machine.bars.map((bar) => ({ ...bar })),
    bumpers: machine.bumpers.map((bumper) => ({ ...bumper })),
  };
}

// --- surprise me -------------------------------------------------------------
function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SURPRISE_NAMES = [
  "Gilded Cascade", "Moonlit Steps", "Copper Rain", "Velvet Orbit", "Amber Drift",
  "Silver Lullaby", "Ember Waltz", "Opal Descent", "Honeycomb Song", "Quiet Comet",
];

// A random machine that is always playable: a zigzag whose degrees take a
// random walk (so the melody wanders but stays musical), plus a few bumpers.
export function surpriseMachine(seed = (Math.random() * 2 ** 32) >>> 0) {
  const rand = mulberry32(seed);
  const scaleIds = Object.keys(SCALES);
  const scale = scaleIds[Math.floor(rand() * scaleIds.length)];
  const timbreIds = Object.keys(TIMBRES);
  const timbre = timbreIds[Math.floor(rand() * timbreIds.length)];
  const count = 8 + Math.floor(rand() * 7);
  const degrees = [];
  let degree = 2 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i += 1) {
    degrees.push(degree);
    degree = Math.min(10, Math.max(0, degree + Math.floor(rand() * 5) - 2));
  }
  const bars = zigzag({
    count,
    topY: 150 + Math.floor(rand() * 30),
    gapY: 54 + Math.floor(rand() * 6),
    cx: 470 + Math.floor(rand() * 60),
    offset: 36 + Math.floor(rand() * 10),
    length: 150 + Math.floor(rand() * 30),
    angleDeg: 9 + Math.floor(rand() * 4),
    startSign: rand() < 0.5 ? 1 : -1,
  }).map((bar, i) => ({ ...bar, degree: degrees[i] }));
  // Bumpers go OFF the marble path (the staircase core is x 380..620) so a
  // surprise machine always stays playable.
  const bumpers = [];
  const bumperCount = Math.floor(rand() * 4);
  for (let i = 0; i < bumperCount; i += 1) {
    const left = rand() < 0.5;
    bumpers.push({
      id: `p${i}`,
      x: Math.round(left ? 80 + rand() * 220 : 700 + rand() * 220),
      y: Math.round(160 + rand() * 700),
      radius: Math.round(14 + rand() * 14),
    });
  }
  return {
    version: 1,
    name: SURPRISE_NAMES[Math.floor(rand() * SURPRISE_NAMES.length)],
    scale,
    rootMidi: 60,
    timbre,
    gravity: 1200 + Math.floor(rand() * 500),
    bars,
    bumpers,
  };
}

// --- serialization -----------------------------------------------------------
// Compact short-key JSON, 1-decimal rounding, base64url — safe to put in a URL
// hash and safe to copy anywhere.
const round1 = (value) => Math.round(value * 10) / 10;

export function encodeMachine(machine) {
  const compact = {
    v: 1,
    n: String(machine.name || "Untitled").slice(0, 40),
    s: machine.scale,
    r: machine.rootMidi,
    t: machine.timbre,
    g: Math.round(machine.gravity),
    b: machine.bars.map((bar) => [
      bar.id,
      round1(bar.x),
      round1(bar.y),
      round1(bar.angle),
      round1(bar.length),
      clampDegree(bar.degree),
    ]),
    p: machine.bumpers.map((bumper) => [bumper.id, round1(bumper.x), round1(bumper.y), round1(bumper.radius)]),
  };
  const json = JSON.stringify(compact);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeMachine(encoded) {
  if (typeof encoded !== "string" || encoded.length === 0 || encoded.length > 20000) return null;
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const compact = JSON.parse(new TextDecoder().decode(bytes));
    if (!compact || compact.v !== 1 || !Array.isArray(compact.b)) return null;
    const machine = {
      version: 1,
      name: String(compact.n || "Untitled").slice(0, 40),
      scale: SCALES[compact.s] ? compact.s : "major",
      rootMidi: Number.isFinite(compact.r) ? compact.r : 60,
      timbre: TIMBRES[compact.t] ? compact.t : "marble",
      gravity: Number.isFinite(compact.g) ? compact.g : 1400,
      bars: compact.b.map((entry) => ({
        id: String(entry[0]),
        x: entry[1],
        y: entry[2],
        angle: entry[3],
        length: entry[4],
        degree: entry[5],
      })),
      bumpers: Array.isArray(compact.p)
        ? compact.p.map((entry) => ({ id: String(entry[0]), x: entry[1], y: entry[2], radius: entry[3] }))
        : [],
    };
    return repairMachine(machine).machine;
  } catch {
    return null;
  }
}

// Pull a machine out of a location hash like "#m=eyJ2Ijox...". Returns null
// when the hash is absent or malformed — callers fall back to autosave/default.
export function machineFromHash(hash) {
  const match = /(?:^|#|&)m=([A-Za-z0-9\-_]+)/.exec(hash || "");
  return match ? decodeMachine(match[1]) : null;
}

export function hashForMachine(machine) {
  return `#m=${encodeMachine(machine)}`;
}

// --- validation / repair -----------------------------------------------------
// A machine from a URL or localStorage is untrusted: clamp every field into
// the board, drop NaN, dedupe ids, cap counts. Returns whether anything
// changed, so the UI can note "repaired" instead of silently misbehaving.
export function repairMachine(machine) {
  let repaired = false;
  const fix = (value, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      repaired = true;
      return fallback;
    }
    return number;
  };
  const clamp = (value, [min, max], fallback) => {
    const fixed = fix(value, fallback);
    if (fixed < min || fixed > max) {
      repaired = true;
      return Math.min(max, Math.max(min, fixed));
    }
    return fixed;
  };

  const scale = SCALES[machine.scale] ? machine.scale : "major";
  if (scale !== machine.scale) repaired = true;
  const timbre = TIMBRES[machine.timbre] ? machine.timbre : "marble";
  if (timbre !== machine.timbre) repaired = true;

  const seenBarIds = new Set();
  const bars = (Array.isArray(machine.bars) ? machine.bars : [])
    .slice(0, LIMITS.bars)
    .map((bar) => {
      const id = String(bar.id || `b${seenBarIds.size}`);
      if (seenBarIds.has(id)) {
        repaired = true;
        return null;
      }
      seenBarIds.add(id);
      return {
        id,
        x: clamp(bar.x, [0, BOARD.width], BOARD.width / 2),
        y: clamp(bar.y, [0, BOARD.height], BOARD.height / 2),
        angle: clamp(bar.angle, LIMITS.angle, 0),
        length: clamp(bar.length, LIMITS.barLength, 150),
        degree: clampDegree(fix(bar.degree, 0)),
      };
    })
    .filter(Boolean);

  const seenBumperIds = new Set();
  const bumpers = (Array.isArray(machine.bumpers) ? machine.bumpers : [])
    .slice(0, LIMITS.bumpers)
    .map((bumper) => {
      const id = String(bumper.id || `p${seenBumperIds.size}`);
      if (seenBumperIds.has(id)) {
        repaired = true;
        return null;
      }
      seenBumperIds.add(id);
      return {
        id,
        x: clamp(bumper.x, [0, BOARD.width], BOARD.width / 2),
        y: clamp(bumper.y, [0, BOARD.height], BOARD.height / 2),
        radius: clamp(bumper.radius, LIMITS.bumperRadius, 20),
      };
    })
    .filter(Boolean);

  return {
    repaired,
    machine: {
      version: 1,
      name: String(machine.name || "Untitled").slice(0, 40) || "Untitled",
      scale,
      rootMidi: clamp(machine.rootMidi, [48, 84], 60),
      timbre,
      gravity: clamp(machine.gravity, LIMITS.gravity, 1400),
      bars,
      bumpers,
    },
  };
}

export function isValidMachine(machine) {
  return Boolean(
    machine &&
      machine.version === 1 &&
      SCALES[machine.scale] &&
      TIMBRES[machine.timbre] &&
      Array.isArray(machine.bars) &&
      machine.bars.every(
        (bar) =>
          Number.isFinite(bar.x) && Number.isFinite(bar.y) &&
          bar.x >= 0 && bar.x <= BOARD.width && bar.y >= 0 && bar.y <= BOARD.height &&
          bar.degree >= DEGREE_MIN && bar.degree <= DEGREE_MAX
      ) &&
      Array.isArray(machine.bumpers)
  );
}
