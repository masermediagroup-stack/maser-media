# Effects Reference

All FX from Glyph's fx.ts plus post-processing from ascii-video, adapted for Canvas 2D.

---

## 1. Direction System

Unified 8-direction mapping used across all directional FX (noise, intervals, beam, glitch, matrix rain).

### Direction Map

```typescript
const DIRECTIONS: Record<string, [number, number]> = {
  'up':           [0, -1],
  'down':         [0, 1],
  'left':         [-1, 0],
  'right':        [1, 0],
  'top-left':     [-0.707, -0.707],
  'top-right':    [0.707, -0.707],
  'bottom-left':  [-0.707, 0.707],
  'bottom-right': [0.707, 0.707],
}

type Direction = keyof typeof DIRECTIONS
```

### Direction Info Helper

Resolves a direction string to its vector components plus computed perpendicular.

```typescript
interface DirectionInfo {
  dx: number
  dy: number
  perpX: number
  perpY: number
}

function getDirectionInfo(dir: Direction): DirectionInfo {
  const [dx, dy] = DIRECTIONS[dir] ?? DIRECTIONS['down']
  return {
    dx, dy,
    perpX: -dy,
    perpY: dx,
  }
}
```

### Cell Norms Helper

Computes normalized position (0-1) and cell-relative distance along a direction axis.

```typescript
function cellNorms(
  x: number, y: number,
  cols: number, rows: number,
  dir: DirectionInfo,
): { along: number; across: number } {
  const nx = x / cols
  const ny = y / rows
  const along = nx * dir.dx + ny * dir.dy
  const across = nx * dir.perpX + ny * dir.perpY
  return { along: (along + 1) * 0.5, across: (across + 1) * 0.5 }
}
```

---

## 2. Pre-Render FX

These modify the brightness grid before character selection. Apply them after computing the initial brightness grid but before the style renderer runs.

### Noise FX

Simplex3 noise with layered fBm and directional bias. Adds animated noise texture to the brightness grid.

```typescript
interface NoiseFXConfig {
  noiseIntensity: number  // 0 to 1, default 0.3
  noiseScale: number      // 0.01 to 0.1, default 0.03
  noiseSpeed: number      // default 1
  direction: Direction    // default 'down'
}

function applyNoiseFX(
  grid: Float32Array,
  cols: number, rows: number,
  time: number,
  config: NoiseFXConfig,
): void {
  const { noiseIntensity, noiseScale, noiseSpeed, direction } = config
  const dir = getDirectionInfo(direction)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x

      // Base simplex noise
      const n1 = simplex3(x * noiseScale, y * noiseScale, time * noiseSpeed * 0.5)

      // Layered fBm for detail
      const n2 = simplex3(
        x * noiseScale * 2.3 + 5.2,
        y * noiseScale * 2.3 + 1.7,
        time * noiseSpeed * 0.3,
      ) * 0.5

      // Directional bias — noise flows along the direction
      const { along } = cellNorms(x, y, cols, rows, dir)
      const dirBias = Math.sin(along * Math.PI * 4 + time * noiseSpeed) * 0.3

      const noise = (n1 + n2 + dirBias) * noiseIntensity
      grid[idx] = Math.max(0, Math.min(1, grid[idx] + noise))
    }
  }
}
```

### Intervals FX

Repeating bands and sinusoidal waves along a direction axis. Creates banded/striped patterns.

```typescript
interface IntervalsFXConfig {
  intervalWidth: number   // pixels between bands, default 20
  intervalFade: number    // 0 to 1, softness, default 0.5
  intervalSpeed: number   // scroll speed, default 1
  direction: Direction    // default 'right'
}

function applyIntervalsFX(
  grid: Float32Array,
  cols: number, rows: number,
  time: number,
  config: IntervalsFXConfig,
): void {
  const { intervalWidth, intervalFade, intervalSpeed, direction } = config
  const dir = getDirectionInfo(direction)
  const freq = (Math.PI * 2) / intervalWidth

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x

      // Position along direction axis
      const pos = x * dir.dx + y * dir.dy
      const scrolled = pos + time * intervalSpeed * 10

      // Sharp repeating bands + sinusoidal modulation
      const band = Math.sin(scrolled * freq)
      const soft = Math.sin(scrolled * freq * 0.5 + Math.PI * 0.25) * intervalFade

      const factor = 0.5 + (band + soft) * 0.25
      grid[idx] = Math.max(0, Math.min(1, grid[idx] * factor))
    }
  }
}
```

