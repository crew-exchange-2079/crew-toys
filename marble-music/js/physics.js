// Pure 2D marble physics. No DOM, no audio — the browser feeds it dt and
// drains `events`; node tests prove determinism and that presets play.
//
// Coordinates: canvas convention, +y is DOWN, angles in degrees where 0 is
// horizontal and positive tilts the right end downward. Bars are static
// capsules; bumpers are static circles; marbles are dynamic circles.

export const MARBLE_RADIUS = 11;
export const BAR_RADIUS = 9;
export const MAX_MARBLES = 14;
const MAX_STEP = 1 / 30;
const SUBSTEPS = 4;
const HIT_COOLDOWN = 0.09; // seconds between notes from the same bar
const MIN_HIT_SPEED = 60; // px/s — softer contacts stay silent
const REST_SPEED = 26; // below this a marble counts as resting
const REST_LIMIT = 2.6; // seconds before a resting marble is recycled

export function createWorld(machine) {
  return {
    width: 1000,
    height: 1000,
    gravity: machine.gravity,
    bars: machine.bars.map((bar) => ({ ...bar, cooldownUntil: 0 })),
    bumpers: machine.bumpers.map((bumper) => ({ ...bumper })),
    marbles: [],
    events: [],
    time: 0,
    nextId: 1,
  };
}

export function spawnMarble(world, x, y, vx = 0, vy = 0) {
  if (world.marbles.length >= MAX_MARBLES) {
    // Recycle the oldest resting marble first, then the oldest overall.
    const resting = world.marbles.find((marble) => marble.resting);
    const victim = resting || world.marbles[0];
    world.marbles.splice(world.marbles.indexOf(victim), 1);
  }
  const marble = {
    id: world.nextId,
    x,
    y,
    vx,
    vy,
    r: MARBLE_RADIUS,
    resting: false,
    restTime: 0,
    born: world.time,
  };
  world.nextId += 1;
  world.marbles.push(marble);
  return marble;
}

export function drainEvents(world) {
  const events = world.events;
  world.events = [];
  return events;
}

function emit(world, event) {
  world.events.push({ time: world.time, ...event });
}

