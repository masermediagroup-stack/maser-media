# Architecture Reference

Every generated component uses this foundation. Read this first.

## Canvas Hook Pattern

The core hook that every component needs. Handles setup, responsive resize, HiDPI, animation loop, accessibility, and cleanup.

```tsx
import { useRef, useEffect } from 'react'

function useCanvas(
  renderFn: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
  deps: unknown[] = [],
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const startTime = performance.now()
    let width = 0, height = 0

    // Responsive resize with HiDPI support
    const resize = () => {
      const parent = canvas.parentElement || canvas
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement || canvas)
    resize()

    // Accessibility: respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const frame = () => {
      const t = (performance.now() - startTime) / 1000
      renderFn(ctx, width, height, t)
      if (!prefersReduced) {
        animRef.current = requestAnimationFrame(frame)
      }
    }
    animRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, deps)

  return canvasRef
}
```

## Component Template

```tsx
'use client'
import { useRef, useEffect } from 'react'

// Usage: <AsciiBackground className="fixed inset-0 -z-10" />

interface AsciiBackgroundProps {
  charset?: string
  colorMode?: 'grayscale' | 'matrix' | 'amber' | 'sepia' | 'cool-blue' | 'neon' | 'custom'
  customColor?: string
  fontSize?: number
  speed?: number
  className?: string
  style?: React.CSSProperties
}

// --- Inline utilities (brightness, color, noise, etc.) ---
// Paste only what this specific component needs from the reference docs.

export function AsciiBackground({
  charset = ' .:-=+*#%@',
  colorMode = 'matrix',
  fontSize = 14,
  speed = 1,
  className,
  style,
}: AsciiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const startTime = performance.now()
    let w = 0, h = 0

    const resize = () => {
      const parent = canvas.parentElement || canvas
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement || canvas)
    resize()

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const render = () => {
      const t = (performance.now() - startTime) / 1000 * speed
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      // ... rendering logic here ...
      if (!prefersReduced) animRef.current = requestAnimationFrame(render)
    }
    animRef.current = requestAnimationFrame(render)

    return () => { cancelAnimationFrame(animRef.current); ro.disconnect() }
  }, [charset, colorMode, fontSize, speed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  )
}
```

## Cell Grid System

Canvas dimensions → character grid dimensions:

```typescript
const cellWidth = fontSize * characterSpacing  // default spacing = 0.6
const cellHeight = fontSize * 1.2              // line height
const cols = Math.max(1, Math.floor(width / cellWidth))
const rows = Math.max(1, Math.floor(height / cellHeight))
```

Typical grid sizes at common resolutions (fontSize=14, spacing=0.6):

| Resolution | Cell | Grid |
|-----------|------|------|
| 1920×1080 | 8.4×16.8 | 228×64 |
| 1280×720 | 8.4×16.8 | 152×42 |
| 960×540 | 8.4×16.8 | 114×32 |

## Font Setup

```typescript
ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`
ctx.textBaseline = 'top'
ctx.textAlign = 'left'
```

For retro/terminal: use `"VT323", monospace`
For modern: use `"SF Mono", "Fira Code", "Consolas", monospace`

## Performance Notes

- **Display canvas**: `getContext('2d')` — default, no special flags
- **Sampler canvas** (source mode): `getContext('2d', { willReadFrequently: true })` — optimizes `getImageData` calls
- **Grid cap**: keep `cols * rows` under ~40,000 cells for 60fps
- **Float32Array**: use for brightness grids — 4× faster than `number[]` for numeric ops
- **Module-scope LUTs**: pre-compute sRGB, Bayer matrices, permutation tables outside the render loop
- **Avoid string allocations in hot loops**: use char index lookups, not string concatenation

## Source Mode Architecture

For components that process images/video/webcam:

```typescript
// Two-canvas architecture (from Glyph's AsciiRenderer)
const displayCanvas = canvasRef.current!          // what the user sees
const displayCtx = displayCanvas.getContext('2d')!

const samplerCanvas = document.createElement('canvas')  // hidden, for pixel sampling
const samplerCtx = samplerCanvas.getContext('2d', { willReadFrequently: true })!

// Each frame:
// 1. Draw source onto sampler at grid resolution
samplerCanvas.width = cols
samplerCanvas.height = rows
samplerCtx.drawImage(source, 0, 0, sourceW, sourceH, 0, 0, cols, rows)

// 2. Read pixel data
const imageData = samplerCtx.getImageData(0, 0, cols, rows)
const data = imageData.data  // Uint8ClampedArray: [r,g,b,a, r,g,b,a, ...]

// 3. Compute brightness + color grids
const brightnessGrid = new Float32Array(cols * rows)
const colorGrid: [number, number, number][] = new Array(cols * rows)
for (let i = 0; i < cols * rows; i++) {
  const off = i * 4
  colorGrid[i] = [data[off], data[off + 1], data[off + 2]]
  brightnessGrid[i] = pixelBrightness(data[off], data[off + 1], data[off + 2])
}

// 4. Apply dithering, FX, then render characters
```

## Accessibility

- Always set `aria-hidden="true"` on decorative canvas elements
- Check `prefers-reduced-motion` — render one static frame if user prefers reduced motion
- Never auto-play audio or make the canvas the sole content (it's a background/decoration)
- For source mode with webcam: include a visible label or description
