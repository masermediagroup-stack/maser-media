# Generative Animation Reference

Procedural animation effects for components that generate visuals purely from math — no image source needed. Combine noise, value fields, particles, and color functions.

---

## 1. Simplex Noise 2D/3D

Full implementation from Glyph's noise system. Coherent gradient noise with smooth spatial continuity.

### Gradient Vectors and Permutation Table

```typescript
// 12 gradient vectors for 3D simplex
const grad3: [number, number, number][] = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
]

// Ken Perlin's permutation table (256 entries, doubled to 512 for wrapping)
const perm = new Uint8Array([
  151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,
  142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,
  203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
  74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,
  220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,
  132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,
  186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,
  59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,
  70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
  178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,
  241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,
  176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,
  128,195,78,66,215,61,156,180,
  // Doubled
  151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,
  142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,
  203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
  74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,
  220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,
  132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,
  186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,
  59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,
  70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
  178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,
  241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,
  176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,
  128,195,78,66,215,61,156,180,
])

// Precomputed perm mod 12 for gradient indexing
const permMod12 = new Uint8Array(512)
for (let i = 0; i < 512; i++) permMod12[i] = perm[i] % 12
```

### Simplex 2D

```typescript
function simplex2(x: number, y: number): number {
  const F2 = 0.5 * (Math.sqrt(3) - 1)
  const G2 = (3 - Math.sqrt(3)) / 6

  const s = (x + y) * F2
  const i = Math.floor(x + s)
  const j = Math.floor(y + s)
  const t = (i + j) * G2

  const X0 = i - t
  const Y0 = j - t
  const x0 = x - X0
  const y0 = y - Y0

  let i1: number, j1: number
  if (x0 > y0) { i1 = 1; j1 = 0 }
  else { i1 = 0; j1 = 1 }

  const x1 = x0 - i1 + G2
  const y1 = y0 - j1 + G2
  const x2 = x0 - 1 + 2 * G2
  const y2 = y0 - 1 + 2 * G2

  const ii = i & 255
  const jj = j & 255

  let n0 = 0, n1 = 0, n2 = 0

  let t0 = 0.5 - x0 * x0 - y0 * y0
  if (t0 >= 0) {
    const gi0 = permMod12[ii + perm[jj]]
    t0 *= t0
    n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0)
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1
  if (t1 >= 0) {
    const gi1 = permMod12[ii + i1 + perm[jj + j1]]
    t1 *= t1
    n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1)
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2
  if (t2 >= 0) {
    const gi2 = permMod12[ii + 1 + perm[jj + 1]]
    t2 *= t2
    n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2)
  }

  return 70 * (n0 + n1 + n2)
}
```

### Simplex 3D

The z dimension is typically used for time-based animation (`simplex3(x, y, time)`).

```typescript
function simplex3(x: number, y: number, z: number): number {
  const F3 = 1 / 3
  const G3 = 1 / 6

  const s = (x + y + z) * F3
  const i = Math.floor(x + s)
  const j = Math.floor(y + s)
  const k = Math.floor(z + s)
  const t = (i + j + k) * G3

  const X0 = i - t, Y0 = j - t, Z0 = k - t
  const x0 = x - X0, y0 = y - Y0, z0 = z - Z0

  let i1: number, j1: number, k1: number
  let i2: number, j2: number, k2: number

  if (x0 >= y0) {
    if (y0 >= z0)      { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0 }
    else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1 }
    else               { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1 }
  } else {
    if (y0 < z0)       { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1 }
    else if (x0 < z0)  { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1 }
    else               { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0 }
  }

  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3
  const x2 = x0 - i2 + 2*G3, y2 = y0 - j2 + 2*G3, z2 = z0 - k2 + 2*G3
  const x3 = x0 - 1 + 3*G3, y3 = y0 - 1 + 3*G3, z3 = z0 - 1 + 3*G3

  const ii = i & 255, jj = j & 255, kk = k & 255

  let n0 = 0, n1 = 0, n2 = 0, n3 = 0

  let s0 = 0.6 - x0*x0 - y0*y0 - z0*z0
  if (s0 > 0) {
    const gi = permMod12[ii + perm[jj + perm[kk]]]
    s0 *= s0; n0 = s0 * s0 * (grad3[gi][0]*x0 + grad3[gi][1]*y0 + grad3[gi][2]*z0)
  }

  let s1 = 0.6 - x1*x1 - y1*y1 - z1*z1
  if (s1 > 0) {
    const gi = permMod12[ii+i1 + perm[jj+j1 + perm[kk+k1]]]
    s1 *= s1; n1 = s1 * s1 * (grad3[gi][0]*x1 + grad3[gi][1]*y1 + grad3[gi][2]*z1)
  }

  let s2 = 0.6 - x2*x2 - y2*y2 - z2*z2
  if (s2 > 0) {
    const gi = permMod12[ii+i2 + perm[jj+j2 + perm[kk+k2]]]
    s2 *= s2; n2 = s2 * s2 * (grad3[gi][0]*x2 + grad3[gi][1]*y2 + grad3[gi][2]*z2)
  }

  let s3 = 0.6 - x3*x3 - y3*y3 - z3*z3
  if (s3 > 0) {
    const gi = permMod12[ii+1 + perm[jj+1 + perm[kk+1]]]
    s3 *= s3; n3 = s3 * s3 * (grad3[gi][0]*x3 + grad3[gi][1]*y3 + grad3[gi][2]*z3)
  }

  return 32 * (n0 + n1 + n2 + n3)
}
```

