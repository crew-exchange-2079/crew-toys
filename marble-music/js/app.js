// Marble Music Toy — browser layer. Canvas editor + renderer + persistence,
// sharing and presets. All pitch/serialization/physics logic lives in the pure
// modules (scale.js, machine.js, physics.js) and is proven by node test.mjs.

import { DEGREE_MAX, degreeToMidi, barPitch, clampDegree } from "./scale.js";
import {
  BOARD, TIMBRES, PRESETS, LIMITS, defaultMachine, machineFromHash, hashForMachine,
  encodeMachine, isValidMachine, surpriseMachine, cloneMachine,
} from "./machine.js";
import { createWorld, spawnMarble, step, drainEvents, MARBLE_RADIUS, BAR_RADIUS } from "./physics.js";
import { ensureAudio, setVolume, setMuted, playBar, playBumper } from "./audio.js";

const STORAGE_MACHINE = "mmtoy:machine";
const STORAGE_SETTINGS = "mmtoy:settings";

const byId = (id) => document.getElementById(id);
const canvas = byId("canvas");
const ctx = canvas.getContext("2d");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduce = motionQuery.matches;

// --- state -------------------------------------------------------------------
let machine = loadInitialMachine();
let world = createWorld(machine);
let selected = null; // { kind: "bar" | "bumper", id }
let mode = "play"; // or "drop"
let auto = { on: false, nextAt: 0, phase: 0 };
let settings = loadSettings();
let flashes = [];
let particles = [];
let trails = new Map();
let errors = [];
let lastEvent = null;

function loadInitialMachine() {
  const fromHash = machineFromHash(window.location.hash);
  if (fromHash && isValidMachine(fromHash)) return fromHash;
  try {
    const saved = window.localStorage.getItem(STORAGE_MACHINE);
    if (saved) {
      const decoded = decodeMachine(saved);
      if (decoded && isValidMachine(decoded)) return decoded;
    }
  } catch { /* storage unavailable — fall through to the default tune */ }
  return defaultMachine();
}

function loadSettings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_SETTINGS) || "{}");
    return { volume: typeof saved.volume === "number" ? saved.volume : 0.24, muted: Boolean(saved.muted) };
  } catch {
    return { volume: 0.24, muted: false };
  }
}

let saveTimer = 0;
function saveMachine() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_MACHINE, encodeMachine(machine));
    } catch { /* private mode etc. — the toy still works, just doesn't persist */ }
  }, 250);
}

function saveSettings() {
  try {
    window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
  } catch { /* ignore */ }
}

// --- machine editing ---------------------------------------------------------
function syncWorldBars() {
  // Mirror the edited machine into the physics world (by id when possible).
  const byId = new Map(world.bars.map((bar) => [bar.id, bar]));
  for (const bar of machine.bars) {
    const target = byId.get(bar.id);
    if (target) Object.assign(target, { x: bar.x, y: bar.y, angle: bar.angle, length: bar.length, degree: bar.degree });
  }
}

function replaceMachine(next) {
  machine = next;
  selected = null;
  flashes = [];
  particles = [];
  trails = new Map();
  world = createWorld(machine);
  syncWorldBars();
  auto.nextAt = 0;
  saveMachine();
  renderSheet();
  updateNameField();
}

function loadPreset(preset) {
  replaceMachine(cloneMachine({ ...preset, version: 1 }));
}

function addBar() {
  const degree = Math.floor(Math.random() * 8);
  machine.bars.push({
    id: `b${Date.now().toString(36)}`,
    x: 380 + Math.random() * 240,
    y: 110 + Math.random() * 80,
    angle: (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8),
    length: 150,
    degree,
  });
  syncWorldBars();
  saveMachine();
}

function addBumper() {
  machine.bumpers.push({
    id: `p${Date.now().toString(36)}`,
    x: 120 + Math.random() * 760,
    y: 120 + Math.random() * 500,
    radius: 16 + Math.random() * 10,
  });
  syncWorldBars();
  saveMachine();
}

