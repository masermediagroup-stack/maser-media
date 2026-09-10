import {
  ASCII_CELL_H,
  ASCII_CELL_W,
  ASCII_FONT_SIZE,
  TEAR_DRAG,
  TEAR_FADE_TAIL,
  TEAR_GRAVITY,
  TEAR_MAX_FLYING,
  TEAR_MOUSE_RADIUS_FRAC,
  TEAR_MOUSE_RADIUS_MAX,
  TEAR_MOUSE_RADIUS_MIN,
  TEAR_SPAWN_CAP,
  TEAR_SPAWN_DIVISOR,
  TEAR_SPEED_THRESH,
  TEAR_VEL_SMOOTH,
} from "./constants";
import { ASCII_CHARS } from "./sparkle-bursts";

export type PointerVelocity = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  lastX: number;
  lastY: number;
  lastT: number;
  hasSample: boolean;
};

export type FlyingChar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  rot: number;
  vr: number;
  flip: number;
  vf: number;
  charIndex: number;
  r: number;
  g: number;
  b: number;
  life: number;
  lifespan: number;
};

export type TearColor = {
  r: number;
  g: number;
  b: number;
};

export function createPointerVelocity(): PointerVelocity {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    hasSample: false,
  };
}

export function trackPointer(
  vel: PointerVelocity,
  x: number,
  y: number,
  now: number,
): void {
  if (!vel.hasSample) {
    vel.x = x;
    vel.y = y;
    vel.lastX = x;
    vel.lastY = y;
    vel.lastT = now;
    vel.hasSample = true;
    vel.vx = 0;
    vel.vy = 0;
    vel.speed = 0;
    return;
  }

  const dt = Math.max(0.001, (now - vel.lastT) / 1000);
  const instVx = (x - vel.lastX) / dt;
  const instVy = (y - vel.lastY) / dt;
  vel.vx += (instVx - vel.vx) * TEAR_VEL_SMOOTH;
  vel.vy += (instVy - vel.vy) * TEAR_VEL_SMOOTH;
  vel.speed = Math.hypot(vel.vx, vel.vy);
  vel.x = x;
  vel.y = y;
  vel.lastX = x;
  vel.lastY = y;
  vel.lastT = now;
}

export function decayPointer(vel: PointerVelocity, now: number): void {
  if (!vel.hasSample) return;
  if (now - vel.lastT < 32) return;
  vel.vx *= 0.84;
  vel.vy *= 0.84;
  if (vel.speed < 12) {
    vel.vx = 0;
    vel.vy = 0;
    vel.speed = 0;
    return;
  }
  vel.speed = Math.hypot(vel.vx, vel.vy);
}

export function tearMouseRadius(cssW: number, cssH: number): number {
  const raw = Math.min(cssW, cssH) * TEAR_MOUSE_RADIUS_FRAC;
  return Math.min(TEAR_MOUSE_RADIUS_MAX, Math.max(TEAR_MOUSE_RADIUS_MIN, raw));
}

export function spawnBudget(speed: number, flyingCount: number): number {
  if (speed <= TEAR_SPEED_THRESH) return 0;
  const remaining = TEAR_MAX_FLYING - flyingCount;
  if (remaining <= 0) return 0;
  return Math.min(
    Math.floor((speed - TEAR_SPEED_THRESH) / TEAR_SPAWN_DIVISOR),
    TEAR_SPAWN_CAP,
    remaining,
  );
}

export function launchFlyingChar(options: {
  x: number;
  y: number;
  charIndex: number;
  color: TearColor;
  vel: PointerVelocity;
}): FlyingChar {
  const { x, y, charIndex, color, vel } = options;
  const density = (charIndex + 1) / ASCII_CHARS.length;
  const mass = 0.42 + density * 1.15;
  const speed = Math.max(vel.speed, 1);
  const dirX = vel.vx / speed;
  const dirY = vel.vy / speed;
  const spreadAmp = (1.2 / mass) * (0.28 + Math.random() * 0.9);
  const spread = (Math.random() * 2 - 1) * spreadAmp;
  const lx = dirX + -dirY * spread;
  const ly = dirY + dirX * spread;
  const len = Math.hypot(lx, ly) || 1;
  const launch = (220 + speed * (0.2 + 0.1 / mass)) / len;
  const lifespan = 0.82 + Math.random() * 0.7;

  return {
    x,
    y,
    vx: (lx / len) * launch,
    vy: (ly / len) * launch,
    mass,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * (9 + 12 / mass),
    flip: Math.random() * Math.PI * 2,
    vf: (Math.random() - 0.5) * (5.5 + 4 / mass),
    charIndex,
    r: color.r,
    g: color.g,
    b: color.b,
    life: lifespan,
    lifespan,
  };
}

export function stepFlying(
  flying: FlyingChar[],
  dt: number,
  cssW: number,
  cssH: number,
  padX: number,
  padY: number,
): number {
  const minX = -padX;
  const maxX = cssW + padX;
  const minY = -padY;
  const maxY = cssH + padY;
  let write = 0;

  for (let i = 0; i < flying.length; i++) {
    const p = flying[i];
    if (!p) continue;

    const invMass = 1 / p.mass;
    p.vy += TEAR_GRAVITY * dt;
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > 0.001) {
      const drag = TEAR_DRAG * spd * spd * invMass;
      const cut = Math.min(spd, drag * dt);
      const scale = (spd - cut) / spd;
      p.vx *= scale;
      p.vy *= scale;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.flip += p.vf * dt;
    p.life -= dt;

    if (p.life <= 0) continue;
    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) continue;
    flying[write] = p;
    write += 1;
  }

  flying.length = write;
  return write;
}

export function drawFlying(
  ctx: CanvasRenderingContext2D,
  flying: readonly FlyingChar[],
  offsetX: number,
  offsetY: number,
): void {
  if (flying.length === 0) return;
  ctx.font = `${ASCII_FONT_SIZE}px ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < flying.length; i++) {
    const p = flying[i];
    if (!p) continue;
    const tail = p.lifespan * TEAR_FADE_TAIL;
    const alpha = p.life < tail ? Math.max(0, p.life / tail) : 1;
    if (alpha <= 0.01) continue;
    const glyph = ASCII_CHARS[p.charIndex] ?? ".";
    const scaleY = Math.cos(p.flip);
    ctx.save();
    ctx.translate(p.x + offsetX, p.y + offsetY);
    ctx.rotate(p.rot);
    ctx.scale(1, scaleY === 0 ? 0.001 : scaleY);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${p.r} ${p.g} ${p.b})`;
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

export function cellCenter(column: number, row: number): { x: number; y: number } {
  return {
    x: (column + 0.5) * ASCII_CELL_W,
    y: (row + 0.5) * ASCII_CELL_H,
  };
}