# Image Source Reference

Loading and processing images, video, and webcam for ASCII conversion. Covers the full pipeline from pixel data acquisition to grid downsampling.

## Image Loading

### From URL

```typescript
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}
```

### From File Input

```typescript
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load file: ${file.name}`))
    }
    img.src = url
  })
}
```

### Extract Pixels from HTMLImageElement

```typescript
function getImagePixels(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
  return ctx.getImageData(0, 0, targetWidth, targetHeight)
}
```

## Video Element Setup

### From URL / File

```typescript
function createVideoElement(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'

    video.oncanplaythrough = () => resolve(video)
    video.onerror = () => reject(new Error(`Failed to load video: ${src}`))

    video.src = src
  })
}
```

### Frame Capture

```typescript
function captureVideoFrame(
  video: HTMLVideoElement,
  targetWidth: number,
  targetHeight: number,
  canvas?: HTMLCanvasElement
): ImageData {
  const cvs = canvas ?? document.createElement('canvas')
  cvs.width = targetWidth
  cvs.height = targetHeight
  const ctx = cvs.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
  return ctx.getImageData(0, 0, targetWidth, targetHeight)
}
```

## Webcam Integration

### getUserMedia Setup

```typescript
async function startWebcam(
  constraints?: MediaTrackConstraints
): Promise<HTMLVideoElement> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: constraints ?? {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user',
    },
    audio: false,
  })

  const video = document.createElement('video')
  video.srcObject = stream
  video.muted = true
  video.playsInline = true

  await video.play()

  return video
}

