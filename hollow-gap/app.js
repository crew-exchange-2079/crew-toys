'use strict';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const WIDTH = 320;
const HEIGHT = 180;
const palette = {
  ink: '#f3f0ff',
  night: '#050713',
  blue: '#101b3d',
  cyan: '#65e4e1',
  pink: '#ff6fae',
  amber: '#ffd166',
  violet: '#9b8cff',
  green: '#80e6a4',
  red: '#ff7777',
  muted: '#8587ab'
};
const params = new URLSearchParams(window.location.search);
const input = { left: false, right: false, up: false, down: false, actionPressed: false, jumpPressed: false };
const dom = {
  scene: document.getElementById('sceneLabel'),
  gamepad: document.getElementById('gamepadStatus'),
  status: document.getElementById('statusText'),
  score: document.getElementById('scoreText'),
  sound: document.getElementById('soundToggle'),
  crt: document.getElementById('crtToggle'),
  pause: document.getElementById('pauseButton'),
  modal: document.getElementById('scoreModal'),
  modalTitle: document.getElementById('scoreTitle'),
  modalMessage: document.getElementById('scoreMessage'),
  initials: document.getElementById('initials'),
  scoreForm: document.getElementById('scoreForm')
};
const scoreKey = 'hollow-gap-arcade-scores-v1';
let scores = loadScores();
let audio = null;
let scene = 'attract';
let currentGame = null;
let currentState = null;
let attractIndex = 0;
let attractTime = 0;
let lastFrame = performance.now();
let paused = false;
let testRunning = false;
let testMode = false;
let captureMode = false;
let perfMode = false;
let soundEnabled = false;
let crtEnabled = false;
let pendingScore = null;
let frameSamples = [];
let perfStarted = 0;
let perfResult = null;
let highScoreTimer = 0;

