# Dithering Algorithms Reference

All 8 dithering algorithms for the ASCII shader engine. Implementations operate on a `Float32Array` of normalized brightness values [0,1].

## Error Diffusion Framework

Shared infrastructure for all diffusion-based dithering algorithms. Each algorithm defines a kernel of offsets and weights that determine how quantization error spreads to neighboring pixels.

```typescript
interface DiffusionKernel {
  offsets: Array<[number, number, number]>  // [dx, dy, weight]
  divisor: number
}

function errorDiffusion(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number,
  kernel: DiffusionKernel
): Float32Array {
  const output = new Float32Array(pixels.length)
  output.set(pixels)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      const oldVal = output[idx]
      const newVal = oldVal < 0.5 ? 0 : 1
      output[idx] = newVal

      const error = (oldVal - newVal) * strength

      for (const [dx, dy, weight] of kernel.offsets) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          output[ny * w + nx] += (error * weight) / kernel.divisor
        }
      }
    }
  }

  return output
}
```

Key details:
- `strength` controls how much error is propagated (0 = no dithering, 1 = full dithering).
- Threshold is fixed at 0.5 — each pixel becomes black (0) or white (1).
- Error diffuses forward and downward only, so a single left-to-right top-to-bottom pass is sufficient.

## Diffusion Kernels

### Floyd-Steinberg

The classic. Good balance of quality and speed. Produces moderate texture with minimal directional artifacts.

```typescript
const FLOYD_STEINBERG: DiffusionKernel = {
  offsets: [
    [1, 0, 7],
    [-1, 1, 3],
    [0, 1, 5],
    [1, 1, 1],
  ],
  divisor: 16,
}
```

### Jarvis-Judice-Ninke

Larger kernel (12 neighbors, 2 rows deep). Smoother gradients, less noise than Floyd-Steinberg. Slower due to wider diffusion.

```typescript
const JARVIS_JUDICE_NINKE: DiffusionKernel = {
  offsets: [
    [1, 0, 7],
    [2, 0, 5],
    [-2, 1, 3],
    [-1, 1, 5],
    [0, 1, 7],
    [1, 1, 5],
    [2, 1, 3],
    [-2, 2, 1],
    [-1, 2, 3],
    [0, 2, 5],
    [1, 2, 3],
    [2, 2, 1],
  ],
  divisor: 48,
}
```

### Stucki

Similar spread to Jarvis but with different weighting. Slightly sharper edges, crisper midtones.

```typescript
const STUCKI: DiffusionKernel = {
  offsets: [
    [1, 0, 8],
    [2, 0, 4],
    [-2, 1, 2],
    [-1, 1, 4],
    [0, 1, 8],
    [1, 1, 4],
    [2, 1, 2],
    [-2, 2, 1],
    [-1, 2, 2],
    [0, 2, 4],
    [1, 2, 2],
    [2, 2, 1],
  ],
  divisor: 42,
}
```

### Atkinson

Spreads only 6/8 of the error (75%), giving a lighter overall appearance. The "lost" 25% creates a distinctive high-contrast aesthetic associated with classic Mac graphics.

```typescript
const ATKINSON: DiffusionKernel = {
  offsets: [
    [1, 0, 1],
    [2, 0, 1],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
    [0, 2, 1],
  ],
  divisor: 8,
}
```

### Sierra (Full)

Wide 10-neighbor kernel. Very smooth gradients, good for photographic images.

```typescript
const SIERRA: DiffusionKernel = {
  offsets: [
    [1, 0, 5],
    [2, 0, 3],
    [-2, 1, 2],
    [-1, 1, 4],
    [0, 1, 5],
    [1, 1, 4],
    [2, 1, 2],
    [-1, 2, 2],
    [0, 2, 3],
    [1, 2, 2],
  ],
  divisor: 32,
}
```

### Sierra-Lite

Minimal 3-neighbor kernel — fastest diffusion algorithm. Slightly noisier than Floyd-Steinberg but nearly 2x faster for large grids.

```typescript
const SIERRA_LITE: DiffusionKernel = {
  offsets: [
    [1, 0, 2],
    [0, 1, 1],
    [-1, 1, 1],
  ],
  divisor: 4,
}
```

### Kernel Lookup

```typescript
const DIFFUSION_KERNELS: Record<string, DiffusionKernel> = {
  'floyd-steinberg': FLOYD_STEINBERG,
  'jarvis-judice-ninke': JARVIS_JUDICE_NINKE,
  'stucki': STUCKI,
  'atkinson': ATKINSON,
  'sierra': SIERRA,
  'sierra-lite': SIERRA_LITE,
}
```

## Bayer Ordered Dithering (8x8)

Threshold-based dithering using a fixed Bayer matrix. No error propagation — each pixel is independently compared against a position-dependent threshold. This makes it parallelizable and artifact-free for animation (no temporal flickering from error diffusion).

### 8x8 Matrix

```typescript
const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]
```