### Fractal Brownian Motion (fBm)

Layers multiple octaves of simplex noise for natural-looking turbulence.

```typescript
function fbm2(x: number, y: number, octaves: number = 4): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += simplex2(x * frequency, y * frequency) * amplitude
    maxValue += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return value / maxValue
}

function fbm3(x: number, y: number, z: number, octaves: number = 4): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += simplex3(x * frequency, y * frequency, z * frequency) * amplitude
    maxValue += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return value / maxValue
}
```

---

## 2. HSV to RGB

For procedural coloring. Input h is 0-1 (fractional turns), s and v are 0-1.

```typescript
function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
  h = ((h % 1) + 1) % 1
  const c = v * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = v - c
  const h6 = h * 6
  let r = 0, g = 0, b = 0
  if (h6 < 1)      { r = c; g = x }
  else if (h6 < 2) { r = x; g = c }
  else if (h6 < 3) { g = c; b = x }
  else if (h6 < 4) { g = x; b = c }
  else if (h6 < 5) { r = x; b = c }
  else              { r = c; b = x }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}
```

---

## 3. Procedural Value Fields

Each function computes a value 0-1 at a given (x, y, t) coordinate. Feed the output to character mapping and coloring.

### Sine Field

Layered sine waves for organic texture.

```typescript
function sineField(x: number, y: number, t: number): number {
  const v =
    Math.sin(x * 0.05 + t * 0.8) * 0.3 +
    Math.sin(y * 0.07 - t * 0.6) * 0.3 +
    Math.sin((x + y) * 0.03 + t * 0.4) * 0.2 +
    Math.sin(Math.sqrt(x * x + y * y) * 0.04 - t) * 0.2
  return v * 0.5 + 0.5
}
```

### Plasma

Classic plasma with distance-based interference.

```typescript
function plasma(x: number, y: number, t: number): number {
  const dist = Math.sqrt(x * x + y * y)
  const v =
    Math.sin(x * 0.1 + t) +
    Math.sin(y * 0.1 - t) +
    Math.sin((x + y) * 0.07 + t * 0.5) +
    Math.cos(dist * 0.05 - t * 0.8)
  return (v + 4) / 8
}
```

### Concentric Rings

Distance-based sine waves from center, creating expanding/collapsing rings.

```typescript
function concentricRings(
  x: number, y: number, cx: number, cy: number, t: number,
  frequency: number = 0.15, speed: number = 2,
): number {
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
  return (Math.sin(dist * frequency - t * speed) + 1) * 0.5
}
```

### Spiral Arms

Logarithmic spirals radiating from center.

```typescript
function spiralArms(
  x: number, y: number, cx: number, cy: number, t: number,
  arms: number = 3, tightness: number = 0.3,
): number {
  const dx = x - cx, dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  const offset = (angle / (Math.PI * 2)) * arms
  const spiral = Math.cos(offset * Math.PI * 2 - Math.log(dist + 1) * tightness * 10 + t * 2)
  const fade = Math.exp(-dist * 0.005)
  return (spiral * fade + 1) * 0.5
}
```

### Vortex

Twisting pattern where angle wraps with distance.

```typescript
function vortex(
  x: number, y: number, cx: number, cy: number, t: number,
  twist: number = 0.05, speed: number = 1,
): number {
  const dx = x - cx, dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  const twisted = angle + dist * twist + t * speed
  return (Math.sin(twisted * 3) + 1) * 0.5
}
```

### Tunnel

Inverse distance creates depth illusion of receding into a tunnel.