function loadScores() {
  try {
    const value = JSON.parse(localStorage.getItem(scoreKey) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch (error) {
    return {};
  }
}

function saveScores() {
  try { localStorage.setItem(scoreKey, JSON.stringify(scores)); } catch (error) { return; }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function seeded(seed) {
  let value = seed >>> 0;
  return function () { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}
function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}
function formatScore(value) { return String(Math.max(0, Math.floor(value))).padStart(6, '0'); }
function rect(x, y, width, height, color) { context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height)); }
function text(value, x, y, color = palette.ink, size = 8, align = 'left') {
  context.fillStyle = color;
  context.font = `${size}px "Courier New", monospace`;
  context.textAlign = align;
  context.textBaseline = 'top';
  context.fillText(String(value), Math.round(x), Math.round(y));
}
function center(value, y, color = palette.ink, size = 8) { text(value, WIDTH / 2, y, color, size, 'center'); }
function line(x1, y1, x2, y2, color, width = 1) { context.strokeStyle = color; context.lineWidth = width; context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke(); }
function circle(x, y, radius, color, fill = true) { context.fillStyle = color; context.strokeStyle = color; context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); fill ? context.fill() : context.stroke(); }
function pixelText(value, x, y, color, size = 8, align = 'left') { text(value.toUpperCase(), x, y, color, size, align); }
function clear() { context.clearRect(0, 0, WIDTH, HEIGHT); }
function setStatus(message) { dom.status.textContent = message; }
function bestScore(game) { return Number(scores[game] && scores[game].score) || 0; }
function updateScoreDisplay() { dom.score.textContent = 'HIGH ' + formatScore(bestScore(currentGame || 'diner')); }
function updateSceneLabel() {
  const labels = { attract: 'ATTRACT MODE', diner: 'NIGHT SHIFT AT THE DINER', tower: 'TOWER CLIMB', static: 'STATIC', capture: 'CAPTURE MODE' };
  dom.scene.textContent = scene === 'game' ? (labels[currentGame] || 'GAME') : (labels[scene] || 'ATTRACT MODE');
}
function setInput(code, down) {
  if (['ArrowLeft', 'KeyA'].includes(code)) input.left = down;
  if (['ArrowRight', 'KeyD'].includes(code)) input.right = down;
  if (['ArrowUp', 'KeyW'].includes(code)) input.up = down;
  if (['ArrowDown', 'KeyS'].includes(code)) input.down = down;
  if (down && ['Space', 'KeyZ', 'Enter'].includes(code)) input.actionPressed = true;
  if (down && ['ArrowUp', 'KeyW', 'Space'].includes(code)) input.jumpPressed = true;
}
function clearEdges() { input.actionPressed = false; input.jumpPressed = false; }
function ensureAudio() {
  if (!audio) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { setStatus('Audio is unavailable; the cabinet remains playable.'); return; }
    const audioContext = new AudioContextClass();
    const master = audioContext.createGain();
    master.gain.value = 0;
    master.connect(audioContext.destination);
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = (Math.random() * 2 - 1) * .2;
    const staticGain = audioContext.createGain();
    staticGain.gain.value = 0;
    const staticFilter = audioContext.createBiquadFilter();
    staticFilter.type = 'bandpass';
    staticFilter.frequency.value = 1600;
    const staticSource = audioContext.createBufferSource();
    staticSource.buffer = noiseBuffer;
    staticSource.loop = true;
    staticSource.connect(staticFilter).connect(staticGain).connect(master);
    staticSource.start();
    audio = { context: audioContext, master, staticGain, timer: null, step: 0 };
    startMusic();
  }
  if (audio.context.state === 'suspended') audio.context.resume();
  audio.master.gain.cancelScheduledValues(audio.context.currentTime);
  audio.master.gain.setTargetAtTime(soundEnabled ? .18 : 0, audio.context.currentTime, .08);
}
function startMusic() {
  if (!audio || audio.timer) return;
  const notes = [220, 247, 330, 247, 196, 220, 294, 247, 165, 196, 247, 220];
  const tick = () => {
    if (!audio) return;
    const note = notes[audio.step % notes.length];
    tone(note, .12, 'square', .035);
    if (audio.step % 4 === 0) tone(note / 2, .2, 'triangle', .025);
    audio.step += 1;
  };
  tick();
  audio.timer = window.setInterval(tick, 180);
}
function tone(frequency, duration, type = 'square', volume = .04) {
  if (!audio || !soundEnabled) return;
  const oscillator = audio.context.createOscillator();
  const gain = audio.context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audio.context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audio.context.currentTime + duration);
  oscillator.connect(gain).connect(audio.master);
  oscillator.start();
  oscillator.stop(audio.context.currentTime + duration);
}
function sfx(name) {
  if (name === 'serve') { tone(523, .08, 'square', .06); tone(784, .12, 'square', .04); }
  if (name === 'miss') tone(110, .16, 'sawtooth', .045);
  if (name === 'jump') tone(330, .08, 'square', .04);
  if (name === 'catch') { tone(440, .08, 'square', .05); tone(660, .12, 'square', .04); }
  if (name === 'complete') { [262, 330, 392, 523].forEach((note, index) => window.setTimeout(() => tone(note, .16, 'square', .05), index * 100)); }
}
function updateStaticAudio(signal) {
  if (!audio) return;
  audio.staticGain.gain.setTargetAtTime(soundEnabled && scene === 'static' ? signal * .045 : 0, audio.context.currentTime, .08);
}
function pollGamepad() {
  if (!navigator.getGamepads) return;
  const pads = navigator.getGamepads();
  let pad = null;
  for (const candidate of pads) if (candidate && candidate.connected) { pad = candidate; break; }
  if (!pad) { dom.gamepad.textContent = 'INPUT: KEYBOARD'; return; }
  dom.gamepad.textContent = 'INPUT: GAMEPAD';
  const axis = pad.axes[0] || 0;
  input.left = input.left || axis < -.35 || Boolean(pad.buttons[14] && pad.buttons[14].pressed);
  input.right = input.right || axis > .35 || Boolean(pad.buttons[15] && pad.buttons[15].pressed);
  input.up = input.up || Boolean(pad.buttons[12] && pad.buttons[12].pressed);
  input.down = input.down || Boolean(pad.buttons[13] && pad.buttons[13].pressed);
  if (pad.buttons[0] && pad.buttons[0].pressed) input.actionPressed = true;
  if (pad.buttons[1] && pad.buttons[1].pressed) input.jumpPressed = true;
}