### Beam FX

A single bright traveling sweep that moves across the grid along a direction.

```typescript
interface BeamFXConfig {
  beamWidth: number     // width of beam in normalized units (0-1), default 0.1
  beamSpeed: number     // traversal speed, default 1
  beamIntensity: number // brightness boost, default 0.5
  direction: Direction  // default 'right'
}

function applyBeamFX(
  grid: Float32Array,
  cols: number, rows: number,
  time: number,
  config: BeamFXConfig,
): void {
  const { beamWidth, beamSpeed, beamIntensity, direction } = config
  const dir = getDirectionInfo(direction)

  // Beam position oscillates back and forth
  const beamPos = (Math.sin(time * beamSpeed) + 1) * 0.5

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x

      const { along } = cellNorms(x, y, cols, rows, dir)
      const dist = Math.abs(along - beamPos)

      if (dist < beamWidth) {
        const falloff = 1 - dist / beamWidth
        const boost = falloff * falloff * beamIntensity
        grid[idx] = Math.min(1, grid[idx] + boost)
      }
    }
  }
}
```

### Glitch FX

Lane-based horizontal distortion with hash-seeded activation. Creates blocks of offset/corrupted cells.

```typescript
interface GlitchFXConfig {
  glitchIntensity: number // 0 to 1, probability of glitch lane, default 0.15
  glitchBlockSize: number // height of glitch blocks in cells, default 3
  glitchOffset: number    // max horizontal displacement in cells, default 8
  glitchSpeed: number     // how often glitch updates, default 1
}

function applyGlitchFX(
  grid: Float32Array,
  cols: number, rows: number,
  time: number,
  config: GlitchFXConfig,
): void {
  const { glitchIntensity, glitchBlockSize, glitchOffset, glitchSpeed } = config

  // Hash-seeded activation — different lanes glitch at different times
  const frame = Math.floor(time * glitchSpeed * 10)

  // Work on a copy to avoid reading shifted values
  const copy = new Float32Array(grid)

  for (let y = 0; y < rows; y += glitchBlockSize) {
    // Deterministic hash decides if this lane glitches
    const h = ((y * 2654435761 + frame * 340573321) >>> 0) / 4294967296
    if (h > glitchIntensity) continue

    // Hash determines offset direction and magnitude
    const offsetH = ((y * 374761393 + frame * 668265263) >>> 0) / 4294967296
    const offset = Math.round((offsetH - 0.5) * 2 * glitchOffset)

    // Additional hash for brightness corruption
    const corruptH = ((y * 123456789 + frame * 987654321) >>> 0) / 4294967296
    const corrupt = corruptH > 0.7

    for (let by = 0; by < glitchBlockSize && y + by < rows; by++) {
      const row = y + by
      for (let x = 0; x < cols; x++) {
        const srcX = Math.max(0, Math.min(cols - 1, x + offset))
        const dstIdx = row * cols + x
        const srcIdx = row * cols + srcX

        grid[dstIdx] = copy[srcIdx]

        if (corrupt) {
          // Randomly brighten or darken corrupted cells
          const noise = (((x * 12345 + row * 67890 + frame) >>> 0) % 100) / 100
          if (noise > 0.8) grid[dstIdx] = Math.min(1, grid[dstIdx] + 0.3)
          else if (noise < 0.2) grid[dstIdx] = Math.max(0, grid[dstIdx] - 0.3)
        }
      }
    }
  }
}
```

---

## 3. Post-Render FX

Applied as canvas overlays after the character renderer has drawn to the canvas.

### CRT Effect

Full CRT simulation: scanlines, phosphor aperture grille (RGB subpixel masking), radial vignette, barrel distortion border, temporal flicker, and canvas blur bloom.

