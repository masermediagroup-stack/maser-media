import {
  MAX_CHARGES,
  MAX_PRIMARIES,
  RADIUS_MAX,
  RADIUS_MIN,
  SPAWN_COOLDOWN_MAX,
  SPAWN_COOLDOWN_MIN,
  SPAWN_HEAT_MIN,
  SPAWN_HEAT_OFF_TAU,
  SPAWN_HEAT_ON_TAU,
  STILL_CLUSTER,
} from "./constants";

export type Edge = "top" | "right" | "bottom" | "left";

type Vec2 = { x: number; y: number };

type Ball = {
  p0: Vec2;
  p1: Vec2;
  p2: Vec2;
  p3: Vec2;
  r: number;
  t: number;
  duration: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
};

const EDGES: Edge[] = ["top", "right", "bottom", "left"];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickEdge(exclude?: Edge): Edge {
  const pool = exclude ? EDGES.filter((edge) => edge !== exclude) : EDGES;
  return pool[Math.floor(Math.random() * pool.length)] ?? "left";
}

function pointOnEdge(edge: Edge, width: number, height: number, radius: number): Vec2 {
  const off = radius + 16;
  const xSpan = Math.max(1, width);
  const ySpan = Math.max(1, height);
  switch (edge) {
    case "top":
      return { x: Math.random() * xSpan, y: -off };
    case "right":
      return { x: width + off, y: Math.random() * ySpan };
    case "bottom":
      return { x: Math.random() * xSpan, y: height + off };
    case "left":
      return { x: -off, y: Math.random() * ySpan };
  }
}