function newDiner() {
  const random = seeded(2017);
  return { elapsed: 0, score: 0, combo: 0, served: 0, serverX: 32, customers: [], nextSpawn: 0, boss: null, phase: 'open', random, messages: 0 };
}
function spawnCustomer(state) {
  const seats = [42, 88, 134, 180, 226, 272];
  const used = new Set(state.customers.filter(customer => customer.state === 'waiting').map(customer => customer.seat));
  const available = seats.filter(seat => !used.has(seat));
  if (!available.length) return;
  const seat = available[Math.floor(state.random() * available.length)];
  const order = Math.floor(state.random() * 3);
  state.customers.push({ seat, x: seat, order, patience: 11 + state.random() * 8, maxPatience: 19, state: 'waiting', age: 0 });
}
function dinerSignal(state) {
  return state.boss ? clamp(1 - state.boss.remaining / 5, 0, 1) : clamp(state.elapsed / 300, 0, 1);
}
function updateDiner(dt) {
  const state = currentState;
  if (!state || state.phase === 'complete') return;
  state.elapsed += dt;
  state.serverX += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 68 * dt;
  state.serverX = clamp(state.serverX, 18, 302);
  if (state.elapsed >= state.nextSpawn) {
    spawnCustomer(state);
    state.nextSpawn = state.elapsed + Math.max(.85, 2.1 - state.elapsed / 220);
  }
  if (state.elapsed >= 180 && !state.boss) {
    state.boss = { x: 160, remaining: 5, patience: 18, maxPatience: 18 };
    setStatus('3:00 AM. The boss has entered the diner.');
    sfx('miss');
  }
  for (const customer of state.customers) {
    customer.age += dt;
    customer.patience -= dt;
    if (customer.patience <= 0 && customer.state === 'waiting') { customer.state = 'angry'; state.combo = 0; state.score = Math.max(0, state.score - 25); sfx('miss'); }
  }
  state.customers = state.customers.filter(customer => customer.state !== 'angry' || customer.age < 2.8);
  if (input.actionPressed) serveDiner(state);
  if (state.elapsed >= 300) completeGame('diner');
}
function serveDiner(state) {
  if (state.boss) {
    if (Math.abs(state.serverX - state.boss.x) < 24) {
      state.boss.remaining -= 1;
      state.score += 350;
      state.combo += 1;
      sfx('serve');
      setStatus('Boss order served. Keep the line moving.');
      if (state.boss.remaining <= 0) { state.boss = null; setStatus('The boss left a generous tip.'); }
    } else { state.combo = 0; state.score = Math.max(0, state.score - 10); sfx('miss'); }
    return;
  }
  const target = state.customers.filter(customer => customer.state === 'waiting').sort((a, b) => Math.abs(a.x - state.serverX) - Math.abs(b.x - state.serverX))[0];
  if (!target || Math.abs(target.x - state.serverX) > 18) { state.combo = 0; state.score = Math.max(0, state.score - 8); sfx('miss'); return; }
  target.state = 'served';
  state.served += 1;
  state.combo += 1;
  state.score += 120 + Math.round(target.patience * 4) + state.combo * 20;
  sfx('serve');
  setStatus('Order served. The room stays warm.');
}
function drawOrder(order, x, y) {
  if (order === 0) { rect(x - 4, y - 4, 8, 7, palette.amber); rect(x - 2, y, 4, 3, palette.night); line(x - 5, y - 6, x + 5, y - 6, palette.amber); }
  if (order === 1) { rect(x - 5, y - 3, 10, 5, palette.pink); line(x - 3, y + 2, x + 3, y + 2, palette.night); circle(x, y - 1, 1, palette.amber); }
  if (order === 2) { circle(x, y, 5, palette.cyan, false); line(x - 3, y, x + 3, y, palette.cyan); line(x, y - 3, x, y + 3, palette.cyan); }
}
function drawCustomer(customer, y = 84) {
  const body = customer.state === 'angry' ? palette.red : customer.order === 1 ? palette.pink : customer.order === 2 ? palette.cyan : palette.violet;
  rect(customer.x - 8, y, 16, 18, body);
  rect(customer.x - 5, y - 8, 10, 9, '#e5b39a');
  rect(customer.x - 5, y - 6, 10, 3, customer.state === 'angry' ? palette.red : palette.ink);
  rect(customer.x - 2, y - 1, 1, 1, palette.night);
  rect(customer.x + 2, y - 1, 1, 1, palette.night);
  drawOrder(customer.order, customer.x, y - 18);
  rect(customer.x - 8, y + 21, 16, 3, palette.night);
  rect(customer.x - 8, y + 21, 16 * clamp(customer.patience / customer.maxPatience, 0, 1), 3, customer.patience < 5 ? palette.red : palette.green);
}
function drawDiner() {
  const state = currentState;
  rect(0, 0, WIDTH, HEIGHT, palette.night);
  rect(0, 24, WIDTH, 100, '#152443');
  rect(0, 112, WIDTH, 68, '#37283d');
  rect(12, 40, 94, 45, '#0c1a37');
  rect(16, 44, 86, 37, '#233d68');
  for (let i = 0; i < 7; i += 1) line(20 + i * 12, 45, 20 + i * 12, 80, '#5475a0');
  rect(12, 37, 94, 4, palette.amber);
  rect(208, 36, 92, 50, '#101a37');
  rect(214, 42, 80, 38, '#1b3158');
  text('OPEN', 220, 57, palette.amber, 12);
  text('ALL NIGHT', 218, 70, palette.cyan, 7);
  rect(0, 101, WIDTH, 12, '#e1b55e');
  rect(0, 108, WIDTH, 4, '#7a4a3b');
  for (let i = 0; i < 8; i += 1) rect(13 + i * 41, 82, 28, 18, i % 2 ? '#6a4260' : '#8a5165');
  if (state.boss) {
    rect(142, 53, 36, 48, '#9c315f');
    rect(150, 42, 20, 14, '#e5b39a');
    rect(152, 47, 16, 3, palette.red);
    text('BOSS', 160, 31, palette.red, 8, 'center');
    text('ORDERS ' + state.boss.remaining, 160, 108, palette.night, 7, 'center');
  }
  for (const customer of state.customers) if (customer.state === 'waiting') drawCustomer(customer);
  rect(state.serverX - 8, 91, 16, 18, palette.cyan);
  rect(state.serverX - 5, 84, 10, 8, '#e5b39a');
  rect(state.serverX - 5, 88, 10, 3, palette.ink);
  rect(state.serverX - 10, 91, 20, 3, palette.pink);
  drawGameChrome('NIGHT SHIFT', state.score, state.elapsed, 300, dinerSignal(state));
}

