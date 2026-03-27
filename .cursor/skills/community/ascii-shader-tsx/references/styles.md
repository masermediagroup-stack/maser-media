# Art Style Renderers Reference

All 9 art style renderers from the Glyph engine. Each renderer takes a RenderContext and draws the full character grid onto the canvas.

## RenderContext Interface

```typescript
interface RenderContext {
  ctx: CanvasRenderingContext2D
  brightnessGrid: Float32Array
  colorGrid: Array<[number, number, number]>
  cols: number
  rows: number
  cellWidth: number
  cellHeight: number
  time: number
  mouseX: number  // normalized 0-1, -1 if no mouse
  mouseY: number  // normalized 0-1, -1 if no mouse
  chars: string
  colorMode: ColorMode
  customColor?: string
  fontSize: number
  invert: boolean
  vignetteStrength: number
  edgeBoost: number
  brightness: number
  contrast: number
}
```

All renderers assume these utilities are available in scope (from `rendering.md`):
- `SRGB_LUT`, `pixelBrightness`, `adjustBrightness`, `getCharForBrightness`
- `getColorForMode`, `getVignetteFactor`, `getLocalEdgeContrast`
- `getRetroColor`, `getTerminalColor`, `RETRO_PALETTES`

---

## 1. Classic

Brightness-to-character mapping. The foundational renderer — maps each cell's brightness to a character from the charset, colors it according to the active color mode, and applies vignette darkening and mouse-interactive offset.

```typescript
function renderClassic(rc: RenderContext): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, time, mouseX, mouseY,
    chars, colorMode, customColor, fontSize,
    invert, vignetteStrength, brightness, contrast, edgeBoost,
  } = rc

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]

      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (edgeBoost > 0) {
        const edge = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)
        b = Math.min(1, b + edge * edgeBoost)
      }

      if (invert) b = 1 - b

      const char = getCharForBrightness(b, chars)
      if (char === ' ') continue

      const [r, g, bl] = colorGrid[idx]
      const gray = Math.round(b * 255)
      const color = getColorForMode(colorMode, {
        r, g, b: bl, gray, brightness: b, customColor,
      })

      // Mouse offset — characters subtly shift toward/away from cursor
      let ox = 0, oy = 0
      if (mouseX >= 0 && mouseY >= 0) {
        const cx = (x + 0.5) / cols
        const cy = (y + 0.5) / rows
        const dx = mouseX - cx
        const dy = mouseY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const falloff = Math.max(0, 1 - dist * 4)
        const strength = falloff * cellWidth * 0.3
        ox = dx * strength
        oy = dy * strength
      }

      ctx.fillStyle = color
      ctx.fillText(char, x * cellWidth + ox, y * cellHeight + oy)
    }
  }
}
```

---

## 2. Halftone

Geometric shapes sized by brightness. Each cell draws a shape (circle, square, diamond, pentagon, hexagon) whose radius is proportional to cell brightness. A screen interference pattern adds visual texture.

### Helper: Regular Polygon

```typescript
function drawRegularPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, sides: number,
  rotation: number,
): void {
  if (sides < 3 || radius <= 0) return
  ctx.beginPath()
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + rotation
    const px = cx + Math.cos(angle) * radius
    const py = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}
```

### Screen Interference Pattern

Computes a per-cell dot-level modulation that creates a moiré-like screen texture:

```typescript
function getScreenLevel(x: number, y: number): number {
  return (
    Math.sin(x * 0.82 + y * 0.33) * 1.55 +
    Math.cos(x * 0.27 - y * 0.94) * 1.25 +
    2
  ) * 0.25
}
```

### Halftone Props

```typescript
interface HalftoneConfig {
  halftoneShape: 'circle' | 'square' | 'diamond' | 'pentagon' | 'hexagon'
  halftoneSize: number     // 0.4 to 2.2, default 1.0
  halftoneRotation: number // -180 to 180 degrees, default 0
}
```

### Renderer

