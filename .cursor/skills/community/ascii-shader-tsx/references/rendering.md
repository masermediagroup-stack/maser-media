# Rendering Pipeline Reference

Core rendering functions for the ASCII shader engine. All implementations are production TypeScript.

## sRGB-to-Linear LUT

Precomputed lookup table for gamma-correct brightness calculations. Build once, reuse everywhere.

```typescript
const SRGB_LUT = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const s = i / 255
  SRGB_LUT[i] = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
```

## BT.709 Perceptual Brightness

Human-perception-weighted luminance from linear RGB. Always use the LUT — never raw sRGB values.

```typescript
function pixelBrightness(r: number, g: number, b: number): number {
  return 0.2126 * SRGB_LUT[r] + 0.7152 * SRGB_LUT[g] + 0.0722 * SRGB_LUT[b]
}

function adjustBrightness(value: number, brightness: number, contrast: number): number {
  let v = value + brightness
  v = (v - 0.5) * contrast + 0.5
  return Math.max(0, Math.min(1, v))
}
```

- `brightness` is an additive offset, typically -0.5 to 0.5.
- `contrast` is a multiplicative factor around 0.5 midpoint, typically 0.5 to 2.0.

## Character-to-Brightness Mapping

Maps a normalized brightness [0,1] to a character from a sorted palette string (dark to bright).

```typescript
function getCharForBrightness(brightness: number, chars: string): string {
  if (chars.length === 0) return ' '
  const clamped = Math.max(0, Math.min(1, brightness))
  return chars[Math.floor(clamped * (chars.length - 1))]
}
```

## Color Modes

All 8 color modes. Each takes source pixel data and returns a CSS color string for the character.

### Type Definition

```typescript
type ColorMode =
  | 'grayscale'
  | 'fullcolor'
  | 'matrix'
  | 'amber'
  | 'sepia'
  | 'cool-blue'
  | 'neon'
  | 'custom'

interface ColorModeParams {
  r: number        // source red 0-255
  g: number        // source green 0-255
  b: number        // source blue 0-255
  gray: number     // computed grayscale 0-255
  brightness: number // normalized 0-1
  customColor?: string // hex color for custom mode
}
```

### Grayscale

```typescript
function getGrayscaleColor(gray: number): string {
  const g = Math.max(0, Math.min(255, Math.round(gray)))
  return `rgb(${g},${g},${g})`
}
```

### Full Color

Passes source pixel RGB directly to the character color.

```typescript
function getFullColor(r: number, g: number, b: number): string {
  return `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`
}
```

### Matrix

Green-dominant CRT aesthetic. The green channel is dominant with faint red/blue tints.

```typescript
function getMatrixColor(gray: number): string {
  const f = Math.min(255, gray + 25)
  const r = Math.max(0, Math.min(255, Math.round(f * 0.2)))
  const g = Math.max(0, Math.min(255, Math.round(f)))
  const b = Math.max(0, Math.min(255, Math.round(f * 0.3)))
  return `rgb(${r},${g},${b})`
}
```

### Amber

Warm amber/orange monochrome — classic amber CRT phosphor.

```typescript
function getAmberColor(gray: number): string {
  const f = Math.min(255, gray + 20)
  const r = Math.max(0, Math.min(255, Math.round(f)))
  const g = Math.max(0, Math.min(255, Math.round(f * 0.7)))
  const b = Math.max(0, Math.min(255, Math.round(f * 0.15)))
  return `rgb(${r},${g},${b})`
}
```

### Sepia

Warm brownish tone — aged photograph look.

```typescript
function getSepiaColor(gray: number): string {
  const f = Math.min(255, gray + 15)
  const r = Math.max(0, Math.min(255, Math.round(f * 1.1)))
  const g = Math.max(0, Math.min(255, Math.round(f * 0.85)))
  const b = Math.max(0, Math.min(255, Math.round(f * 0.65)))
  return `rgb(${r},${g},${b})`
}
```

### Cool Blue

Cold/icy blue-dominant monochrome.

```typescript
function getCoolBlueColor(gray: number): string {
  const f = Math.min(255, gray + 15)
  const r = Math.max(0, Math.min(255, Math.round(f * 0.55)))
  const g = Math.max(0, Math.min(255, Math.round(f * 0.75)))
  const b = Math.max(0, Math.min(255, Math.round(f)))
  return `rgb(${r},${g},${b})`
}
```

### Neon

HSL-cycling psychedelic color. Maps brightness to hue rotation across the spectrum.

```typescript
function getNeonColor(gray: number): string {
  const norm = gray / 255
  const hue = Math.round(norm * 300)
  const lightness = Math.round(20 + norm * 50) // 20% to 70%
  return `hsl(${hue},100%,${lightness}%)`
}
```