function newTower() {
  const random = seeded(404);
  const platforms = [];
  let previousCenter = 61;
  for (let index = 0; index < 16; index += 1) {
    const y = 160 - index * 9.5;
    const width = index === 0 ? 78 : 30 + random() * 24;
    const desiredCenter = previousCenter + (random() - .5) * 72;
    const x = index === 0 ? 22 : clamp(desiredCenter - width / 2, 14, WIDTH - width - 14);
    platforms.push({ x, y, width, height: 5, beacon: index === 15 });
    previousCenter = x + width / 2;
  }
  return { elapsed: 0, score: 0, platforms, player: { x: 61, y: 160, vy: 0, grounded: true, platform: 0 }, wind: 0, gustTimer: 2, camera: 0, falls: 0, phase: 'climb' };
}
function updateTower(dt) {
  const state = currentState;
  if (!state || state.phase === 'complete') return;
  state.elapsed += dt;
  state.gustTimer -= dt;
  if (state.gustTimer <= 0) { state.wind = (Math.random() - .5) * 1.7; state.gustTimer = 2.5 + Math.random() * 2; }
  state.wind *= .96;
  const player = state.player;
  if (input.jumpPressed && player.grounded) { player.vy = -4.6; player.grounded = false; sfx('jump'); }
  player.vy += .18 * dt * 60;
  player.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 1.65 * dt * 60 + state.wind * dt * 60;
  player.x = clamp(player.x, 8, WIDTH - 8);
  const previousY = player.y;
  player.y += player.vy * dt * 60;
  player.grounded = false;
  if (player.vy >= 0) {
    for (const platform of state.platforms) {
      if (previousY <= platform.y + 3 && player.y >= platform.y && player.x > platform.x - 6 && player.x < platform.x + platform.width + 6) {
        player.y = platform.y;
        player.vy = 0;
        player.grounded = true;
        player.platform = state.platforms.indexOf(platform);
        break;
      }
    }
  }
  if (player.y > 210) {
    const safe = state.platforms[player.platform] || state.platforms[0];
    player.x = safe.x + safe.width / 2;
    player.y = safe.y;
    player.vy = 0;
    player.grounded = true;
    state.falls += 1;
  }
  state.camera = clamp(player.y - 102, 0, 58);
  if (player.platform === state.platforms.length - 1 || player.y <= 18) { state.score = Math.max(1000, Math.round(3000 - state.elapsed * 8)); completeGame('tower'); }
}
function drawTowerPlatform(platform, camera) {
  const y = platform.y - camera;
  if (y < -10 || y > HEIGHT + 10) return;
  rect(platform.x, y, platform.width, platform.height, platform.beacon ? palette.amber : palette.cyan);
  rect(platform.x + 2, y + platform.height, 3, 5, '#5b7398');
  rect(platform.x + platform.width - 5, y + platform.height, 3, 5, '#5b7398');
}
function drawTower() {
  const state = currentState;
  rect(0, 0, WIDTH, HEIGHT, '#0b1028');
  for (let i = 0; i < 18; i += 1) line(i * 19 - (state.elapsed * 4 % 19), 0, i * 19 - 28, HEIGHT, '#26385e');
  for (let i = 0; i < 13; i += 1) {
    const x = (i * 31 + state.elapsed * 17) % (WIDTH + 20) - 10;
    line(x, 0, x - 8, 22, '#6e88b0');
  }
  rect(139, 3, 42, 28, '#1d2b4e');
  rect(144, 8, 32, 17, state.platforms[15].beacon ? palette.amber : '#25365b');
  if (Math.floor(state.elapsed * 2) % 2 === 0) circle(160, 16, 7, palette.amber);
  else circle(160, 16, 4, palette.amber);
  text('BEACON', 160, 1, palette.amber, 7, 'center');
  for (const platform of state.platforms) drawTowerPlatform(platform, state.camera);
  const player = state.player;
  const playerY = player.y - state.camera;
  rect(player.x - 5, playerY - 11, 10, 12, palette.pink);
  rect(player.x - 4, playerY - 17, 8, 7, '#e5b39a');
  rect(player.x - 3, playerY - 15, 2, 2, palette.night);
  rect(player.x + 2, playerY - 15, 2, 2, palette.night);
  line(player.x - 6, playerY + 1, player.x - 10, playerY - 5, palette.amber, 2);
  line(player.x + 6, playerY + 1, player.x + 10, playerY - 5, palette.amber, 2);
  rect(0, HEIGHT - 8, WIDTH, 8, '#111a34');
  text('WIND ' + (state.wind > .2 ? '>>>' : state.wind < -.2 ? '<<<' : '---'), 8, HEIGHT - 7, palette.cyan, 7);
  drawGameChrome('TOWER CLIMB', state.score, state.elapsed, 300, clamp(1 - player.y / 180, 0, 1));
}