```typescript
function renderHalftone(rc: RenderContext, config: HalftoneConfig): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, time, mouseX, mouseY,
    colorMode, customColor, invert, vignetteStrength,
    brightness, contrast,
  } = rc
  const { halftoneShape, halftoneSize, halftoneRotation } = config
  const rotRad = (halftoneRotation * Math.PI) / 180

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (invert) b = 1 - b

      // Screen interference modulates dot size
      const screen = getScreenLevel(x, y)
      const dotLevel = b * screen
      if (dotLevel < 0.02) continue

      const cx = x * cellWidth + cellWidth * 0.5
      const cy = y * cellHeight + cellHeight * 0.5
      const maxRadius = Math.min(cellWidth, cellHeight) * 0.5 * halftoneSize
      const radius = maxRadius * Math.sqrt(dotLevel)

      if (radius < 0.5) continue

      const [r, g, bl] = colorGrid[idx]
      const gray = Math.round(b * 255)
      const color = getColorForMode(colorMode, {
        r, g, b: bl, gray, brightness: b, customColor,
      })
      ctx.fillStyle = color

      switch (halftoneShape) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'square':
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(rotRad)
          const side = radius * 2
          ctx.fillRect(-side * 0.5, -side * 0.5, side, side)
          ctx.restore()
          break

        case 'diamond':
          drawRegularPolygon(ctx, cx, cy, radius, 4, Math.PI / 4 + rotRad)
          break

        case 'pentagon':
          drawRegularPolygon(ctx, cx, cy, radius, 5, -Math.PI / 2 + rotRad)
          break

        case 'hexagon':
          drawRegularPolygon(ctx, cx, cy, radius, 6, rotRad)
          break
      }
    }
  }
}
```

---

## 3. Braille

Unicode braille patterns (U+2800 to U+283F, 64 characters). Edge-contrast boosted brightness with variant-specific bias and screen pattern modulation.

### Braille Character Set

```typescript
const BRAILLE_CHARS =
  '⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏' +
  '⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟' +
  '⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯' +
  '⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿'

type BrailleVariant = 'standard' | 'dense' | 'sparse'
```

### Renderer

```typescript
function renderBraille(rc: RenderContext, variant: BrailleVariant = 'standard'): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, colorMode, customColor,
    fontSize, invert, vignetteStrength, brightness, contrast,
  } = rc

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  // Variant bias shifts brightness toward denser or sparser patterns
  const variantBias = variant === 'dense' ? 0.11 : variant === 'sparse' ? -0.08 : 0

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      // Edge contrast boost for detail preservation
      const edge = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)
      b = Math.min(1, b + edge * 0.15)

      b = Math.max(0, Math.min(1, b + variantBias))

      if (invert) b = 1 - b

      // Screen pattern + concentration for character selection
      const screen = getScreenLevel(x, y)
      const concentration = 0.5 + Math.sin(x * 0.4 + y * 0.6) * 0.15
      const adjusted = b * screen * (0.6 + concentration * 0.8)
      const charIdx = Math.max(0, Math.min(63, Math.floor(adjusted * 63)))
      const char = BRAILLE_CHARS[charIdx]

      if (char === '⠀') continue

      const [r, g, bl] = colorGrid[idx]
      const gray = Math.round(b * 255)
      const color = getColorForMode(colorMode, {
        r, g, b: bl, gray, brightness: b, customColor,
      })

      ctx.fillStyle = color
      ctx.fillText(char, x * cellWidth, y * cellHeight)
    }
  }
}
```

---

## 4. DotCross

Dual character ramps that switch between dot patterns for smooth areas and cross/hash patterns for edges. A weave pattern creates smooth spatial transitions between the two ramps.