function stopWebcam(video: HTMLVideoElement): void {
  const stream = video.srcObject as MediaStream | null
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
  video.srcObject = null
}
```

### Webcam Hook

```typescript
import { useRef, useState, useCallback, useEffect } from 'react'

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isActive: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })

      if (!videoRef.current) {
        videoRef.current = document.createElement('video')
      }

      videoRef.current.srcObject = stream
      videoRef.current.muted = true
      videoRef.current.playsInline = true
      await videoRef.current.play()
      setIsActive(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Webcam access denied')
      setIsActive(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { videoRef, isActive, error, start, stop }
}
```

## Two-Canvas Sampler Architecture

The Glyph engine uses two canvases: a **source canvas** (full resolution, receives the raw image/video frame) and a **sampler canvas** (downscaled to grid dimensions, used for pixel sampling). This avoids expensive per-cell sampling from a large source.

```typescript
interface SamplerCanvases {
  sourceCanvas: HTMLCanvasElement
  sourceCtx: CanvasRenderingContext2D
  samplerCanvas: HTMLCanvasElement
  samplerCtx: CanvasRenderingContext2D
}

function createSamplerCanvases(
  sourceWidth: number,
  sourceHeight: number,
  gridCols: number,
  gridRows: number
): SamplerCanvases {
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = sourceWidth
  sourceCanvas.height = sourceHeight
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!

  const samplerCanvas = document.createElement('canvas')
  samplerCanvas.width = gridCols
  samplerCanvas.height = gridRows
  const samplerCtx = samplerCanvas.getContext('2d', {
    willReadFrequently: true,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'medium',
  } as CanvasRenderingContext2DSettings)!

  return { sourceCanvas, sourceCtx, samplerCanvas, samplerCtx }
}
```

### Frame Pipeline

```typescript
function sampleFrame(
  sampler: SamplerCanvases,
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): ImageData {
  const { sourceCanvas, sourceCtx, samplerCanvas, samplerCtx } = sampler

  // Draw source at full resolution
  sourceCtx.drawImage(source, 0, 0, sourceCanvas.width, sourceCanvas.height)

  // Downsample to grid resolution — the browser's bilinear/bicubic interpolation
  // handles the averaging of pixels within each cell
  samplerCtx.drawImage(sourceCanvas, 0, 0, samplerCanvas.width, samplerCanvas.height)

  return samplerCtx.getImageData(0, 0, samplerCanvas.width, samplerCanvas.height)
}
```

Why two canvases: drawing directly from a large video element to a tiny sampler canvas can produce aliasing artifacts. The intermediate full-res canvas acts as a stable source buffer, and the downsample pass uses the browser's built-in interpolation.

## Grid Downsampling

Converting `ImageData` (from the sampler canvas at grid resolution) into typed arrays for the rendering pipeline.

```typescript
interface GridData {
  brightness: Float32Array  // linear brightness 0-1
  r: Uint8Array             // source red channel
  g: Uint8Array             // source green channel
  b: Uint8Array             // source blue channel
}

function imageDataToGrid(imageData: ImageData): GridData {
  const { data, width, height } = imageData
  const len = width * height

  const brightness = new Float32Array(len)
  const r = new Uint8Array(len)
  const g = new Uint8Array(len)
  const b = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    const offset = i * 4
    const pr = data[offset]
    const pg = data[offset + 1]
    const pb = data[offset + 2]

    r[i] = pr
    g[i] = pg
    b[i] = pb
    brightness[i] = pixelBrightness(pr, pg, pb)
  }

  return { brightness, r, g, b }
}
```

### Manual Grid Downsampling (Without Sampler Canvas)

For cases where you want explicit control over the averaging kernel — e.g. when applying a weighted center sample or custom filter.

```typescript
function downsampleToGrid(
  imageData: ImageData,
  gridCols: number,
  gridRows: number
): GridData {
  const { data, width, height } = imageData
  const cellW = width / gridCols
  const cellH = height / gridRows
  const len = gridCols * gridRows

  const brightness = new Float32Array(len)
  const r = new Uint8Array(len)
  const g = new Uint8Array(len)
  const b = new Uint8Array(len)

  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const x0 = Math.floor(gx * cellW)
      const y0 = Math.floor(gy * cellH)
      const x1 = Math.floor((gx + 1) * cellW)
      const y1 = Math.floor((gy + 1) * cellH)

      let sumR = 0, sumG = 0, sumB = 0
      let count = 0

      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const offset = (py * width + px) * 4
          sumR += data[offset]
          sumG += data[offset + 1]
          sumB += data[offset + 2]
          count++
        }
      }

      const idx = gy * gridCols + gx
      const avgR = Math.round(sumR / count)
      const avgG = Math.round(sumG / count)
      const avgB = Math.round(sumB / count)

      r[idx] = avgR
      g[idx] = avgG
      b[idx] = avgB
      brightness[idx] = pixelBrightness(avgR, avgG, avgB)
    }
  }

  return { brightness, r, g, b }
}
```

## Complete Source-Mode Component Template

Full React/TSX component that loads an image, converts it to ASCII, and renders it. This is the base template for source-mode (image/video/webcam) ASCII effects.

```tsx
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

// --- Rendering utilities (inline for self-contained component) ---

const SRGB_LUT = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const s = i / 255
  SRGB_LUT[i] = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function pixelBrightness(r: number, g: number, b: number): number {
  return 0.2126 * SRGB_LUT[r] + 0.7152 * SRGB_LUT[g] + 0.0722 * SRGB_LUT[b]
}

function getCharForBrightness(brightness: number, chars: string): string {
  if (chars.length === 0) return ' '
  const clamped = Math.max(0, Math.min(1, brightness))
  return chars[Math.floor(clamped * (chars.length - 1))]
}

// --- Types ---

interface AsciiConfig {
  cols: number
  rows: number
  chars: string
  colorMode: 'grayscale' | 'fullcolor'
  fontSize: number
  lineHeight: number
  bgColor: string
  invert: boolean
}

const DEFAULT_CONFIG: AsciiConfig = {
  cols: 120,
  rows: 60,
  chars: ' .:-=+*#%@',
  colorMode: 'fullcolor',
  fontSize: 10,
  lineHeight: 1.0,
  bgColor: '#000000',
  invert: false,
}

// --- Component ---

interface AsciiSourceProps {
  src?: string                        // image URL
  videoSrc?: string                   // video URL
  webcam?: boolean                    // use webcam
  config?: Partial<AsciiConfig>
  className?: string
  style?: React.CSSProperties
}