function newStatic() {
  const random = seeded(909);
  const targets = [.12, .23, .34, .46, .58, .69, .81, .9, .27, .39, .52, .74];
  return { elapsed: 0, score: 0, dial: .5, caught: 0, missed: 0, current: null, nextSpawn: 0, index: 0, targets, random, phase: 'tune' };
}
function spawnTransmission(state) {
  const target = state.targets[state.index % state.targets.length];
  const messages = ['WEATHER WINDOW OPEN', 'NIGHT BUS ON THE RIDGE', 'A LIGHT IN THE FOG', 'KEEP THE DIAL WARM', 'TOWN HALL CLOSED', 'THE TOWER IS LISTENING'];
  state.current = { target, width: .065 + state.random() * .018, life: 18, maxLife: 18, message: messages[state.index % messages.length] };
  state.index += 1;
}
function staticSignal(state) {
  if (!state.current) return 0;
  return clamp(1 - Math.abs(state.dial - state.current.target) / state.current.width, 0, 1) * clamp(state.current.life / 3, 0, 1);
}
function updateStatic(dt) {
  const state = currentState;
  if (!state || state.phase === 'complete') return;
  state.elapsed += dt;
  state.dial = clamp(state.dial + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * .42 * dt, .04, .96);
  if (!state.current && state.elapsed >= state.nextSpawn) spawnTransmission(state);
  if (state.current) {
    state.current.life -= dt;
    if (state.current.life <= 0) { state.missed += 1; state.score = Math.max(0, state.score - 20); state.current = null; state.nextSpawn = state.elapsed + 2; sfx('miss'); }
  }
  if (input.actionPressed && state.current && staticSignal(state) > .55) {
    const bonus = Math.round(staticSignal(state) * 500);
    state.score += bonus;
    state.caught += 1;
    state.current = null;
    state.nextSpawn = state.elapsed + 2.2;
    sfx('catch');
    setStatus('Transmission caught before the mountain took it.');
  }
  updateStaticAudio(staticSignal(state));
  if (state.elapsed >= 300) completeGame('static');
}
function drawStatic() {
  const state = currentState;
  const signal = staticSignal(state);
  rect(0, 0, WIDTH, HEIGHT, '#0b1021');
  for (let i = 0; i < 32; i += 1) {
    const x = (i * 37 + Math.floor(state.elapsed * 19)) % WIDTH;
    const y = (i * 17 + Math.floor(state.elapsed * 11)) % HEIGHT;
    rect(x, y, 1, 1, i % 3 ? '#243658' : '#5b7398');
  }
  rect(14, 22, 292, 102, '#131e3b');
  rect(22, 30, 276, 70, '#091126');
  text('HOLLOW GAP RELAY', 160, 11, palette.cyan, 8, 'center');
  if (state.current) text(state.current.message, 160, 37, signal > .45 ? palette.amber : palette.muted, 8, 'center');
  else text('SCANNING THE BAND', 160, 47, palette.muted, 8, 'center');
  const waveformY = 72;
  context.strokeStyle = signal > .55 ? palette.cyan : palette.violet;
  context.lineWidth = 2;
  context.beginPath();
  for (let x = 30; x <= 290; x += 4) {
    const wave = Math.sin(x * .12 + state.elapsed * 15) * (2 + signal * 12) + Math.sin(x * .31) * 2;
    if (x === 30) context.moveTo(x, waveformY + wave); else context.lineTo(x, waveformY + wave);
  }
  context.stroke();
  rect(24, 112, 272, 3, palette.night);
  for (let i = 0; i <= 20; i += 1) { rect(25 + i * 13, 108, 1, 11, i % 5 ? '#4d5e8b' : palette.amber); }
  rect(25 + Math.round(state.dial * 260), 105, 3, 17, palette.pink);
  text('LOW', 25, 128, palette.muted, 7);
  text('HIGH', 270, 128, palette.muted, 7, 'right');
  text('SIGNAL', 25, 143, palette.muted, 7);
  rect(65, 143, 160, 7, palette.night);
  rect(65, 143, Math.round(signal * 160), 7, signal > .55 ? palette.green : palette.amber);
  text(Math.round(signal * 100) + '%', 232, 142, signal > .55 ? palette.green : palette.amber, 7);
  if (state.current) rect(24, 158, Math.round(state.current.life / state.current.maxLife * 270), 2, palette.violet);
  drawGameChrome('STATIC', state.score, state.elapsed, 300, clamp(state.caught / 12, 0, 1));
}