```typescript
function tunnel(
  x: number, y: number, cx: number, cy: number, t: number,
): number {
  const dx = x - cx, dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
  const angle = Math.atan2(dy, dx)
  const depth = 1 / dist
  const v = Math.sin(depth * 50 + t * 3) * 0.5 +
            Math.sin(angle * 4 + t) * 0.3 +
            Math.cos(depth * 30 - t * 2) * 0.2
  return Math.max(0, Math.min(1, v * 0.5 + 0.5))
}
```

### Ripple

Decaying wave from a point source.

```typescript
function ripple(
  x: number, y: number, sx: number, sy: number, t: number,
  frequency: number = 0.3, damping: number = 0.02,
): number {
  const dist = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2)
  const wave = Math.sin(dist * frequency - t * 4) * Math.exp(-dist * damping)
  return wave * 0.5 + 0.5
}
```

### Domain Warping

Feed noise output back as input coordinates for organic, flowing shapes.

```typescript
function domainWarp(
  x: number, y: number, t: number,
  scale: number = 0.01, warpStrength: number = 50,
): number {
  // First pass: get warp offsets from noise
  const wx = simplex3(x * scale, y * scale, t * 0.3) * warpStrength
  const wy = simplex3(x * scale + 5.2, y * scale + 1.3, t * 0.3) * warpStrength

  // Second pass: sample noise at warped coordinates
  const value = simplex3((x + wx) * scale, (y + wy) * scale, t * 0.5)

  return value * 0.5 + 0.5
}
```

---

## 4. Particle Systems

Canvas-based generative particle systems with different motion behaviors.

### Particle State Management

```typescript
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

function createParticlePool(capacity: number): {
  particles: Particle[]
  count: number
  emit: (x: number, y: number, count: number, config?: Partial<Particle>) => void
  update: (dt: number) => void
} {
  const particles: Particle[] = Array.from({ length: capacity }, () => ({
    x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, hue: 0,
  }))
  let count = 0

  function emit(x: number, y: number, n: number, config?: Partial<Particle>) {
    for (let i = 0; i < n && count < capacity; i++) {
      const p = particles[count++]
      p.x = x
      p.y = y
      p.vx = (Math.random() - 0.5) * 4 + (config?.vx ?? 0)
      p.vy = (Math.random() - 0.5) * 4 + (config?.vy ?? 0)
      p.life = config?.maxLife ?? 2 + Math.random() * 2
      p.maxLife = p.life
      p.size = config?.size ?? 1 + Math.random() * 2
      p.hue = config?.hue ?? Math.random() * 360
    }
  }

  function update(dt: number) {
    let alive = 0
    for (let i = 0; i < count; i++) {
      const p = particles[i]
      p.life -= dt
      if (p.life <= 0) continue
      p.x += p.vx * dt * 60
      p.y += p.vy * dt * 60
      if (alive !== i) {
        particles[alive] = particles[i]
        particles[i] = p
      }
      alive++
    }
    count = alive
  }

  return { particles, get count() { return count }, set count(v) { count = v }, emit, update }
}
```

### Beat-Triggered Explosion

```typescript
function emitExplosion(
  pool: ReturnType<typeof createParticlePool>,
  cx: number, cy: number,
  count: number = 50, force: number = 8,
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = force * (0.5 + Math.random() * 0.5)
    pool.emit(cx, cy, 1, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxLife: 1 + Math.random() * 1.5,
      hue: Math.random() * 60 + 10,
    })
  }
}
```

### Rising Embers

```typescript
function emitEmbers(
  pool: ReturnType<typeof createParticlePool>,
  width: number, height: number,
  count: number = 3,
): void {
  for (let i = 0; i < count; i++) {
    pool.emit(Math.random() * width, height + 10, 1, {
      vx: (Math.random() - 0.5) * 0.5,
      vy: -1 - Math.random() * 2,
      maxLife: 3 + Math.random() * 4,
      size: 1 + Math.random(),
      hue: 15 + Math.random() * 30,
    })
  }
}
```

### Orbital Motion

```typescript
function updateOrbital(
  p: Particle, cx: number, cy: number,
  gravity: number = 0.1, drag: number = 0.998,
): void {
  const dx = cx - p.x
  const dy = cy - p.y
  const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
  const force = gravity / dist
  p.vx += (dx / dist) * force
  p.vy += (dy / dist) * force
  p.vx *= drag
  p.vy *= drag
}
```

### Flow Field Following

Particles follow the gradient of a noise field.

```typescript
function updateFlowField(
  p: Particle, t: number,
  scale: number = 0.005, strength: number = 2,
): void {
  const angle = simplex3(p.x * scale, p.y * scale, t * 0.3) * Math.PI * 2
  p.vx += Math.cos(angle) * strength * 0.1
  p.vy += Math.sin(angle) * strength * 0.1
  // Damping to prevent runaway velocity
  p.vx *= 0.95
  p.vy *= 0.95
}
```