```typescript
interface CRTConfig {
  scanlineIntensity: number  // 0 to 1, default 0.3
  phosphorIntensity: number  // 0 to 1, default 0.15
  vignetteStrength: number   // 0 to 1, default 0.4
  flickerAmount: number      // 0 to 1, default 0.03
  bloomRadius: number        // blur pixels, default 2
  barrelAmount: number       // border curvature, default 0.02
}

function applyCRT(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number,
  config: CRTConfig,
): void {
  const {
    scanlineIntensity, phosphorIntensity, vignetteStrength,
    flickerAmount, bloomRadius, barrelAmount,
  } = config

  // --- Bloom: blur pass ---
  if (bloomRadius > 0) {
    ctx.save()
    ctx.filter = `blur(${bloomRadius}px)`
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.15
    ctx.drawImage(ctx.canvas, 0, 0, width, height)
    ctx.restore()
  }

  // --- Scanlines: darken every Nth row ---
  if (scanlineIntensity > 0) {
    ctx.fillStyle = `rgba(0,0,0,${scanlineIntensity})`
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1)
    }
  }

  // --- Phosphor aperture grille: RGB subpixel masking ---
  if (phosphorIntensity > 0) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const data = imageData.data
    const dpr = window.devicePixelRatio || 1
    const pixelWidth = Math.ceil(width * dpr)

    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % pixelWidth
      const subpixel = px % 3

      // Reduce channels based on subpixel position
      const reduction = phosphorIntensity
      if (subpixel === 0) {
        data[i + 1] = Math.round(data[i + 1] * (1 - reduction)) // reduce G
        data[i + 2] = Math.round(data[i + 2] * (1 - reduction)) // reduce B
      } else if (subpixel === 1) {
        data[i]     = Math.round(data[i] * (1 - reduction))     // reduce R
        data[i + 2] = Math.round(data[i + 2] * (1 - reduction)) // reduce B
      } else {
        data[i]     = Math.round(data[i] * (1 - reduction))     // reduce R
        data[i + 1] = Math.round(data[i + 1] * (1 - reduction)) // reduce G
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }

  // --- Radial vignette ---
  if (vignetteStrength > 0) {
    const gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.5, width * 0.2,
      width * 0.5, height * 0.5, width * 0.8,
    )
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, `rgba(0,0,0,${vignetteStrength})`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  // --- Barrel distortion border ---
  if (barrelAmount > 0) {
    const bw = width * barrelAmount
    const bh = height * barrelAmount

    ctx.fillStyle = '#000'
    // Top and bottom curved borders
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(width * 0.5, bh, width, 0)
    ctx.lineTo(width, 0)
    ctx.lineTo(0, 0)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.quadraticCurveTo(width * 0.5, height - bh, width, height)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.fill()

    // Left and right curved borders
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(bw, height * 0.5, 0, height)
    ctx.lineTo(0, height)
    ctx.lineTo(0, 0)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(width, 0)
    ctx.quadraticCurveTo(width - bw, height * 0.5, width, height)
    ctx.lineTo(width, height)
    ctx.lineTo(width, 0)
    ctx.fill()
  }

  // --- Temporal flicker ---
  if (flickerAmount > 0) {
    const flicker = (Math.sin(time * 60) * 0.5 + 0.5) * flickerAmount
    ctx.fillStyle = `rgba(0,0,0,${flicker})`
    ctx.fillRect(0, 0, width, height)
  }
}
```

### Matrix Rain Overlay

Post-render matrix rain drawn on top of existing content. See `generative.md` for the standalone version; this is the overlay variant.

```typescript
function applyMatrixRainOverlay(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number,
  options?: {
    density?: number  // 0 to 1, default 0.3
    speed?: number
    color?: string    // default 'rgba(0,255,65,'
    fontSize?: number
  },
): void {
  const density = options?.density ?? 0.3
  const speed = options?.speed ?? 1
  const colorBase = options?.color ?? 'rgba(0,255,65,'
  const fontSize = options?.fontSize ?? 12

  const cols = Math.ceil(width / fontSize)
  const charset = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂABCDEFGHIJK0123456789'

  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'

  for (let col = 0; col < cols; col++) {
    // Only render a fraction of columns based on density
    const h = ((col * 2654435761) >>> 0) / 4294967296
    if (h > density) continue

    const colSpeed = 0.5 + ((col * 374761393) >>> 0) / 4294967296
    const trailLen = 8 + Math.floor(((col * 668265263) >>> 0) / 4294967296 * 15)
    const offset = ((col * 123456789) >>> 0) / 4294967296 * 50

    const headY = ((time * speed * colSpeed * 8 + offset) % (height / fontSize + trailLen)) - trailLen

    for (let i = 0; i < trailLen; i++) {
      const cellY = Math.floor(headY) - i
      if (cellY < 0 || cellY * fontSize >= height) continue

      const alpha = (1 - i / trailLen) * 0.6
      const charIdx = Math.floor(((col * 100 + cellY + Math.floor(time * 8)) * 2654435761 >>> 0) / 4294967296 * charset.length)

      ctx.fillStyle = i === 0
        ? 'rgba(180,255,180,0.8)'
        : `${colorBase}${alpha.toFixed(2)})`
      ctx.fillText(charset[charIdx], col * fontSize, cellY * fontSize)
    }
  }
}
```