function deleteSelected() {
  if (!selected) return;
  if (selected.kind === "bar") machine.bars = machine.bars.filter((bar) => bar.id !== selected.id);
  else machine.bumpers = machine.bumpers.filter((bumper) => bumper.id !== selected.id);
  selected = null;
  syncWorldBars();
  saveMachine();
  renderSheet();
}

function clearMarbles() {
  world.marbles = [];
  trails = new Map();
}

// --- canvas geometry ---------------------------------------------------------
let view = { scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0 };

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  view.width = rect.width;
  view.height = rect.height;
  const scale = Math.min(rect.width / BOARD.width, rect.height / BOARD.height);
  view.scale = scale;
  view.offsetX = (rect.width - BOARD.width * scale) / 2;
  view.offsetY = (rect.height - BOARD.height * scale) / 2;
}

function toDesign(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left - view.offsetX) / view.scale,
    y: (clientY - rect.top - view.offsetY) / view.scale,
  };
}

// --- hit testing ---------------------------------------------------------------
function barDistance(bar, px, py) {
  const rad = (bar.angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const half = bar.length / 2;
  const relX = px - bar.x;
  const relY = py - bar.y;
  const along = Math.max(-half, Math.min(half, relX * dx + relY * dy));
  const cx = bar.x + dx * along;
  const cy = bar.y + dy * along;
  return { dist: Math.hypot(px - cx, py - cy), along, cx, cy, dx, dy, adx: Math.abs(relX), ady: Math.abs(relY) };
}

function hitTest(px, py) {
  for (let i = machine.bumpers.length - 1; i >= 0; i -= 1) {
    const bumper = machine.bumpers[i];
    if (Math.hypot(px - bumper.x, py - bumper.y) < bumper.radius + 14) return { kind: "bumper", id: bumper.id };
  }
  let best = null;
  for (const bar of machine.bars) {
    const hit = barDistance(bar, px, py);
    if (hit.dist < MARBLE_RADIUS + BAR_RADIUS + 8 && (!best || hit.dist < best.dist)) best = { kind: "bar", id: bar.id, ...hit };
  }
  return best;
}

// --- pointer editing -----------------------------------------------------------
let pointer = null;

canvas.addEventListener("pointerdown", (event) => {
  ensureAudio();
  canvas.setPointerCapture(event.pointerId);
  const { x, y } = toDesign(event.clientX, event.clientY);
  const hit = hitTest(x, y);
  if (mode === "drop" && y < 130 && !hit) {
    spawnMarble(world, Math.max(20, Math.min(BOARD.width - 20, x)), 30);
    pointer = { kind: "drop" };
    return;
  }
  if (!hit) {
    if (selected) { selected = null; renderSheet(); }
    pointer = { kind: "maybe-select", startX: x, startY: y, moved: false, hit: null };
    return;
  }
  selected = { kind: hit.kind, id: hit.id };
  renderSheet();
  const bar = hit.kind === "bar" ? machine.bars.find((entry) => entry.id === hit.id) : null;
  const nearCap = bar && Math.abs(hit.along) > bar.length / 2 - 26;
  pointer = {
    kind: nearCap ? "rotate" : "move",
    id: hit.id,
    hitKind: hit.kind,
    grabDX: bar ? x - bar.x : 0,
    grabDY: bar ? y - bar.y : 0,
    startX: x,
    startY: y,
    moved: false,
  };
  canvas.style.cursor = nearCap ? "grab" : "move";
});

canvas.addEventListener("pointermove", (event) => {
  const { x, y } = toDesign(event.clientX, event.clientY);
  if (mode === "drop") pointerDropX = Math.max(20, Math.min(BOARD.width - 20, x));
  if (!pointer) {
    const hit = hitTest(x, y);
    canvas.style.cursor = hit ? "pointer" : "default";
    return;
  }
  if (pointer.kind === "maybe-select") {
    if (Math.hypot(x - pointer.startX, y - pointer.startY) > 6) pointer.moved = true;
    return;
  }
  if (pointer.kind === "drop") return;
  const isBar = pointer.hitKind === "bar";
  const item = isBar ? machine.bars.find((bar) => bar.id === pointer.id) : machine.bumpers.find((b) => b.id === pointer.id);
  if (!item) return;
  if (Math.hypot(x - pointer.startX, y - pointer.startY) > 5) pointer.moved = true;
  if (pointer.kind === "move") {
    item.x = Math.max(40, Math.min(BOARD.width - 40, x - pointer.grabDX));
    item.y = Math.max(70, Math.min(BOARD.height - 30, y - pointer.grabDY));
  } else if (pointer.kind === "rotate" && isBar) {
    const degrees = (Math.atan2(y - item.y, x - item.x) * 180) / Math.PI;
    const snapped = Math.round(degrees / 5) * 5;
    item.angle = Math.max(LIMITS.angle[1] * -1, Math.min(LIMITS.angle[1], snapped));
  }
  syncWorldBars();
});

function endPointer() {
  if (pointer && (pointer.kind === "move" || pointer.kind === "rotate")) saveMachine();
  pointer = null;
  canvas.style.cursor = "default";
}
canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

let pointerDropX = 500;

// --- audio + events --------------------------------------------------------------
function handleEvents() {
  for (const event of drainEvents(world)) {
    lastEvent = event;
    if (event.kind === "bar") {
      const midi = degreeToMidi(machine.rootMidi, machine.scale, event.degree);
      playBar(midi, event.velocity, TIMBRES[machine.timbre]);
      flashes.push({ x: event.x, y: event.y, t0: performance.now(), color: degreeColor(event.degree), label: barPitch(machine.rootMidi, machine.scale, event.degree).name });
    } else {
      playBumper(event.velocity, bumperById(event.id)?.radius || 20);
      flashes.push({ x: event.x, y: event.y, t0: performance.now(), color: "#d7a6ff", label: "tink" });
    }
    if (!reduce) spawnSparks(event.x, event.y, degreeColor(event.degree));
  }
}

function bumperById(id) {
  return machine.bumpers.find((bumper) => bumper.id === id);
}

function spawnSparks(x, y, color) {
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 160;
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60, t0: performance.now(), color });
  }
}