### Collision with Bezier Paths

```typescript
function bezierPoint(
  t: number,
  p0: [number, number], p1: [number, number],
  p2: [number, number], p3: [number, number],
): [number, number] {
  const u = 1 - t
  const tt = t * t, uu = u * u
  const uuu = uu * u, ttt = tt * t
  return [
    uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
    uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
  ]
}

function bounceOffBezier(
  p: Particle,
  p0: [number, number], p1: [number, number],
  p2: [number, number], p3: [number, number],
  segments: number = 20, bounceDist: number = 8,
): void {
  for (let i = 0; i <= segments; i++) {
    const [bx, by] = bezierPoint(i / segments, p0, p1, p2, p3)
    const dx = p.x - bx, dy = p.y - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < bounceDist) {
      const nx = dx / dist, ny = dy / dist
      const dot = p.vx * nx + p.vy * ny
      p.vx -= 2 * dot * nx
      p.vy -= 2 * dot * ny
      p.x = bx + nx * bounceDist
      p.y = by + ny * bounceDist
      return
    }
  }
}
```

### Rendering Particles to Canvas

```typescript
function renderParticlePool(
  ctx: CanvasRenderingContext2D,
  pool: ReturnType<typeof createParticlePool>,
  chars: string = '*',
  fontSize: number = 14,
): void {
  ctx.font = `${fontSize}px "Courier New", monospace`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  for (let i = 0; i < pool.count; i++) {
    const p = pool.particles[i]
    const lifeRatio = p.life / p.maxLife
    const alpha = lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : Math.min(1, lifeRatio * 2)
    const [r, g, b] = hsv2rgb(p.hue / 360, 0.8, 0.6 + lifeRatio * 0.4)
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`
    const char = chars[Math.floor((1 - lifeRatio) * (chars.length - 1))]
    ctx.fillText(char, p.x, p.y)
  }
}
```

### Integration with requestAnimationFrame

```typescript
// Inside useEffect:
const pool = createParticlePool(500)
let lastTime = performance.now()