---

## 4. Post-Processing Shaders

Canvas 2D approximations of GPU post-processing effects.

### Bloom

Downsample, threshold, multi-pass box blur, upsample, additive blend.

```typescript
function applyBloom(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  threshold: number = 0.6,
  intensity: number = 0.3,
  passes: number = 3,
): void {
  // Create offscreen canvas at 1/4 resolution
  const bw = Math.ceil(width / 4)
  const bh = Math.ceil(height / 4)
  const bloomCanvas = document.createElement('canvas')
  bloomCanvas.width = bw
  bloomCanvas.height = bh
  const bctx = bloomCanvas.getContext('2d')!

  // Downsample
  bctx.drawImage(ctx.canvas, 0, 0, width, height, 0, 0, bw, bh)

  // Threshold — zero out pixels below threshold
  const imageData = bctx.getImageData(0, 0, bw, bh)
  const data = imageData.data
  const thresholdByte = Math.round(threshold * 255)
  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
    if (lum < thresholdByte) {
      data[i] = data[i + 1] = data[i + 2] = 0
    }
  }
  bctx.putImageData(imageData, 0, 0)

  // Multi-pass box blur via CSS filter
  for (let p = 0; p < passes; p++) {
    const tmp = document.createElement('canvas')
    tmp.width = bw; tmp.height = bh
    const tc = tmp.getContext('2d')!
    tc.filter = 'blur(4px)'
    tc.drawImage(bloomCanvas, 0, 0)
    bctx.clearRect(0, 0, bw, bh)
    bctx.drawImage(tmp, 0, 0)
  }

  // Upsample and additive blend
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = intensity
  ctx.drawImage(bloomCanvas, 0, 0, bw, bh, 0, 0, width, height)
  ctx.restore()
}
```

### Vignette

Radial darkening cached per resolution.

```typescript
const vignetteCache = new Map<string, CanvasGradient>()

function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  strength: number = 0.5,
): void {
  const key = `${width}x${height}x${strength}`

  if (!vignetteCache.has(key)) {
    const gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.5, Math.min(width, height) * 0.3,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7,
    )
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, `rgba(0,0,0,${strength})`)
    vignetteCache.set(key, gradient)
  }

  ctx.fillStyle = vignetteCache.get(key)!
  ctx.fillRect(0, 0, width, height)
}
```

### Scanlines

Darken every other row by a configurable intensity.

```typescript
function applyScanlines(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  intensity: number = 0.15,
  gap: number = 2,
): void {
  ctx.fillStyle = `rgba(0,0,0,${intensity})`
  for (let y = 0; y < height; y += gap) {
    ctx.fillRect(0, y, width, 1)
  }
}
```

### Film Grain

Half-resolution random noise tiled up for performance.

```typescript
function applyFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  intensity: number = 0.08,
  time: number = 0,
): void {
  // Generate noise tile at half resolution
  const tw = Math.ceil(width / 2)
  const th = Math.ceil(height / 2)
  const grainCanvas = document.createElement('canvas')
  grainCanvas.width = tw; grainCanvas.height = th
  const gctx = grainCanvas.getContext('2d')!

  const imageData = gctx.createImageData(tw, th)
  const data = imageData.data
  // Seed with time for temporal variation
  let seed = (Math.floor(time * 60) * 2654435761) >>> 0

  for (let i = 0; i < data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const noise = (seed >>> 16) & 0xff
    data[i] = data[i + 1] = data[i + 2] = noise
    data[i + 3] = Math.round(intensity * 255)
  }
  gctx.putImageData(imageData, 0, 0)

  // Tile up to full resolution
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.drawImage(grainCanvas, 0, 0, tw, th, 0, 0, width, height)
  ctx.restore()
}
```

### Chromatic Aberration

Shift R channel right and B channel left by N pixels.