```typescript
const DOT_RAMP   = '  .\u00B7:oO'   // '  .·:oO'
const CROSS_RAMP = '  \u00B7+xX#'   // '  ·+xX#'

function renderDotCross(rc: RenderContext): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, colorMode, customColor,
    fontSize, invert, vignetteStrength, brightness, contrast,
  } = rc

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (invert) b = 1 - b

      const edge = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)

      // Weave pattern for smooth spatial transitions between ramps
      const weave = (Math.sin(x * 1.2 + y * 0.8) * 0.5 + 0.5) * 0.3

      // Cross ramp for edges, dot ramp for smooth areas
      // Edge threshold blended with weave for organic transition
      const crossWeight = Math.min(1, edge * 2.5 + weave)

      const charIndex = Math.max(0, Math.min(6, Math.floor(b * 6)))

      let char: string
      if (crossWeight > 0.5) {
        char = CROSS_RAMP[charIndex]
      } else {
        char = DOT_RAMP[charIndex]
      }

      if (char === ' ') continue

      const [r, g, bl] = colorGrid[idx]
      const gray = Math.round(b * 255)
      const color = getColorForMode(colorMode, {
        r, g, b: bl, gray, brightness: b, customColor,
      })

      ctx.fillStyle = color
      ctx.fillText(char, x * cellWidth, y * cellHeight)
    }
  }
}
```

---

## 5. Line

Vectorized line segments. Each cell draws a line from its center, rotated by a screen pattern plus configurable rotation. Line length is proportional to brightness.

### Line Props

```typescript
interface LineConfig {
  lineLength: number    // 0.1 to 2.5, default 1.0
  lineWidth: number     // 0.2 to 2.5, default 1.0 (horizontal scale)
  lineThickness: number // 0.2 to 8, default 1.5
  lineRotation: number  // degrees, default 0
}
```

### Renderer

```typescript
function renderLine(rc: RenderContext, config: LineConfig): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, colorMode, customColor,
    invert, vignetteStrength, brightness, contrast,
  } = rc
  const { lineLength, lineWidth, lineThickness, lineRotation } = config
  const baseRotRad = (lineRotation * Math.PI) / 180

  ctx.lineCap = 'round'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (invert) b = 1 - b
      if (b < 0.02) continue

      const cx = x * cellWidth + cellWidth * 0.5
      const cy = y * cellHeight + cellHeight * 0.5

      // Screen pattern adds per-cell rotation variation
      const screenAngle = Math.sin(x * 0.7 + y * 0.5) * 0.8 +
                          Math.cos(x * 0.3 - y * 0.9) * 0.6
      const angle = baseRotRad + screenAngle

      // Line length proportional to brightness
      const halfLen = b * Math.min(cellWidth, cellHeight) * 0.5 * lineLength

      const dx = Math.cos(angle) * halfLen
      const dy = Math.sin(angle) * halfLen

      const [r, g, bl] = colorGrid[idx]
      const gray = Math.round(b * 255)
      const color = getColorForMode(colorMode, {
        r, g, b: bl, gray, brightness: b, customColor,
      })

      ctx.strokeStyle = color
      ctx.lineWidth = lineThickness * b

      ctx.beginPath()
      ctx.moveTo(cx - dx, cy - dy)
      ctx.lineTo(cx + dx, cy + dy)
      ctx.stroke()
    }
  }
}
```

---

## 6. Particles

Radiant particle spray. Threshold-based rendering where center bias, edge contrast, density, and pseudo-random grain determine which cells receive a character. Particles near edges and center get a glow boost.

### Particle Props

```typescript
interface ParticleConfig {
  particleDensity: number // 0.05 to 1, default 0.5
  particleChar: string    // default '*'
}
```

### Renderer

```typescript
function renderParticles(rc: RenderContext, config: ParticleConfig): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, time, colorMode, customColor,
    fontSize, invert, vignetteStrength, brightness, contrast,
  } = rc
  const { particleDensity, particleChar } = config

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (invert) b = 1 - b

      // Center bias — particles more likely near center
      const nx = (x / cols) * 2 - 1
      const ny = (y / rows) * 2 - 1
      const centerBias = 1 - Math.sqrt(nx * nx + ny * ny) * 0.5

      // Edge contrast
      const edge = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)

      // Pseudo-random grain seeded by position and time
      const grain = ((x * 2654435761 + y * 340573321 + Math.floor(time * 30)) & 0xffff) / 0xffff

      // Threshold determines if this cell gets a particle
      const threshold = centerBias * 0.3 + edge * 0.25 + b * 0.35 + grain * 0.1
      if (threshold < (1 - particleDensity)) continue

      // Color with center glow and edge glow boost
      const [r, g, bl] = colorGrid[idx]
      const gray = Math.round(b * 255)
      let color: string

      const glowBoost = centerBias * 0.15 + edge * 0.2
      const boostedB = Math.min(1, b + glowBoost)
      const boostedGray = Math.round(boostedB * 255)

      color = getColorForMode(colorMode, {
        r: Math.min(255, r + Math.round(glowBoost * 60)),
        g: Math.min(255, g + Math.round(glowBoost * 60)),
        b: Math.min(255, bl + Math.round(glowBoost * 60)),
        gray: boostedGray,
        brightness: boostedB,
        customColor,
      })

      ctx.fillStyle = color
      ctx.fillText(particleChar, x * cellWidth, y * cellHeight)
    }
  }
}
```