### Custom

User-specified hex color, modulated by pixel intensity.

```typescript
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  return { r, g, b }
}

function getCustomColor(brightness: number, hexColor: string): string {
  const { r: cr, g: cg, b: cb } = hexToRgb(hexColor)
  const i = Math.max(0, Math.min(1, brightness))
  const r = Math.max(0, Math.min(255, Math.round(cr * i)))
  const g = Math.max(0, Math.min(255, Math.round(cg * i)))
  const b = Math.max(0, Math.min(255, Math.round(cb * i)))
  return `rgb(${r},${g},${b})`
}
```

### Unified Dispatcher

```typescript
function getColorForMode(
  mode: ColorMode,
  params: ColorModeParams
): string {
  const { r, g, b, gray, brightness, customColor } = params
  switch (mode) {
    case 'grayscale':  return getGrayscaleColor(gray)
    case 'fullcolor':  return getFullColor(r, g, b)
    case 'matrix':     return getMatrixColor(gray)
    case 'amber':      return getAmberColor(gray)
    case 'sepia':      return getSepiaColor(gray)
    case 'cool-blue':  return getCoolBlueColor(gray)
    case 'neon':       return getNeonColor(gray)
    case 'custom':     return getCustomColor(brightness, customColor ?? '#00ff00')
    default:           return getGrayscaleColor(gray)
  }
}
```

## Retro Duotone Palettes

Five built-in two-tone palettes that blend between a dark (low) and bright (high) color. Used with vignette, grain, and shimmer effects for a retro CRT/film aesthetic.

### Palette Definitions

```typescript
interface DuotonePalette {
  low: [number, number, number]   // RGB for darkest value
  high: [number, number, number]  // RGB for brightest value
}

const RETRO_PALETTES: Record<string, DuotonePalette> = {
  'amber-classic': {
    low:  [20, 12, 6],
    high: [255, 223, 178],
  },
  'cyan-night': {
    low:  [6, 16, 22],
    high: [166, 240, 255],
  },
  'violet-haze': {
    low:  [17, 10, 26],
    high: [242, 198, 255],
  },
  'lime-pulse': {
    low:  [10, 18, 8],
    high: [226, 255, 162],
  },
  'mono-ice': {
    low:  [12, 12, 12],
    high: [245, 248, 255],
  },
}

type RetroPaletteName = keyof typeof RETRO_PALETTES
```

### Retro Color Function

Blends between low and high palette colors with optional vignette darkening, film grain noise, and shimmer (scanline-like brightness modulation).

```typescript
function getRetroColor(
  brightness: number,
  paletteName: RetroPaletteName,
  x: number,
  y: number,
  cols: number,
  rows: number,
  time: number,
  options?: {
    vignetteStrength?: number  // 0-1, default 0.3
    grainAmount?: number       // 0-1, default 0.05
    shimmerSpeed?: number      // default 1.0
  }
): string {
  const palette = RETRO_PALETTES[paletteName]
  if (!palette) return getGrayscaleColor(Math.round(brightness * 255))

  const vignetteStrength = options?.vignetteStrength ?? 0.3
  const grainAmount = options?.grainAmount ?? 0.05
  const shimmerSpeed = options?.shimmerSpeed ?? 1.0

  let b = Math.max(0, Math.min(1, brightness))

  // Vignette: darken edges
  const vignette = getVignetteFactor(x, y, cols, rows, vignetteStrength)
  b *= vignette

  // Film grain: pseudo-random noise seeded by position + time
  const grainSeed = (x * 2654435761 + y * 340573321 + Math.floor(time * 60)) & 0xffffff
  const grain = ((grainSeed / 0xffffff) - 0.5) * 2 * grainAmount
  b = Math.max(0, Math.min(1, b + grain))

  // Shimmer: subtle time-varying scanline brightness
  const shimmer = 1.0 + 0.02 * Math.sin(y * 0.5 + time * shimmerSpeed * 3.0)
  b = Math.max(0, Math.min(1, b * shimmer))

  // Duotone interpolation
  const [lr, lg, lb] = palette.low
  const [hr, hg, hb] = palette.high
  const r = Math.round(lr + (hr - lr) * b)
  const g = Math.round(lg + (hg - lg) * b)
  const bl = Math.round(lb + (hb - lb) * b)

  return `rgb(${r},${g},${bl})`
}
```

## Terminal Green Phosphor

Emulates a green P1 phosphor CRT with scanline interleave.