// --- colors ---------------------------------------------------------------------
function degreeColor(degree) {
  return `hsl(${((degree * 47 + 168) % 360).toFixed(0)}, 72%, 64%)`;
}

// --- drawing ---------------------------------------------------------------------
function draw(now) {
  const { width, height } = view;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(view.scale, view.scale);

  // Board.
  ctx.fillStyle = "#0e1729";
  ctx.fillRect(0, 0, BOARD.width, BOARD.height);
  ctx.strokeStyle = "#1b2c48";
  ctx.lineWidth = 1;
  for (let x = 50; x < BOARD.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, BOARD.height);
    ctx.stroke();
  }
  for (let y = 50; y < BOARD.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(BOARD.width, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#2c3c5b";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, BOARD.width - 3, BOARD.height - 3);

  // Drop guide.
  if (mode === "drop") {
    ctx.strokeStyle = "#f5b86b88";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(pointerDropX, 24);
    ctx.lineTo(pointerDropX, 130);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f5b86b";
    ctx.beginPath();
    ctx.moveTo(pointerDropX - 8, 24);
    ctx.lineTo(pointerDropX + 8, 24);
    ctx.lineTo(pointerDropX, 36);
    ctx.closePath();
    ctx.fill();
  }

  // Bars.
  for (const bar of machine.bars) {
    const rad = (bar.angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    const half = bar.length / 2;
    const isSelected = selected?.kind === "bar" && selected.id === bar.id;
    ctx.strokeStyle = degreeColor(bar.degree);
    ctx.lineWidth = BAR_RADIUS * 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bar.x - dx * half, bar.y - dy * half);
    ctx.lineTo(bar.x + dx * half, bar.y + dy * half);
    ctx.stroke();
    if (isSelected) {
      ctx.strokeStyle = "#f5b86b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bar.x - dx * (half + 8), bar.y - dy * (half + 8));
      ctx.lineTo(bar.x + dx * (half + 8), bar.y + dy * (half + 8));
      ctx.stroke();
      // Rotate handles on both end caps.
      ctx.fillStyle = "#f5b86b";
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(bar.x + dx * (half + 8) * sign, bar.y + dy * (half + 8) * sign, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const pitch = barPitch(machine.rootMidi, machine.scale, bar.degree);
    ctx.fillStyle = "#eef4ffcc";
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pitch.name, bar.x, bar.y - 16);
  }

  // Bumpers.
  for (const bumper of machine.bumpers) {
    const isSelected = selected?.kind === "bumper" && selected.id === bumper.id;
    const gradient = ctx.createRadialGradient(bumper.x - bumper.radius * 0.3, bumper.y - bumper.radius * 0.3, 2, bumper.x, bumper.y, bumper.radius);
    gradient.addColorStop(0, "#e9fff7");
    gradient.addColorStop(1, "#3fae8d");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isSelected ? "#f5b86b" : "#74e0c166";
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.beginPath();
    ctx.arc(bumper.x, bumper.y, bumper.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Marble trails.
  if (!reduce) {
    ctx.lineCap = "round";
    for (const marble of world.marbles) {
      const trail = trails.get(marble.id) || [];
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i += 1) {
          ctx.strokeStyle = `rgba(245, 184, 107, ${(i / trail.length) * 0.4})`;
          ctx.lineWidth = 4 * (i / trail.length);
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
        }
      }
    }
  }

  // Marbles.
  for (const marble of world.marbles) {
    const gradient = ctx.createRadialGradient(marble.x - 4, marble.y - 5, 1, marble.x, marble.y, marble.r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.6, "#ffe9c4");
    gradient.addColorStop(1, "#f5b86b");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, marble.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hit flashes.
  flashes = flashes.filter((flash) => now - flash.t0 < 650);
  for (const flash of flashes) {
    const t = (now - flash.t0) / 650;
    ctx.strokeStyle = flash.color;
    ctx.globalAlpha = 1 - t;
    ctx.lineWidth = 3 * (1 - t) + 1;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, 12 + t * 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = (1 - t) * 0.9;
    ctx.fillStyle = flash.color;
    ctx.font = "700 17px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(flash.label, flash.x, flash.y - 26 - t * 22);
    ctx.globalAlpha = 1;
  }

  // Particles.
  if (!reduce) {
    particles = particles.filter((particle) => now - particle.t0 < 500);
    for (const particle of particles) {
      const age = (now - particle.t0) / 1000;
      particle.x += particle.vx / 60;
      particle.y += particle.vy / 60;
      particle.vy += 600 / 60;
      ctx.globalAlpha = 1 - age / 0.5;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 1.5, particle.y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// --- main loop ---------------------------------------------------------------------
let lastFrame = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (auto.on) {
    auto.phase += dt * 0.9;
    if (now >= auto.nextAt) {
      auto.nextAt = now + 2400;
      const first = machine.bars[0];
      const sweep = first ? first.x + Math.sin(auto.phase) * 110 : 500;
      spawnMarble(world, Math.max(30, Math.min(BOARD.width - 30, sweep)), 30);
    }
  }
  step(world, dt);
  handleEvents();
  for (const marble of world.marbles) {
    const trail = trails.get(marble.id) || [];
    trail.push({ x: marble.x, y: marble.y });
    if (trail.length > 14) trail.shift();
    trails.set(marble.id, trail);
  }
  for (const id of [...trails.keys()]) {
    if (!world.marbles.some((marble) => marble.id === id)) trails.delete(id);
  }
  draw(now);
  requestAnimationFrame(loop);
}

// --- selection sheet ---------------------------------------------------------------
function renderSheet() {
  const sheet = byId("sheet");
  if (!selected) {
    sheet.classList.remove("open");
    sheet.innerHTML = "";
    return;
  }
  if (selected.kind === "bar") {
    const bar = machine.bars.find((entry) => entry.id === selected.id);
    if (!bar) { selected = null; sheet.classList.remove("open"); return; }
    const pitch = barPitch(machine.rootMidi, machine.scale, bar.degree);
    sheet.innerHTML = `
      <div class="sheet-row sheet-note" style="color:${degreeColor(bar.degree)}">
        <button data-act="deg-down" aria-label="lower note">−</button>
        <div class="sheet-note-name">${pitch.name}<small>${pitch.frequency.toFixed(1)} Hz</small></div>
        <button data-act="deg-up" aria-label="raise note">+</button>
      </div>
      <div class="sheet-row">
        <label>Tune <output>${bar.degree}</output> / ${DEGREE_MAX}</label>
        <label>Angle <output>${bar.angle.toFixed(0)}°</output></button data-act="angle-down">−</button><button data-act="angle-up">+</button></label>
        <label>Length <output>${bar.length.toFixed(0)}</output><button data-act="len-down">−</button><button data-act="len-up">+</button></label>
      </div>
      <div class="sheet-row">
        <button data-act="flip" class="wide">Flip</button>
        <button data-act="delete" class="wide danger">Delete</button>
      </div>`;
  } else {
    const bumper = machine.bumpers.find((entry) => entry.id === selected.id);
    if (!bumper) { selected = null; sheet.classList.remove("open"); return; }
    sheet.innerHTML = `
      <div class="sheet-row">
        <label>Bumper <output>${bumper.radius.toFixed(0)}</output></label>
        <button data-act="rad-down">−</button><button data-act="rad-up">+</button>
      </div>
      <div class="sheet-row">
        <button data-act="delete" class="wide danger">Delete</button>
      </div>`;
  }
  sheet.classList.add("open");
}

byId("sheet").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-act]");
  if (!button || !selected) return;
  const act = button.dataset.act;
  const isBar = selected.kind === "bar";
  const item = isBar ? machine.bars.find((bar) => bar.id === selected.id) : machine.bumpers.find((b) => b.id === selected.id);
  if (!item) return;
  if (act === "deg-up" || act === "deg-down") item.degree = clampDegree(item.degree + (act === "deg-up" ? 1 : -1));
  else if (act === "angle-up" || act === "angle-down") item.angle = Math.max(LIMITS.angle[1] * -1, Math.min(LIMITS.angle[1], item.angle + (act === "angle-up" ? 5 : -5)));
  else if (act === "len-up" || act === "len-down") item.length = Math.max(LIMITS.barLength[0], Math.min(LIMITS.barLength[1], item.length + (act === "len-up" ? 12 : -12)));
  else if (act === "rad-up" || act === "rad-down") item.radius = Math.max(LIMITS.bumperRadius[0], Math.min(LIMITS.bumperRadius[1], item.radius + (act === "rad-up" ? 3 : -3)));
  else if (act === "flip") item.angle = -item.angle;
  else if (act === "delete") { deleteSelected(); return; }
  syncWorldBars();
  saveMachine();
  renderSheet();
});

// --- toolbar / header wiring -------------------------------------------------------------
function wire(id, fn) {
  byId(id).addEventListener("click", () => { ensureAudio(); fn(); });
}

wire("add-bar", addBar);
wire("add-bumper", addBumper);
wire("clear", clearMarbles);
wire("mode-drop", () => {
  mode = mode === "drop" ? "play" : "drop";
  byId("mode-drop").setAttribute("aria-pressed", String(mode === "drop"));
  byId("mode-drop").textContent = mode === "drop" ? "Drop: on" : "Drop";
});
wire("auto", () => {
  auto.on = !auto.on;
  auto.nextAt = 0;
  byId("auto").setAttribute("aria-pressed", String(auto.on));
  byId("auto").textContent = auto.on ? "Auto: on" : "Auto";
});

function updateNameField() {
  byId("machine-name").value = machine.name;
}
byId("machine-name").addEventListener("change", (event) => {
  machine.name = event.target.value.slice(0, 40) || "Untitled";
  saveMachine();
});

byId("scale").addEventListener("change", (event) => {
  machine.scale = event.target.value;
  saveMachine();
});

// Two-tap arm pattern: the first tap on a destructive generator arms it, the
// second tap within 4 s confirms. No dialogs, no accidental wipes.
let armed = null;
function armOrRun(label, run) {
  if (armed && armed.label === label) {
    armed = null;
    run();
    return;
  }
  armed = { label, at: Date.now() };
  byId("toast").textContent = `${label} — tap again to replace your machine`;
  byId("toast").classList.add("show");
  window.setTimeout(() => {
    if (armed && armed.label === label) {
      armed = null;
      byId("toast").classList.remove("show");
    }
  }, 4000);
}

wire("presets-open", () => {
  const list = byId("preset-list");
  list.innerHTML = PRESETS.map((preset) => {
    const tune = preset.bars.map((bar) => barPitch(60, "major", bar.degree).name.slice(0, 2)).join(" ");
    return `<li><button data-preset="${preset.id}"><strong>${preset.name}</strong><span>${preset.bars.length} bars · ${tune}</span></button></li>`;
  }).join("");
  byId("presets").classList.add("open");
});
byId("preset-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-preset]");
  if (!button) return;
  const preset = PRESETS.find((entry) => entry.id === button.dataset.preset);
  if (!preset) return;
  byId("presets").classList.remove("open");
  armOrRun(preset.name, () => loadPreset(preset));
});
byId("presets-close").addEventListener("click", () => byId("presets").classList.remove("open"));