function mix(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function cubicBezier(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

function weightEase(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  const s = x * x * (3 - 2 * x);
  const edge = 0.16 * x + 0.84 * s;
  return edge + 0.08 * Math.sin(2 * Math.PI * edge);
}

function makeArc(p0: Vec2, p3: Vec2, width: number, height: number): { p1: Vec2; p2: Vec2 } {
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const bow = (0.16 + Math.random() * 0.28) * Math.min(width, height);
  const midX = (p0.x + p3.x) * 0.5;
  const midY = (p0.y + p3.y) * 0.5;
  const inward = px * (width * 0.5 - midX) + py * (height * 0.5 - midY);
  const sign = inward >= 0 ? 1 : -1;
  const p1 = mix(p0, p3, 0.035);
  const p2 = mix(p0, p3, 0.58);
  p1.x += px * bow * sign * 0.03;
  p1.y += py * bow * sign * 0.03;
  p2.x += px * bow * sign;
  p2.y += py * bow * sign;
  return { p1, p2 };
}

function radiusForViewport(width: number, height: number): number {
  const scale = Math.min(width, height) / 820;
  return rand(RADIUS_MIN, RADIUS_MAX) * Math.max(0.72, Math.min(1.15, scale));
}

export class MeatballSimulation {
  readonly charges = new Float32Array(MAX_CHARGES * 4);

  private readonly balls: Ball[] = [];
  private spawnCooldown = 0;
  private spawnHeat = 0;
  private wantSpawn = false;
  private width = 1;
  private height = 1;
  private travelSpeed = 1;

  reset(): void {
    this.balls.length = 0;
    this.spawnCooldown = 0;
    this.spawnHeat = 0;
    this.wantSpawn = false;
    this.charges.fill(0);
  }

  setTravelSpeed(speed: number): void {
    this.travelSpeed = Math.min(2, Math.max(0.35, speed));
  }

  setSpawning(active: boolean, size?: { width: number; height: number }): void {
    if (size) {
      this.width = size.width;
      this.height = size.height;
    }
    if (active && !this.wantSpawn) {
      this.spawnHeat = Math.max(this.spawnHeat, SPAWN_HEAT_MIN);
      this.spawnCooldown = 0;
      if (this.trySpawn()) {
        this.spawnCooldown = SPAWN_COOLDOWN_MAX;
        this.packCharges();
      }
    }
    this.wantSpawn = active;
  }

  get spawning(): boolean {
    return this.wantSpawn;
  }

  loadStillCluster(width: number, height: number): void {
    this.reset();
    this.width = width;
    this.height = height;
    const minSide = Math.min(width, height);
    for (const node of STILL_CLUSTER) {
      this.balls.push({
        p0: { x: node.x * width, y: node.y * height },
        p1: { x: node.x * width, y: node.y * height },
        p2: { x: node.x * width, y: node.y * height },
        p3: { x: node.x * width, y: node.y * height },
        r: node.r * minSide,
        t: 0,
        duration: 1,
        x: node.x * width,
        y: node.y * height,
        vx: 0,
        vy: 0,
        alive: true,
      });
    }
    this.packCharges();
  }

  step(dt: number, width: number, height: number): void {
    this.width = width;
    this.height = height;
    const capped = Math.min(dt, 0.033);

    for (const ball of this.balls) {
      if (!ball.alive) continue;
      ball.t += (capped * this.travelSpeed) / ball.duration;
      if (ball.t >= 1) {
        ball.alive = false;
        continue;
      }
      const e0 = weightEase(ball.t);
      const e1 = weightEase(Math.min(1, ball.t + 0.002));
      const pos = cubicBezier(ball.p0, ball.p1, ball.p2, ball.p3, e0);
      const ahead = cubicBezier(ball.p0, ball.p1, ball.p2, ball.p3, e1);
      ball.x = pos.x;
      ball.y = pos.y;
      ball.vx = (ahead.x - pos.x) / 0.002;
      ball.vy = (ahead.y - pos.y) / 0.002;
    }

    this.balls.splice(
      0,
      this.balls.length,
      ...this.balls.filter((ball) => ball.alive),
    );

    const target = this.wantSpawn ? 1 : 0;
    const tau = this.wantSpawn ? SPAWN_HEAT_ON_TAU : SPAWN_HEAT_OFF_TAU;
    const ease = 1 - Math.exp(-capped / tau);
    this.spawnHeat += (target - this.spawnHeat) * ease;

    this.spawnCooldown -= capped;
    if (this.spawnHeat >= SPAWN_HEAT_MIN && this.spawnCooldown <= 0) {
      if (this.trySpawn()) {
        const t =
          (this.spawnHeat - SPAWN_HEAT_MIN) / Math.max(1e-4, 1 - SPAWN_HEAT_MIN);
        this.spawnCooldown =
          SPAWN_COOLDOWN_MAX + (SPAWN_COOLDOWN_MIN - SPAWN_COOLDOWN_MAX) * t;
      }
    }

    this.packCharges();
  }

  get aliveCount(): number {
    return this.balls.length;
  }

  private trySpawn(): boolean {
    if (this.balls.length >= MAX_PRIMARIES) return false;
    const radius = radiusForViewport(this.width, this.height);
    const spawnEdge = pickEdge();
    const exitEdge = pickEdge(spawnEdge);
    const p0 = pointOnEdge(spawnEdge, this.width, this.height, radius);
    const p3 = pointOnEdge(exitEdge, this.width, this.height, radius);
    const { p1, p2 } = makeArc(p0, p3, this.width, this.height);
    const chord = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const duration = Math.min(6.8, Math.max(2.4, (1.85 + chord / 480) * (radius / 40)));
    this.balls.push({
      p0,
      p1,
      p2,
      p3,
      r: radius,
      t: 0,
      duration,
      x: p0.x,
      y: p0.y,
      vx: 0,
      vy: 0,
      alive: true,
    });
    return true;
  }

  private packCharges(): void {
    this.charges.fill(0);
    const n = Math.min(this.balls.length, MAX_PRIMARIES);
    for (let i = 0; i < n; i += 1) {
      const ball = this.balls[i];
      if (!ball) continue;
      const base = i * 4;
      this.charges[base] = ball.x;
      this.charges[base + 1] = ball.y;
      this.charges[base + 2] = ball.r;
      this.charges[base + 3] = 1;
    }
  }
}