### 8x8 Dithering Implementation

```typescript
function bayerDither8x8(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number
): Float32Array {
  const output = new Float32Array(pixels.length)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      const threshold = (BAYER_8X8[y & 7][x & 7] / 64 - 0.5) * strength
      const val = pixels[idx] + threshold
      output[idx] = Math.max(0, Math.min(1, val))
    }
  }

  return output
}
```

The `& 7` wraps coordinates into the 8x8 tile, creating a seamless repeating pattern. Unlike error diffusion which produces binary 0/1, Bayer dithering preserves continuous values — the threshold offsets the brightness, and clamping keeps it in [0,1]. This is intentional: the ASCII char mapper handles the final quantization to discrete characters.

## Bayer 4x4 (Background Dithering)

Smaller matrix for lightweight background dithering effects — used for subtle texture on solid backgrounds or for BG color variation behind ASCII characters.

### 4x4 Matrix

```typescript
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
]
```

### 4x4 Implementation

```typescript
function bayerDither4x4(
  pixels: Float32Array,
  w: number,
  h: number,
  strength: number
): Float32Array {
  const output = new Float32Array(pixels.length)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      const threshold = (BAYER_4X4[y & 3][x & 3] / 16 - 0.5) * strength
      const val = pixels[idx] + threshold
      output[idx] = Math.max(0, Math.min(1, val))
    }
  }

  return output
}
```

### Background Color Dithering

Apply 4x4 Bayer to two background colors for a subtle texture effect behind the character grid.

```typescript
function getBgDitherColor(
  x: number,
  y: number,
  brightness: number,
  bgDark: string,
  bgLight: string,
  strength: number
): string {
  const threshold = BAYER_4X4[y & 3][x & 3] / 16
  const dithered = brightness + (threshold - 0.5) * strength
  return dithered > 0.5 ? bgLight : bgDark
}
```

## Unified Dither Dispatcher

```typescript
type DitherAlgorithm =
  | 'none'
  | 'floyd-steinberg'
  | 'jarvis-judice-ninke'
  | 'stucki'
  | 'atkinson'
  | 'sierra'
  | 'sierra-lite'
  | 'bayer'

function applyDithering(
  pixels: Float32Array,
  w: number,
  h: number,
  algorithm: DitherAlgorithm,
  strength: number
): Float32Array {
  if (algorithm === 'none' || strength <= 0) {
    return new Float32Array(pixels)
  }

  if (algorithm === 'bayer') {
    return bayerDither8x8(pixels, w, h, strength)
  }

  const kernel = DIFFUSION_KERNELS[algorithm]
  if (!kernel) {
    return new Float32Array(pixels)
  }

  return errorDiffusion(pixels, w, h, strength, kernel)
}
```

## Algorithm Comparison Guide

| Algorithm | Speed | Quality | Best For |
|-----------|-------|---------|----------|
| **Floyd-Steinberg** | Fast | Good | General purpose, real-time video |
| **Jarvis-Judice-Ninke** | Slow | Excellent | Static images, photographic content |
| **Stucki** | Slow | Excellent | Sharp edges, technical diagrams |
| **Atkinson** | Fast | Stylized | Retro Mac aesthetic, high-contrast art |
| **Sierra** | Medium | Very Good | Smooth gradients, portraits |
| **Sierra-Lite** | Very Fast | Decent | Real-time video, large grids, performance-critical |
| **Bayer 8x8** | Fastest | Patterned | Animation (no temporal flicker), retro game aesthetic |
| **Bayer 4x4** | Fastest | Coarse | Background textures, subtle dither overlays |

### When to Use What

- **Real-time video/webcam at 30fps**: Sierra-Lite or Bayer. Error diffusion kernels with >6 offsets will cause frame drops on large grids.
- **Static image conversion**: Jarvis-Judice-Ninke or Stucki for maximum quality.
- **Animated generative art**: Bayer. Error diffusion causes temporal instability — nearby pixels shift between frames, creating shimmer. Bayer thresholds are spatially fixed, so animation is stable.
- **Retro/vintage aesthetic**: Atkinson for classic Mac look, Bayer for pixel-art/game vibe.
- **Smooth gradients**: Sierra or Jarvis-Judice-Ninke. Their wide kernels minimize banding.
- **High contrast / text-heavy content**: Floyd-Steinberg or Stucki. They preserve edge sharpness.
- **Background dither only (not char dither)**: Bayer 4x4 with low strength (0.1-0.3).

### Strength Recommendations

- `0.0` — No dithering (continuous grayscale mapped directly to chars).
- `0.1–0.3` — Subtle texture, barely visible. Good for backgrounds.
- `0.5` — Moderate dithering. Good default for most content.
- `0.7–0.8` — Strong dithering. Clear stipple pattern visible.
- `1.0` — Full dithering. Maximum error propagation / threshold offset.
- `>1.0` — Overdrive. Creates exaggerated noise/texture, can be an artistic effect.