const frame = () => {
  const now = performance.now()
  const dt = Math.min((now - lastTime) / 1000, 0.05) // cap at 50ms
  lastTime = now

  // Emit new particles
  emitEmbers(pool, w, h, 2)

  // Update physics
  for (let i = 0; i < pool.count; i++) {
    updateFlowField(pool.particles[i], now / 1000)
  }
  pool.update(dt)

  // Clear and render
  ctx.fillStyle = 'rgba(0,0,0,0.15)' // trail effect
  ctx.fillRect(0, 0, w, h)
  renderParticlePool(ctx, pool, '.+*#', 12)

  animRef.current = requestAnimationFrame(frame)
}
animRef.current = requestAnimationFrame(frame)
```

---

## 5. Matrix Rain

Falling character columns with per-column speed variation. Uses a deterministic hash function for reproducible pseudo-randomness.

### Hash Function

```typescript
function hashF(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0
  h = ((h ^ (h >> 13)) * 1274126177) | 0
  return ((h ^ (h >> 16)) >>> 0) / 4294967296
}
```

### Matrix Rain Props

```typescript
interface MatrixRainConfig {
  scale: number         // cell size in pixels, default 14
  speed: number         // fall speed multiplier, default 1
  direction: string     // 'up' | 'down' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  trailLength: number   // number of trailing characters, default 20
  charset: string       // characters to use, default katakana + latin
}
```

### Direction Vectors

```typescript
const RAIN_DIRS: Record<string, [number, number]> = {
  up:           [0, -1],
  down:         [0, 1],
  left:         [-1, 0],
  right:        [1, 0],
  'top-left':   [-0.707, -0.707],
  'top-right':  [0.707, -0.707],
  'bottom-left':[-0.707, 0.707],
  'bottom-right':[0.707, 0.707],
}
```

### Renderer

```typescript
function renderMatrixRain(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number,
  config: MatrixRainConfig,
): void {
  const { scale, speed, direction, trailLength, charset } = config
  const [dx, dy] = RAIN_DIRS[direction] ?? RAIN_DIRS['down']

  const cols = Math.ceil(width / scale)
  const rows = Math.ceil(height / scale)

  // Determine primary axis from direction
  const isVertical = Math.abs(dy) >= Math.abs(dx)
  const primaryLen = isVertical ? rows : cols
  const secondaryLen = isVertical ? cols : rows

  ctx.font = `${scale}px "Courier New", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let lane = 0; lane < secondaryLen; lane++) {
    // Per-column speed variation from hash
    const laneSpeed = 0.6 + hashF(lane, 0) * 0.8
    const laneOffset = hashF(lane, 1) * primaryLen
    const laneLen = Math.floor(trailLength * (0.5 + hashF(lane, 2) * 1.0))

    const headPos = ((time * speed * laneSpeed * 8 + laneOffset) % (primaryLen + laneLen)) - laneLen

    for (let i = 0; i < laneLen; i++) {
      const pos = Math.floor(headPos) - i
      if (pos < 0 || pos >= primaryLen) continue

      let px: number, py: number
      if (isVertical) {
        px = lane * scale
        py = (dy > 0 ? pos : primaryLen - 1 - pos) * scale
      } else {
        px = (dx > 0 ? pos : primaryLen - 1 - pos) * scale
        py = lane * scale
      }

      // Character from hash for visual variety
      const charIdx = Math.floor(hashF(lane * 100 + pos, Math.floor(time * 10)) * charset.length)
      const char = charset[charIdx]

      // Head brightness fades along trail
      const trailFade = 1 - i / laneLen
      const isHead = i === 0

      if (isHead) {
        ctx.fillStyle = 'rgba(180,255,180,0.95)'
      } else {
        const alpha = trailFade * 0.8
        const green = Math.floor(100 + trailFade * 155)
        ctx.fillStyle = `rgba(0,${green},65,${alpha.toFixed(2)})`
      }

      ctx.fillText(char, px, py)
    }
  }
}
```

### Default Charset

```typescript
const MATRIX_CHARSET =
  'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '0123456789' +
  ':.="*+-<>|{}'
```

---

## 6. Generative ASCII Background Pattern

Complete example combining simplex noise, HSV coloring, character mapping, and time animation. Ready to inline into a component's render function.

```typescript
function renderGenerativeBackground(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number,
  options?: {
    fontSize?: number
    charset?: string
    noiseScale?: number
    colorSpeed?: number
    brightness?: number
  },
): void {
  const fontSize = options?.fontSize ?? 14
  const charset = options?.charset ?? ' .:-=+*#%@'
  const noiseScale = options?.noiseScale ?? 0.02
  const colorSpeed = options?.colorSpeed ?? 0.1
  const brightnessOffset = options?.brightness ?? 0

  const cellWidth = fontSize * 0.6
  const cellHeight = fontSize * 1.2
  const cols = Math.max(1, Math.floor(width / cellWidth))
  const rows = Math.max(1, Math.floor(height / cellHeight))

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  const cx = cols * 0.5
  const cy = rows * 0.5

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Simplex noise brightness field
      const nx = x * noiseScale
      const ny = y * noiseScale
      const noiseVal = simplex3(nx, ny, time * 0.3)

      // Domain warp for organic flow
      const warpX = simplex3(nx + 5.2, ny + 1.3, time * 0.2) * 2
      const warpY = simplex3(nx + 9.7, ny + 4.8, time * 0.2) * 2
      const warped = simplex3(nx + warpX, ny + warpY, time * 0.4)

      // Combine noise layers
      let b = (noiseVal + warped + 2) * 0.25
      b = Math.max(0, Math.min(1, b + brightnessOffset))

      // Vignette
      const dx = (x - cx) / cx
      const dy = (y - cy) / cy
      const vignette = 1 - Math.sqrt(dx * dx + dy * dy) * 0.4
      b *= Math.max(0, vignette)

      // Character from brightness
      const charIdx = Math.floor(b * (charset.length - 1))
      const char = charset[Math.max(0, Math.min(charset.length - 1, charIdx))]
      if (char === ' ') continue

      // HSV color from angle to center + distance
      const angle = Math.atan2(y - cy, x - cx)
      const dist = Math.sqrt(dx * dx + dy * dy)
      const hue = ((angle / (Math.PI * 2)) + 0.5 + time * colorSpeed) % 1
      const sat = 0.4 + dist * 0.3
      const val = 0.3 + b * 0.7
      const [r, g, bl] = hsv2rgb(hue, sat, val)

      ctx.fillStyle = `rgb(${r},${g},${bl})`
      ctx.fillText(char, x * cellWidth, y * cellHeight)
    }
  }
}
```

### Usage in a Component

```typescript
// Inside useEffect render loop:
const render = () => {
  const t = (performance.now() - startTime) / 1000 * speed
  renderGenerativeBackground(ctx, w, h, t, {
    fontSize,
    charset,
    noiseScale: 0.025,
    colorSpeed: 0.08,
  })
  if (!prefersReduced) animRef.current = requestAnimationFrame(render)
}
```