function drawGameChrome(title, score, elapsed, duration, progress) {
  rect(0, 0, WIDTH, 16, 'rgba(5,7,19,.82)');
  text(title, 7, 4, palette.cyan, 7);
  text('SCORE ' + formatScore(score), WIDTH - 7, 4, palette.amber, 7, 'right');
  rect(0, HEIGHT - 13, WIDTH, 13, 'rgba(5,7,19,.82)');
  rect(8, HEIGHT - 8, 304, 3, palette.night);
  rect(8, HEIGHT - 8, Math.round(304 * clamp(progress, 0, 1)), 3, palette.violet);
  text(formatClock(Math.max(0, duration - elapsed)), 8, HEIGHT - 24, palette.muted, 7);
  text('HOLLOW GAP ARCADE', WIDTH - 8, HEIGHT - 24, palette.muted, 7, 'right');
}
function drawAttract() {
  const colors = [palette.amber, palette.cyan, palette.pink];
  rect(0, 0, WIDTH, HEIGHT, '#090b1b');
  for (let i = 0; i < 40; i += 1) rect((i * 73) % WIDTH, (i * 31) % HEIGHT, 1, 1, i % 4 ? '#252b52' : colors[attractIndex]);
  text('THE HOLLOW GAP', 160, 25, palette.ink, 15, 'center');
  text('ARCADE', 160, 43, colors[attractIndex], 22, 'center');
  text('THREE SHORT GAMES / ONE SMALL ROOM', 160, 72, palette.muted, 7, 'center');
  const names = ['NIGHT SHIFT AT THE DINER', 'TOWER CLIMB', 'STATIC'];
  const descriptions = ['orders before the bell', 'reach the blinking beacon', 'catch what fades'];
  for (let i = 0; i < 3; i += 1) {
    const x = 20 + i * 96;
    rect(x, 95, 82, 48, i === attractIndex ? '#20284b' : '#12172d');
    rect(x, 95, 82, 3, colors[i]);
    text(String(i + 1).padStart(2, '0'), x + 7, 104, colors[i], 8);
    text(names[i], x + 7, 117, palette.ink, 6);
    text(descriptions[i], x + 7, 130, palette.muted, 5);
  }
  text('PRESS START / CHOOSE A GAME', 160, 157, palette.amber, 7, 'center');
  if (Math.floor(attractTime * 2) % 2) text('>', 10, 82, palette.cyan, 8);
  if (Math.floor(attractTime * 2) % 2) text('<', 309, 82, palette.cyan, 8, 'right');
}
function drawGame() {
  if (currentGame === 'diner') drawDiner();
  if (currentGame === 'tower') drawTower();
  if (currentGame === 'static') drawStatic();
  if (currentState && currentState.phase === 'complete') {
    rect(54, 48, 212, 75, 'rgba(5,7,19,.92)');
    rect(54, 48, 212, 3, palette.amber);
    center('SHIFT COMPLETE', 61, palette.amber, 11);
    center('SCORE ' + formatScore(currentState.score), 81, palette.ink, 10);
    center('ENTER INITIALS TO SAVE', 101, palette.muted, 7);
  }
  if (paused) { rect(0, 0, WIDTH, HEIGHT, 'rgba(5,7,19,.62)'); center('PAUSED', 80, palette.amber, 14); }
}
function draw() {
  clear();
  if (scene === 'attract' || scene === 'capture') drawAttract();
  else drawGame();
  if (crtEnabled) rect(0, 0, WIDTH, 1, 'rgba(255,255,255,.08)');
}
function update(dt) {
  if (captureMode || testRunning) return;
  if (scene === 'attract') {
    attractTime += dt;
    if (attractTime > 5) { attractTime = 0; attractIndex = (attractIndex + 1) % 3; }
    return;
  }
  if (!currentState || paused) return;
  if (currentGame === 'diner') updateDiner(dt);
  if (currentGame === 'tower') updateTower(dt);
  if (currentGame === 'static') updateStatic(dt);
  clearEdges();
}
function completeGame(game) {
  if (!currentState || currentState.phase === 'complete') return;
  currentState.phase = 'complete';
  currentState.completedAt = currentState.elapsed;
  currentState.finalScore = Math.max(currentState.score, game === 'tower' ? 1000 : currentState.score);
  sfx('complete');
  setStatus('Run complete. Leave initials if this cabinet remembers you.');
  if (!testMode && currentState.finalScore >= bestScore(game)) {
    pendingScore = { game, score: currentState.finalScore };
    dom.modalTitle.textContent = 'New mark in ' + game;
    dom.modalMessage.textContent = currentState.finalScore + ' points. Save it locally.';
    dom.modal.hidden = false;
    dom.initials.focus();
  }
}
function startGame(name, options = {}) {
  if (!['diner', 'tower', 'static'].includes(name)) return;
  currentGame = name;
  scene = 'game';
  currentState = name === 'diner' ? newDiner() : name === 'tower' ? newTower() : newStatic();
  paused = false;
  attractTime = 0;
  testMode = Boolean(options.test);
  if (!options.silent) ensureAudio();
  setStatus(name === 'diner' ? 'The last shift is open. Serve the line.' : name === 'tower' ? 'The beacon is above the weather.' : 'Tune slowly. The signal will not wait.');
  updateSceneLabel();
  updateScoreDisplay();
  draw();
}
function goAttract() {
  scene = 'attract';
  currentGame = null;
  currentState = null;
  paused = false;
  attractTime = 0;
  testMode = false;
  updateSceneLabel();
  setStatus('Choose a game. The room is listening.');
  draw();
}
function togglePause() {
  if (scene !== 'game' || !currentState || currentState.phase === 'complete') return;
  paused = !paused;
  dom.pause.textContent = paused ? 'RESUME' : 'PAUSE';
  setStatus(paused ? 'The cabinet is holding the frame.' : 'Back to the room.');
}
function showScoreModal(game, score) {
  pendingScore = { game, score };
  dom.modalTitle.textContent = 'New mark in ' + game;
  dom.modalMessage.textContent = score + ' points. Save it locally.';
  dom.modal.hidden = false;
  dom.initials.focus();
}
function savePendingScore(event) {
  event.preventDefault();
  if (!pendingScore) return;
  const initials = (dom.initials.value || 'AAA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'AAA';
  const old = scores[pendingScore.game];
  if (!old || pendingScore.score > old.score) scores[pendingScore.game] = { score: pendingScore.score, initials, date: new Date().toISOString() };
  saveScores();
  pendingScore = null;
  dom.modal.hidden = true;
  updateScoreDisplay();
}
function resetInput() { input.left = false; input.right = false; input.up = false; input.down = false; clearEdges(); }
function bindInput() {
  window.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'Enter', 'KeyP'].includes(event.code)) event.preventDefault();
    if (event.code === 'KeyP' && !event.repeat) { ensureAudio(); togglePause(); return; }
    if (event.code === 'Enter' && scene === 'attract' && !event.repeat) { ensureAudio(); startGame(['diner', 'tower', 'static'][attractIndex]); return; }
    ensureAudio();
    setInput(event.code, true);
  });
  window.addEventListener('keyup', event => setInput(event.code, false));
  document.querySelectorAll('[data-input]').forEach(button => {
    const action = button.dataset.input;
    const press = event => { event.preventDefault(); ensureAudio(); if (action === 'action') input.actionPressed = true; else if (action === 'up') input.jumpPressed = true; else input[action] = true; };
    const release = event => { event.preventDefault(); if (action !== 'action' && action !== 'up') input[action] = false; };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });
  document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => { ensureAudio(); startGame(button.dataset.start); }));
  dom.sound.addEventListener('click', () => { soundEnabled = !soundEnabled; if (soundEnabled) ensureAudio(); if (audio) audio.master.gain.setTargetAtTime(soundEnabled ? .18 : 0, audio.context.currentTime, .08); dom.sound.textContent = 'Sound: ' + (soundEnabled ? 'on' : 'off'); dom.sound.setAttribute('aria-pressed', String(soundEnabled)); });
  dom.crt.addEventListener('click', () => { crtEnabled = !crtEnabled; document.body.classList.toggle('crt', crtEnabled); dom.crt.textContent = 'CRT: ' + (crtEnabled ? 'on' : 'off'); dom.crt.setAttribute('aria-pressed', String(crtEnabled)); });
  dom.pause.addEventListener('click', () => { ensureAudio(); togglePause(); });
  document.getElementById('attractButton').addEventListener('click', () => { ensureAudio(); goAttract(); });
  document.getElementById('closeScore').addEventListener('click', () => { dom.modal.hidden = true; pendingScore = null; });
  dom.scoreForm.addEventListener('submit', savePendingScore);
  canvas.addEventListener('pointerdown', () => { ensureAudio(); canvas.focus(); });
}
function scriptDiner(state) {
  const target = state.boss || state.customers.filter(customer => customer.state === 'waiting').sort((a, b) => Math.abs(a.x - state.serverX) - Math.abs(b.x - state.serverX))[0];
  if (!target) { input.left = false; input.right = false; return; }
  const difference = target.x - state.serverX;
  input.left = difference < -2;
  input.right = difference > 2;
  if (Math.abs(difference) < 3) input.actionPressed = true;
}
function scriptTower(state) {
  const targets = state.platforms.filter(platform => platform.y < state.player.y - 1).sort((a, b) => b.y - a.y);
  const target = targets[0];
  if (!target) return;
  const targetX = target.x + target.width / 2;
  const difference = targetX - state.player.x;
  input.left = difference < -2;
  input.right = difference > 2;
  if (state.player.grounded && Math.abs(difference) < 5) input.jumpPressed = true;
}
function scriptStatic(state) {
  if (!state.current) { input.left = false; input.right = false; return; }
  const difference = state.current.target - state.dial;
  input.left = difference < -.002;
  input.right = difference > .002;
  if (staticSignal(state) > .78) input.actionPressed = true;
}
function runScriptedTest(name) {
  if (!['diner', 'tower', 'static'].includes(name)) return null;
  testRunning = true;
  startGame(name, { silent: true, test: true });
  const script = name === 'diner' ? scriptDiner : name === 'tower' ? scriptTower : scriptStatic;
  const maxSteps = 60 * 60 * 330;
  let steps = 0;
  while (steps < maxSteps && currentState && currentState.phase !== 'complete') {
    resetInput();
    script(currentState);
    updateDinerOrGame(1 / 60);
    if (steps % 24 === 0) draw();
    steps += 1;
  }
  testRunning = false;
  const result = { game: name, complete: Boolean(currentState && currentState.phase === 'complete'), steps, score: currentState ? currentState.score : 0, elapsed: currentState ? currentState.elapsed : 0, finalSnapshot: getSnapshot() };
  window.__hollowGapTestResult = result;
  document.body.dataset.testResult = JSON.stringify(result);
  updateSceneLabel();
  updateScoreDisplay();
  draw();
  return result;
}
function updateDinerOrGame(dt) {
  if (currentGame === 'diner') updateDiner(dt);
  if (currentGame === 'tower') updateTower(dt);
  if (currentGame === 'static') updateStatic(dt);
  clearEdges();
}
function getSnapshot() {
  if (!currentState) return { scene, game: currentGame, attractIndex };
  if (currentGame === 'diner') return { scene, game: currentGame, elapsed: currentState.elapsed, score: currentState.score, serverX: currentState.serverX, customers: currentState.customers.map(customer => ({ x: customer.x, state: customer.state, order: customer.order })), boss: currentState.boss ? { x: currentState.boss.x, remaining: currentState.boss.remaining } : null, complete: currentState.phase === 'complete' };
  if (currentGame === 'tower') return { scene, game: currentGame, elapsed: currentState.elapsed, score: currentState.score, player: { x: currentState.player.x, y: currentState.player.y, grounded: currentState.player.grounded }, complete: currentState.phase === 'complete' };
  return { scene, game: currentGame, elapsed: currentState.elapsed, score: currentState.score, dial: currentState.dial, signal: staticSignal(currentState), current: currentState.current ? { target: currentState.current.target, life: currentState.current.life } : null, complete: currentState.phase === 'complete' };
}
function setupCapture(frame) {
  captureMode = true;
  testMode = true;
  frame = Number(frame) || 0;
  if (frame < 18) { scene = 'attract'; currentGame = null; currentState = null; attractIndex = Math.floor(frame / 6) % 3; attractTime = frame * .17; }
  else if (frame < 38) { startGame('diner', { silent: true, test: true }); currentState.elapsed = 40 + (frame - 18) * 7; for (let i = 0; i < 4; i += 1) spawnCustomer(currentState); currentState.serverX = 40 + (frame % 5) * 35; }
  else if (frame < 53) { startGame('tower', { silent: true, test: true }); currentState.player.x = 40 + (frame % 6) * 30; currentState.player.y = 150 - (frame - 38) * 5; currentState.camera = clamp(currentState.player.y - 102, 0, 58); currentState.wind = (frame % 2 ? 1 : -1) * .6; }
  else { startGame('static', { silent: true, test: true }); currentState.dial = currentState.targets[(frame - 53) % currentState.targets.length]; spawnTransmission(currentState); currentState.current.life = 8; }
  scene = frame < 18 ? 'attract' : 'game';
  updateSceneLabel();
  draw();
  document.body.dataset.captureFrame = String(frame);
}
function runPerformance(seconds) {
  perfMode = true;
  perfStarted = performance.now();
  frameSamples = [];
  return new Promise(resolve => {
    const sample = now => {
      if (frameSamples.length) frameSamples.push(now - perfStarted);
      if (frameSamples.length >= 2 && now - perfStarted >= seconds * 1000) {
        const deltas = frameSamples.slice(1).map((value, index) => value - frameSamples[index]);
        const average = deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 0;
        const p95 = deltas.length ? deltas.slice().sort((a, b) => a - b)[Math.floor(deltas.length * .95)] : 0;
        perfResult = { frames: frameSamples.length, averageFrameMs: Number(average.toFixed(3)), p95FrameMs: Number(p95.toFixed(3)), estimatedFps: Number((1000 / average).toFixed(1)), viewport: { width: window.innerWidth, height: window.innerHeight }, canvas: { width: WIDTH, height: HEIGHT } };
        window.__hollowGapPerformance = perfResult;
        document.body.dataset.performance = JSON.stringify(perfResult);
        resolve(perfResult);
        return;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}
function frame(now) {
  const dt = Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  pollGamepad();
  if (!testRunning && !captureMode) update(dt);
  if (scene === 'game' && currentGame === 'static') updateStaticAudio(staticSignal(currentState));
  draw();
  requestAnimationFrame(frame);
}

bindInput();
updateSceneLabel();
updateScoreDisplay();
if (params.get('crt') === '1') { crtEnabled = true; document.body.classList.add('crt'); dom.crt.textContent = 'CRT: on'; dom.crt.setAttribute('aria-pressed', 'true'); }
window.__hollowGap = { startGame, goAttract, togglePause, getSnapshot, runScriptedTest, step: seconds => { const count = Math.ceil(seconds * 60); for (let i = 0; i < count; i += 1) { updateDinerOrGame(1 / 60); if (i % 10 === 0) draw(); } draw(); return getSnapshot(); }, setInput, runPerformance, setupCapture, getPerformance: () => perfResult };
if (params.get('test')) setTimeout(() => runScriptedTest(params.get('test')), 0);
if (params.get('capture')) setupCapture(params.get('frame') || 0);
if (params.get('perf')) setTimeout(() => runPerformance(Number(params.get('seconds')) || 10), 100);
requestAnimationFrame(frame);