wire("surprise", () => armOrRun("Surprise", () => replaceMachine(surpriseMachine())));

wire("share", async () => {
  const url = `${window.location.origin}${window.location.pathname}${hashForMachine(machine)}`;
  try {
    await navigator.clipboard.writeText(url);
    byId("toast").textContent = "Link copied — send it to a friend";
  } catch {
    window.prompt("Copy your machine link:", url);
  }
  byId("toast").classList.add("show");
  window.setTimeout(() => byId("toast").classList.remove("show"), 2500);
});

wire("mute", () => {
  settings.muted = !settings.muted;
  setMuted(settings.muted);
  byId("mute").textContent = settings.muted ? "Unmute" : "Mute";
  byId("mute").setAttribute("aria-pressed", String(settings.muted));
  saveSettings();
});
byId("volume").addEventListener("input", (event) => {
  settings.volume = Number(event.target.value);
  setVolume(settings.volume);
  byId("volume-value").textContent = settings.volume.toFixed(2);
  saveSettings();
});

// --- keyboard ---------------------------------------------------------------------------
window.addEventListener("keydown", (event) => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
  if (event.code === "Space") {
    event.preventDefault();
    ensureAudio();
    const first = machine.bars[0];
    spawnMarble(world, first ? first.x : 500, 30);
  } else if (event.key === "a" || event.key === "A") {
    byId("auto").click();
  } else if (event.key === "m" || event.key === "M") {
    byId("mute").click();
  } else if (event.key === "Escape") {
    selected = null;
    renderSheet();
    byId("presets").classList.remove("open");
  }
});

motionQuery.addEventListener?.("change", (event) => {
  reduce = event.matches;
  if (reduce) {
    particles = [];
    trails = new Map();
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("error", (event) => errors.push(String(event.message)));

// --- boot --------------------------------------------------------------------------------
function syncHeader() {
  byId("scale").value = machine.scale;
  byId("mute").textContent = settings.muted ? "Unmute" : "Mute";
  byId("mute").setAttribute("aria-pressed", String(settings.muted));
  byId("volume").value = String(settings.volume);
  byId("volume-value").textContent = settings.volume.toFixed(2);
  updateNameField();
}

resizeCanvas();
syncHeader();
setVolume(settings.volume);
setMuted(settings.muted);
renderSheet();
requestAnimationFrame(loop);

// Test seam (the source instrument exposed window.__mm; this is the toy's).
window.__mmtoy = {
  get marbleCount() { return world.marbles.length; },
  get barCount() { return machine.bars.length; },
  get lastEvent() { return lastEvent; },
  get errors() { return errors.slice(); },
  dropAt(x) { spawnMarble(world, x, 30); },
  loadMachine(next) { replaceMachine(next); },
  getMachine() { return cloneMachine(machine); },
};