// Closest point on segment (bar center ± length/2 along its angle) to a point.
function closestOnBar(bar, px, py) {
  const rad = (bar.angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const half = bar.length / 2;
  const relX = px - bar.x;
  const relY = py - bar.y;
  const along = Math.max(-half, Math.min(half, relX * dx + relY * dy));
  return { x: bar.x + dx * along, y: bar.y + dy * along, dx, dy };
}

function collideBar(world, marble, bar, dt) {
  const closest = closestOnBar(bar, marble.x, marble.y);
  let nx = marble.x - closest.x;
  let ny = marble.y - closest.y;
  const dist = Math.hypot(nx, ny);
  const minDist = marble.r + BAR_RADIUS;
  if (dist >= minDist) return false;
  if (dist < 1e-6) {
    nx = 0;
    ny = -1;
  } else {
    nx /= dist;
    ny /= dist;
  }
  // Positional correction: push the marble out of the capsule.
  marble.x = closest.x + nx * minDist;
  marble.y = closest.y + ny * minDist;
  const vn = marble.vx * nx + marble.vy * ny;
  // Rolling: gravity always pulls the marble along the bar's downhill
  // direction while in contact (not just on approach), so a marble can never
  // sit still on a slope.
  const downhill = closest.dy > 0 ? 1 : -1;
  const slope = Math.abs(Math.sin((bar.angle * Math.PI) / 180));
  marble.vx += closest.dx * downhill * world.gravity * slope * dt * 0.9;
  marble.vy += closest.dy * downhill * world.gravity * slope * dt * 0.9;
  if (vn < 0) {
    const impact = -vn;
    // Marbles THUD onto bars and roll — a high restitution scatters them off
    // the zigzag path and the tune dissolves into noise.
    const restitution = 0.12;
    marble.vx -= (1 + restitution) * vn * nx;
    marble.vy -= (1 + restitution) * vn * ny;
    marble.vx *= 0.993;
    marble.vy *= 0.993;
    // A landing absorbs most of the marble's sideways speed (a soft ramp,
    // not a trampoline). Without this, a fast marble lands near the next
    // bar's HIGH end and rolls straight off the top of the machine.
    if (impact > MIN_HIT_SPEED) marble.vx *= 0.4;
    if (impact > MIN_HIT_SPEED && world.time >= bar.cooldownUntil) {
      bar.cooldownUntil = world.time + HIT_COOLDOWN;
      emit(world, {
        kind: "bar",
        id: bar.id,
        degree: bar.degree,
        velocity: Math.min(1, impact / 900),
        x: marble.x,
        y: marble.y,
      });
    }
  }
  return true;
}

function collideBumper(world, marble, bumper) {
  let nx = marble.x - bumper.x;
  let ny = marble.y - bumper.y;
  const dist = Math.hypot(nx, ny);
  const minDist = marble.r + bumper.radius;
  if (dist >= minDist) return false;
  if (dist < 1e-6) {
    nx = 0;
    ny = -1;
  } else {
    nx /= dist;
    ny /= dist;
  }
  marble.x = bumper.x + nx * minDist;
  marble.y = bumper.y + ny * minDist;
  const vn = marble.vx * nx + marble.vy * ny;
  if (vn < 0) {
    const impact = -vn;
    const restitution = 0.85;
    marble.vx -= (1 + restitution) * vn * nx;
    marble.vy -= (1 + restitution) * vn * ny;
    if (impact > MIN_HIT_SPEED * 0.7 && world.time >= (bumper.cooldownUntil || 0)) {
      bumper.cooldownUntil = world.time + HIT_COOLDOWN;
      emit(world, {
        kind: "bumper",
        id: bumper.id,
        velocity: Math.min(1, impact / 900),
        x: marble.x,
        y: marble.y,
      });
    }
  }
  return true;
}

function collideMarbles(world) {
  const marbles = world.marbles;
  for (let i = 0; i < marbles.length; i += 1) {
    for (let j = i + 1; j < marbles.length; j += 1) {
      const a = marbles[i];
      const b = marbles[j];
      let nx = b.x - a.x;
      let ny = b.y - a.y;
      const dist = Math.hypot(nx, ny);
      const minDist = a.r + b.r;
      if (dist >= minDist || dist < 1e-6) continue;
      nx /= dist;
      ny /= dist;
      const overlap = (minDist - dist) / 2;
      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;
      const rvx = b.vx - a.vx;
      const rvy = b.vy - a.vy;
      const vn = rvx * nx + rvy * ny;
      if (vn < 0) {
        const restitution = 0.6;
        const impulse = (-(1 + restitution) * vn) / 2;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
      }
    }
  }
}

function stepOnce(world, dt) {
  world.time += dt;
  for (const marble of world.marbles) {
    marble.vy += world.gravity * dt;
    marble.x += marble.vx * dt;
    marble.y += marble.vy * dt;

    // Walls.
    if (marble.x < marble.r) {
      marble.x = marble.r;
      marble.vx = Math.abs(marble.vx) * 0.4;
    } else if (marble.x > world.width - marble.r) {
      marble.x = world.width - marble.r;
      marble.vx = -Math.abs(marble.vx) * 0.4;
    }
    // Floor.
    if (marble.y > world.height - marble.r) {
      marble.y = world.height - marble.r;
      marble.vy = -Math.abs(marble.vy) * 0.35;
      marble.vx *= Math.exp(-2.5 * dt);
    }

    let touching = false;
    for (const bar of world.bars) {
      if (collideBar(world, marble, bar, dt)) touching = true;
    }
    for (const bumper of world.bumpers) {
      if (collideBumper(world, marble, bumper)) touching = true;
    }

    const speed = Math.hypot(marble.vx, marble.vy);
    if (touching && speed < REST_SPEED) {
      marble.restTime += dt;
      marble.resting = marble.restTime > 0.25;
    } else {
      marble.restTime = 0;
      marble.resting = false;
    }
  }
  collideMarbles(world);
  // Recycle marbles that have been resting too long — the toy never clogs.
  world.marbles = world.marbles.filter((marble) => !(marble.resting && marble.restTime > REST_LIMIT));
}

export function step(world, dt) {
  const clamped = Math.min(MAX_STEP, Math.max(0, dt));
  const sub = clamped / SUBSTEPS;
  for (let i = 0; i < SUBSTEPS; i += 1) stepOnce(world, sub);
}

// Test/utility helper: has any marble left the board or gone NaN?
export function worldIsSane(world) {
  return world.marbles.every(
    (marble) =>
      Number.isFinite(marble.x) && Number.isFinite(marble.y) &&
      Number.isFinite(marble.vx) && Number.isFinite(marble.vy) &&
      marble.x >= -1 && marble.x <= world.width + 1 &&
      marble.y >= -1 && marble.y <= world.height + 1
  );
}