export default function AsciiSource({
  src,
  videoSrc,
  webcam = false,
  config: configOverrides,
  className,
  style,
}: AsciiSourceProps) {
  const config = { ...DEFAULT_CONFIG, ...configOverrides }
  const { cols, rows, chars, colorMode, fontSize, lineHeight, bgColor, invert } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number>(0)

  const [asciiLines, setAsciiLines] = useState<Array<{ char: string; color: string }[]>>([])

  // Initialize offscreen canvas
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = cols
    canvas.height = rows
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    canvasRef.current = canvas
    ctxRef.current = ctx
  }, [cols, rows])

  // Process a drawable source into ASCII
  const processFrame = useCallback(
    (source: CanvasImageSource) => {
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (!ctx || !canvas) return

      ctx.drawImage(source, 0, 0, cols, rows)
      const imageData = ctx.getImageData(0, 0, cols, rows)
      const { data } = imageData

      const lines: Array<{ char: string; color: string }[]> = []

      for (let y = 0; y < rows; y++) {
        const row: { char: string; color: string }[] = []
        for (let x = 0; x < cols; x++) {
          const offset = (y * cols + x) * 4
          const r = data[offset]
          const g = data[offset + 1]
          const b = data[offset + 2]

          let brightness = pixelBrightness(r, g, b)
          if (invert) brightness = 1 - brightness

          const char = getCharForBrightness(brightness, chars)

          let color: string
          if (colorMode === 'fullcolor') {
            color = `rgb(${r},${g},${b})`
          } else {
            const gray = Math.round(brightness * 255)
            color = `rgb(${gray},${gray},${gray})`
          }

          row.push({ char, color })
        }
        lines.push(row)
      }

      setAsciiLines(lines)
    },
    [cols, rows, chars, colorMode, invert]
  )

  // Image source
  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => processFrame(img)
    img.src = src
  }, [src, processFrame])

  // Video source
  useEffect(() => {
    if (!videoSrc) return

    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.src = videoSrc
    videoRef.current = video

    video.oncanplaythrough = () => {
      video.play()
      const tick = () => {
        if (!video.paused && !video.ended) {
          processFrame(video)
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      video.pause()
      video.src = ''
    }
  }, [videoSrc, processFrame])

  // Webcam source
  useEffect(() => {
    if (!webcam) return

    let video: HTMLVideoElement
    let active = true

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        })
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        video = document.createElement('video')
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        await video.play()
        videoRef.current = video

        const tick = () => {
          if (active && video.readyState >= video.HAVE_CURRENT_DATA) {
            processFrame(video)
          }
          if (active) rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        console.error('Webcam error:', err)
      }
    })()

    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [webcam, processFrame])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        backgroundColor: bgColor,
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {asciiLines.map((row, y) => (
        <div key={y} style={{ height: `${fontSize * lineHeight}px` }}>
          {row.map((cell, x) => (
            <span key={x} style={{ color: cell.color }}>
              {cell.char}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
```

## Performance Notes for Real-Time Video/Webcam

### Frame Budget

At 30fps you have ~33ms per frame. The pipeline stages and their typical costs:

| Stage | ~Cost (120x60 grid) | ~Cost (200x100 grid) |
|-------|---------------------|----------------------|
| `drawImage` (video to canvas) | 0.5ms | 0.8ms |
| `getImageData` | 0.3ms | 0.8ms |
| Brightness calculation | 0.5ms | 1.5ms |
| Dithering (Floyd-Steinberg) | 0.8ms | 2.5ms |
| Dithering (Bayer) | 0.2ms | 0.6ms |
| DOM update (React state) | 2-8ms | 8-25ms |

**DOM rendering is the bottleneck.** For grids over ~15,000 cells, consider canvas-based rendering.

### Optimization Strategies

**1. Skip frames when behind**

```typescript
const lastFrameTime = useRef(0)
const targetInterval = 1000 / 30 // 30fps

function tick(now: number) {
  if (now - lastFrameTime.current >= targetInterval) {
    lastFrameTime.current = now
    processFrame(video)
  }
  rafRef.current = requestAnimationFrame(tick)
}
```

**2. Canvas-based rendering (bypasses React DOM)**

For large grids, render directly to a visible canvas instead of creating DOM spans.

```typescript
function renderToCanvas(
  ctx: CanvasRenderingContext2D,
  lines: Array<{ char: string; color: string }[]>,
  fontSize: number,
  lineHeight: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'

  const cellWidth = fontSize * 0.6  // monospace char width approximation
  const cellHeight = fontSize * lineHeight

  for (let y = 0; y < lines.length; y++) {
    const row = lines[y]
    for (let x = 0; x < row.length; x++) {
      const cell = row[x]
      if (cell.char === ' ') continue  // skip spaces
      ctx.fillStyle = cell.color
      ctx.fillText(cell.char, x * cellWidth, y * cellHeight)
    }
  }
}
```

**3. Batched color rendering**

Group adjacent cells with the same color into a single `fillText` call.

```typescript
function renderBatched(
  ctx: CanvasRenderingContext2D,
  lines: Array<{ char: string; color: string }[]>,
  fontSize: number,
  lineHeight: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'

  const cellWidth = fontSize * 0.6
  const cellHeight = fontSize * lineHeight

  for (let y = 0; y < lines.length; y++) {
    const row = lines[y]
    let batch = ''
    let batchColor = ''
    let batchStartX = 0

    for (let x = 0; x <= row.length; x++) {
      const cell = x < row.length ? row[x] : null

      if (cell && cell.color === batchColor) {
        batch += cell.char
      } else {
        if (batch.length > 0 && batch.trim().length > 0) {
          ctx.fillStyle = batchColor
          ctx.fillText(batch, batchStartX * cellWidth, y * cellHeight)
        }
        if (cell) {
          batch = cell.char
          batchColor = cell.color
          batchStartX = x
        }
      }
    }
  }
}
```

**4. Use `willReadFrequently` context attribute**

Always set this on canvases that call `getImageData` every frame. Without it, Chrome keeps the bitmap on the GPU and transfers it to CPU each frame (slow).

```typescript
const ctx = canvas.getContext('2d', { willReadFrequently: true })!
```

**5. Reduce sampler resolution for fast sources**

For webcam/video, the sampler canvas should match the grid size exactly — never larger. A 120x60 grid only needs 120x60 pixels from the source, so the sampler canvas should be 120x60.

**6. Avoid React re-renders for every frame**

For video/webcam, use a ref-based approach with direct canvas manipulation instead of `setState` per frame.

```typescript
const outputCanvasRef = useRef<HTMLCanvasElement>(null)

// In the animation loop:
function tick() {
  processFrameToCanvas(videoRef.current!, outputCanvasRef.current!)
  rafRef.current = requestAnimationFrame(tick)
}
```

### Memory Considerations

- `ImageData` at grid resolution is small: 120x60x4 = 28.8KB per frame.
- Typed arrays (`Float32Array`, `Uint8Array`) for grid data: ~120x60x7 = 50.4KB per frame.
- Reuse buffers between frames rather than allocating new ones each frame.

```typescript
// Allocate once, reuse every frame
const brightnessBuffer = useRef(new Float32Array(cols * rows))
const rBuffer = useRef(new Uint8Array(cols * rows))
const gBuffer = useRef(new Uint8Array(cols * rows))
const bBuffer = useRef(new Uint8Array(cols * rows))
```

### Aspect Ratio Correction

Terminal/monospace characters are taller than they are wide (roughly 1:2 width:height). To maintain correct aspect ratio from the source, scale rows:

```typescript
function calculateGridDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetCols: number,
  charAspect: number = 0.5  // width/height ratio of monospace char
): { cols: number; rows: number } {
  const sourceAspect = sourceWidth / sourceHeight
  const rows = Math.round(targetCols / sourceAspect * charAspect)
  return { cols: targetCols, rows }
}
```