```typescript
function applyChromaticAberration(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  offset: number = 2,
): void {
  const dpr = window.devicePixelRatio || 1
  const pw = Math.ceil(width * dpr)
  const ph = Math.ceil(height * dpr)
  const imageData = ctx.getImageData(0, 0, pw, ph)
  const src = new Uint8ClampedArray(imageData.data)
  const dst = imageData.data
  const shift = Math.round(offset * dpr)

  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const i = (y * pw + x) * 4

      // Red channel shifted right
      const rxSrc = Math.min(pw - 1, x + shift)
      const ri = (y * pw + rxSrc) * 4
      dst[i] = src[ri]

      // Green stays in place
      dst[i + 1] = src[i + 1]

      // Blue channel shifted left
      const bxSrc = Math.max(0, x - shift)
      const bi = (y * pw + bxSrc) * 4
      dst[i + 2] = src[bi + 2]

      dst[i + 3] = src[i + 3]
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
```

### Color Grade

Per-channel RGB multiplication for tinting.

```typescript
function applyColorGrade(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  rMul: number = 1, gMul: number = 1, bMul: number = 1,
): void {
  const dpr = window.devicePixelRatio || 1
  const pw = Math.ceil(width * dpr)
  const ph = Math.ceil(height * dpr)
  const imageData = ctx.getImageData(0, 0, pw, ph)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.min(255, Math.round(data[i] * rMul))
    data[i + 1] = Math.min(255, Math.round(data[i + 1] * gMul))
    data[i + 2] = Math.min(255, Math.round(data[i + 2] * bMul))
  }

  ctx.putImageData(imageData, 0, 0)
}
```

---

## 5. BG Dither Pass

Bayer 4x4 ordered dithering with temporal drift for animated background dots. Creates subtle textured dots in the background between characters.

### Bayer 4x4 Matrix

```typescript
const BAYER_4X4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
]
```

### BG Dither Renderer

```typescript
interface BGDitherConfig {
  coverage: number      // 0 to 1, fraction of cells that get dots, default 0.3
  dotSize: number       // pixel size of dots, default 1.5
  driftSpeed: number    // temporal drift speed, default 0.5
  tintColor?: [number, number, number] // optional color tint, default uses style color
}

function renderBGDither(
  ctx: CanvasRenderingContext2D,
  cols: number, rows: number,
  cellWidth: number, cellHeight: number,
  time: number,
  config: BGDitherConfig,
): void {
  const { coverage, dotSize, driftSpeed, tintColor } = config

  // Coverage threshold from Bayer: how many of the 16 levels to fill
  const threshold = Math.floor(coverage * 16)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Temporal drift shifts the Bayer lookup over time
      const drift = Math.floor(time * driftSpeed * 4)
      const bx = (x + drift) & 3
      const by = (y + Math.floor(drift * 0.7)) & 3
      const bayerValue = BAYER_4X4[by * 4 + bx]

      if (bayerValue >= threshold) continue

      // Dot brightness varies with Bayer position
      const dotBright = 0.05 + (bayerValue / 15) * 0.1

      const cx = x * cellWidth + cellWidth * 0.5
      const cy = y * cellHeight + cellHeight * 0.5

      if (tintColor) {
        const [r, g, b] = tintColor
        ctx.fillStyle = `rgba(${r},${g},${b},${dotBright})`
      } else {
        const v = Math.round(dotBright * 255)
        ctx.fillStyle = `rgba(${v},${v},${v},0.5)`
      }

      ctx.beginPath()
      ctx.arc(cx, cy, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
```

### Style-Specific Tint Colors

```typescript
const BG_DITHER_TINTS: Record<string, [number, number, number]> = {
  classic:   [128, 128, 128],
  halftone:  [100, 100, 120],
  braille:   [80, 120, 80],
  dotcross:  [110, 100, 90],
  line:      [90, 90, 110],
  particles: [140, 100, 60],
  retro:     [120, 90, 50],
  terminal:  [0, 80, 20],
  claude:    [180, 90, 10],
}
```

---

## 6. Inverse Dither Pass

Fills cells with inverted background color where coverage exceeds a threshold. Creates negative-space dot patterns.