---

## 7. Retro

Duotone palettes with grain, posterization, and gamma correction. Character selection uses gamma 0.78 with grain jitter and band quantization. Color comes from `getRetroColor` which interpolates between duotone palette endpoints with vignette, grain, and shimmer.

### Retro Props

```typescript
interface RetroConfig {
  retroNoise: number        // 0 to 1, default 0.15
  retroDuotone: string      // palette name, default 'amber-classic'
}
```

### 5 Duotone Presets

| Name | Low (dark) | High (bright) | Vibe |
|------|-----------|---------------|------|
| `amber-classic` | `[20,12,6]` | `[255,223,178]` | Warm CRT amber |
| `cyan-night` | `[6,16,22]` | `[166,240,255]` | Cold night monitor |
| `violet-haze` | `[17,10,26]` | `[242,198,255]` | Purple haze / vapor |
| `lime-pulse` | `[10,18,8]` | `[226,255,162]` | Green terminal neon |
| `mono-ice` | `[12,12,12]` | `[245,248,255]` | Near-monochrome ice |

### Renderer

```typescript
function renderRetro(rc: RenderContext, config: RetroConfig): void {
  const {
    ctx, brightnessGrid, colorGrid, cols, rows,
    cellWidth, cellHeight, time, chars, fontSize,
    invert, vignetteStrength, brightness, contrast,
  } = rc
  const { retroNoise, retroDuotone } = config

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  // Number of quantization bands for posterization
  const numBands = Math.max(2, chars.length)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (invert) b = 1 - b

      // Gamma 0.78 for character selection — lifts shadows
      let charB = Math.pow(Math.max(0, b), 0.78)

      // Grain jitter
      const grainSeed = (x * 2654435761 + y * 340573321 + Math.floor(time * 60)) & 0xffffff
      const grain = ((grainSeed / 0xffffff) - 0.5) * 2 * retroNoise
      charB = Math.max(0, Math.min(1, charB + grain * 0.15))

      // Band quantization (posterization)
      const band = Math.floor(charB * numBands)
      const quantized = Math.min(1, band / (numBands - 1))

      const char = getCharForBrightness(quantized, chars)
      if (char === ' ') continue

      // Retro duotone color with vignette, grain, shimmer
      const color = getRetroColor(b, retroDuotone, x, y, cols, rows, time, {
        vignetteStrength,
        grainAmount: retroNoise * 0.3,
        shimmerSpeed: 1.0,
      })

      ctx.fillStyle = color
      ctx.fillText(char, x * cellWidth, y * cellHeight)
    }
  }
}
```

---

## 8. Terminal

Green phosphor monospace. Uses gamma 0.82 for character selection and green phosphor color with scanline alternation. Always renders in VT323 monospace font. Five terminal charsets provide different aesthetic flavors.

### 5 Terminal Charsets

```typescript
const TERMINAL_CHARSETS: Record<string, string> = {
  '101010':   ' 01',
  'brackets': ' []{}()<>',
  'dollar':   ' $#@!%&',
  'mixed':    ' .:;+=*#@',
  'pipes':    ' |/-\\=+#',
}
```

### Renderer