```typescript
function getTerminalColor(brightness: number, x: number, y: number): string {
  const gray = Math.round(Math.max(0, Math.min(1, brightness)) * 255)
  const phosphor = Math.min(255, gray + 32)
  const scanShade = ((x + y) & 1) === 0 ? 1 : 0.84
  const green = Math.min(255, Math.floor(phosphor * scanShade))
  return `rgb(${Math.min(72, Math.floor(green * 0.12))},${green},${Math.min(88, Math.floor(green * 0.2))})`
}
```

The checkerboard `(x + y) & 1` pattern creates alternating bright/dim cells that mimic scanline gaps. The +32 phosphor boost ensures even dark values have a faint glow.

## Edge Detection (Sobel-Like Gradient)

Computes local contrast at a grid position by sampling the 4 cardinal neighbors. Returns a value 0-1 representing edge strength. Used to enhance character detail at edges or to drive outline effects.

```typescript
function getLocalEdgeContrast(
  grid: Float32Array,
  x: number,
  y: number,
  cols: number,
  rows: number
): number {
  const idx = y * cols + x

  const left  = x > 0        ? grid[idx - 1]    : grid[idx]
  const right = x < cols - 1  ? grid[idx + 1]    : grid[idx]
  const up    = y > 0        ? grid[idx - cols]  : grid[idx]
  const down  = y < rows - 1  ? grid[idx + cols]  : grid[idx]

  const gx = Math.abs(right - left)
  const gy = Math.abs(down - up)

  return Math.min(1, Math.sqrt(gx * gx + gy * gy))
}
```

Usage: multiply edge contrast with brightness to boost character density at edges, or use it to select from an edge-specific charset (e.g. box-drawing characters for strong edges).

## Vignette Factor

Darkens edges of the frame. Returns a multiplier 0-1 where 1.0 is center and values decrease toward edges.

```typescript
function getVignetteFactor(
  x: number,
  y: number,
  cols: number,
  rows: number,
  strength: number
): number {
  if (strength <= 0) return 1.0

  const nx = (x / cols) * 2 - 1  // normalize to -1..1
  const ny = (y / rows) * 2 - 1

  const dist = Math.sqrt(nx * nx + ny * ny) / Math.SQRT2  // 0 at center, 1 at corners
  const vignette = 1 - dist * dist * strength

  return Math.max(0, Math.min(1, vignette))
}
```

## HSV to RGB

Used in generative mode for smooth color cycling and procedural palettes.

```typescript
function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
  // h: 0-360, s: 0-1, v: 0-1
  const c = v * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = v - c

  let r1: number, g1: number, b1: number

  if (hp < 1)      { r1 = c; g1 = x; b1 = 0 }
  else if (hp < 2) { r1 = x; g1 = c; b1 = 0 }
  else if (hp < 3) { r1 = 0; g1 = c; b1 = x }
  else if (hp < 4) { r1 = 0; g1 = x; b1 = c }
  else if (hp < 5) { r1 = x; g1 = 0; b1 = c }
  else             { r1 = c; g1 = 0; b1 = x }

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ]
}
```

## Full Render Pass Example

Putting it all together — a single frame render from a brightness grid to colored ASCII output.

```typescript
interface RenderConfig {
  cols: number
  rows: number
  chars: string
  colorMode: ColorMode
  customColor?: string
  brightness: number
  contrast: number
  vignetteStrength: number
  edgeBoost: number
}

interface AsciiCell {
  char: string
  color: string
}

function renderFrame(
  brightnessGrid: Float32Array,
  sourceR: Uint8Array,
  sourceG: Uint8Array,
  sourceB: Uint8Array,
  config: RenderConfig
): AsciiCell[][] {
  const { cols, rows, chars, colorMode, customColor, brightness, contrast, vignetteStrength, edgeBoost } = config
  const output: AsciiCell[][] = []

  for (let y = 0; y < rows; y++) {
    const row: AsciiCell[] = []
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      let b = brightnessGrid[idx]

      // Brightness + contrast adjustment
      b = adjustBrightness(b, brightness, contrast)

      // Vignette
      if (vignetteStrength > 0) {
        b *= getVignetteFactor(x, y, cols, rows, vignetteStrength)
      }

      // Edge boost
      if (edgeBoost > 0) {
        const edge = getLocalEdgeContrast(brightnessGrid, x, y, cols, rows)
        b = Math.min(1, b + edge * edgeBoost)
      }

      const char = getCharForBrightness(b, chars)
      const gray = Math.round(b * 255)
      const color = getColorForMode(colorMode, {
        r: sourceR[idx],
        g: sourceG[idx],
        b: sourceB[idx],
        gray,
        brightness: b,
        customColor,
      })

      row.push({ char, color })
    }
    output.push(row)
  }

  return output
}
```