```typescript
interface InverseDitherConfig {
  threshold: number    // brightness threshold for activation, default 0.5
  bgColor: string      // background fill color, default '#000'
  fgColor: string      // inverted cell fill color, default '#fff'
  dotRadius: number    // fill radius relative to cell, default 0.4
}

function renderInverseDither(
  ctx: CanvasRenderingContext2D,
  brightnessGrid: Float32Array,
  cols: number, rows: number,
  cellWidth: number, cellHeight: number,
  config: InverseDitherConfig,
): void {
  const { threshold, bgColor, fgColor, dotRadius } = config
  const maxR = Math.min(cellWidth, cellHeight) * 0.5 * dotRadius

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      const b = brightnessGrid[idx]

      if (b < threshold) continue

      const cx = x * cellWidth + cellWidth * 0.5
      const cy = y * cellHeight + cellHeight * 0.5

      // Coverage-proportional radius
      const coverageRatio = (b - threshold) / (1 - threshold)
      const r = maxR * coverageRatio

      ctx.fillStyle = fgColor
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
```

---

## 7. Border Glow Overlay

Edge gradient using linear and radial canvas gradients. Creates a glowing border around the canvas edge.

```typescript
interface BorderGlowConfig {
  color: string              // glow color, e.g. 'rgba(0,255,100,0.3)'
  width: number              // glow width in fraction of canvas (0 to 0.3), default 0.1
  cornerRadius: number       // corner glow radius multiplier, default 1.5
  compositeMode: GlobalCompositeOperation // default 'screen'
  invert: boolean            // use 'multiply' instead of 'screen', default false
}

function renderBorderGlow(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  config: BorderGlowConfig,
): void {
  const {
    color, width: glowWidth, cornerRadius, compositeMode, invert,
  } = config

  const gw = Math.min(width, height) * glowWidth

  ctx.save()
  ctx.globalCompositeOperation = invert ? 'multiply' : compositeMode

  // Edge gradients — four sides
  const edges: Array<{
    x0: number; y0: number; x1: number; y1: number
    rx: number; ry: number; rw: number; rh: number
  }> = [
    { x0: 0, y0: 0, x1: gw, y1: 0, rx: 0, ry: 0, rw: gw, rh: height },          // left
    { x0: width, y0: 0, x1: width - gw, y1: 0, rx: width - gw, ry: 0, rw: gw, rh: height }, // right
    { x0: 0, y0: 0, x1: 0, y1: gw, rx: 0, ry: 0, rw: width, rh: gw },            // top
    { x0: 0, y0: height, x1: 0, y1: height - gw, rx: 0, ry: height - gw, rw: width, rh: gw }, // bottom
  ]

  for (const e of edges) {
    const grad = ctx.createLinearGradient(e.x0, e.y0, e.x1, e.y1)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(e.rx, e.ry, e.rw, e.rh)
  }

  // Corner glow — radial gradients at four corners
  const cornerR = gw * cornerRadius
  const corners: [number, number][] = [
    [0, 0], [width, 0], [0, height], [width, height],
  ]

  for (const [cx, cy] of corners) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cornerR)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, cornerR, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}
```

### Per-Style Glow Colors

```typescript
const BORDER_GLOW_COLORS: Record<string, Record<string, string>> = {
  classic: {
    grayscale: 'rgba(180,180,180,0.15)',
    matrix:    'rgba(0,255,65,0.2)',
    amber:     'rgba(255,180,40,0.2)',
    neon:      'rgba(255,0,255,0.2)',
  },
  terminal: {
    default:   'rgba(0,200,50,0.25)',
  },
  retro: {
    'amber-classic': 'rgba(255,200,130,0.2)',
    'cyan-night':    'rgba(100,220,255,0.2)',
    'violet-haze':   'rgba(200,140,255,0.2)',
    'lime-pulse':    'rgba(180,255,100,0.2)',
    'mono-ice':      'rgba(220,225,255,0.15)',
  },
  claude: {
    default:   'rgba(230,120,20,0.2)',
  },
}
```

---

## FX Composition Order

Apply effects in this order for correct visual layering:

```
1. Compute brightness grid (from source or generative)
2. Pre-render FX (modify brightness grid):
   - Noise
   - Intervals
   - Beam
   - Glitch
3. BG Dither pass (draw background dots)
4. Inverse Dither pass (draw inverted background)
5. Style renderer (draw characters/shapes)
6. Post-render FX (canvas overlays):
   - CRT
   - Matrix Rain overlay
7. Post-processing shaders:
   - Bloom
   - Scanlines
   - Film Grain
   - Chromatic Aberration
   - Color Grade
   - Vignette (applied last for clean edges)
8. Border Glow overlay
```