```typescript
function renderTerminal(
  rc: RenderContext,
  terminalCharset: string = 'mixed',
): void {
  const {
    ctx, brightnessGrid, cols, rows,
    cellWidth, cellHeight, fontSize,
    invert, vignetteStrength, brightness, contrast,
  } = rc

  const termChars = TERMINAL_CHARSETS[terminalCharset] ?? TERMINAL_CHARSETS['mixed']

  // VT323 is the canonical green phosphor terminal font
  ctx.font = `${fontSize}px "VT323", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (invert) b = 1 - b

      // Gamma 0.82 for character selection — slight shadow lift
      const charB = Math.pow(Math.max(0, b), 0.82)
      const char = getCharForBrightness(charB, termChars)
      if (char === ' ') continue

      // Green phosphor color with scanline alternation
      const color = getTerminalColor(b, x, y)

      ctx.fillStyle = color
      ctx.fillText(char, x * cellWidth, y * cellHeight)
    }
  }
}
```

---

## 9. Claude

Warm orange-amber brand color using the blocks charset. This style is tuned for Anthropic's brand aesthetic with a distinctive warm glow.

### Blocks Charset

```typescript
const BLOCKS_CHARSET = ' ░▒▓█'
```

### Renderer

```typescript
function renderClaude(rc: RenderContext): void {
  const {
    ctx, brightnessGrid, cols, rows,
    cellWidth, cellHeight, fontSize,
    invert, vignetteStrength, brightness, contrast,
  } = rc

  ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]
      b = adjustBrightness(b, brightness, contrast)

      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      if (invert) b = 1 - b

      const char = getCharForBrightness(b, BLOCKS_CHARSET)
      if (char === ' ') continue

      // Warm orange-amber brand color
      const gray = Math.round(b * 255)
      const intensity = gray + 36
      const r = Math.max(0, Math.min(255, Math.round(intensity * 1.03)))
      const g = Math.max(0, Math.min(255, Math.round(intensity * 0.5)))
      const bl = Math.max(0, Math.min(255, Math.round(intensity * 0.08)))

      ctx.fillStyle = `rgb(${r},${g},${bl})`
      ctx.fillText(char, x * cellWidth, y * cellHeight)
    }
  }
}
```

---

## Choosing a Style

| Style | Best for | Visual character |
|-------|----------|-----------------|
| **Classic** | General purpose, text backgrounds, image conversion | Clean monospace character grid |
| **Halftone** | Print/editorial aesthetics, geometric patterns | Ben-Day dots, newsprint feel |
| **Braille** | High-detail at small cell sizes, accessibility-adjacent aesthetic | Dense dot matrix with fine detail |
| **DotCross** | Edge-aware rendering, technical/blueprint look | Dual-texture: smooth dots + structural crosses |
| **Line** | Flow fields, directional textures, hair/fur/grass | Oriented line segments, hatch-like |
| **Particles** | Starfields, radiant effects, sparse glowing points | Scattered bright points with center glow |
| **Retro** | Film/CRT nostalgia, duotone posters, lo-fi aesthetic | Posterized with grain and color tinting |
| **Terminal** | Hacker aesthetic, data visualization, CLI decoration | Green phosphor, scanline gaps, binary data |
| **Claude** | Anthropic brand, warm ambient backgrounds | Orange-amber blocks with depth |

### Combining Styles

Styles can be layered using canvas blend modes (see `composition.md`):

```typescript
// Render a base halftone layer, then overlay particles
ctx.globalCompositeOperation = 'source-over'
renderHalftone(rc, halftoneConfig)
ctx.globalCompositeOperation = 'screen'
renderParticles(rc, particleConfig)
ctx.globalCompositeOperation = 'source-over' // reset
```

### Style + Color Mode Pairings

| Style | Recommended color modes |
|-------|------------------------|
| Classic | Any — most versatile |
| Halftone | fullcolor, neon, grayscale |
| Braille | matrix, cool-blue, grayscale |
| DotCross | grayscale, amber, sepia |
| Line | fullcolor, neon, matrix |
| Particles | neon, custom (bright), matrix |
| Retro | Uses its own duotone system (ignores colorMode) |
| Terminal | Uses its own phosphor color (ignores colorMode) |
| Claude | Uses its own brand color (ignores colorMode) |
