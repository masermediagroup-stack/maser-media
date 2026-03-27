# Composition Reference

Multi-layer compositing, masking, mouse interaction, feedback buffers, and BG dither compositing.

---

## 1. Canvas Blend Modes

All usable `globalCompositeOperation` values for layering ASCII renders.

```typescript
type BlendMode =
  | 'source-over'    // default — new content draws over existing
  | 'screen'         // brightens: 1-(1-a)*(1-b), good for glow/light effects
  | 'multiply'       // darkens: a*b, good for shadows/tinting
  | 'overlay'        // contrast boost: multiply darks, screen lights
  | 'lighten'        // keeps the brighter pixel
  | 'darken'         // keeps the darker pixel
  | 'difference'     // absolute difference, good for psychedelic/invert
  | 'exclusion'      // softer difference
  | 'color-dodge'    // extreme brightening, good for highlights/glare
  | 'color-burn'     // extreme darkening, good for deep shadows
  | 'hard-light'     // like overlay but stronger
  | 'soft-light'     // subtle contrast/tint adjustment
  | 'luminosity'     // uses luminosity of new content with color of existing
```

### Practical Usage

```typescript
// Glow layer — screen blends light additively
ctx.globalCompositeOperation = 'screen'
ctx.globalAlpha = 0.6
renderGlowLayer(ctx, width, height, time)

// Shadow overlay — multiply darkens
ctx.globalCompositeOperation = 'multiply'
ctx.globalAlpha = 0.8
renderShadowLayer(ctx, width, height)

// Always reset after compositing
ctx.globalCompositeOperation = 'source-over'
ctx.globalAlpha = 1
```

---

## 2. Multi-Layer Compositing

Sequential rendering of multiple layers with per-layer blend modes and opacity.

### Layer Definition

```typescript
interface CompositeLayer {
  id: string
  blendMode: BlendMode
  opacity: number          // 0 to 1
  visible: boolean
  render: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void
}
```

### Layer Compositor

```typescript
function compositeLayers(
  ctx: CanvasRenderingContext2D,
  layers: CompositeLayer[],
  width: number,
  height: number,
  time: number,
): void {
  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  for (const layer of layers) {
    if (!layer.visible || layer.opacity <= 0) continue

    ctx.save()
    ctx.globalCompositeOperation = layer.blendMode
    ctx.globalAlpha = layer.opacity
    layer.render(ctx, width, height, time)
    ctx.restore()
  }

  // Reset composite state
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
}
```

### Example: Three-Layer Setup

```typescript
const layers: CompositeLayer[] = [
  {
    id: 'bg-noise',
    blendMode: 'source-over',
    opacity: 1,
    visible: true,
    render: (ctx, w, h, t) => {
      // Generative noise background
      renderGenerativeBackground(ctx, w, h, t, {
        charset: ' ░▒',
        noiseScale: 0.03,
      })
    },
  },
  {
    id: 'main-ascii',
    blendMode: 'screen',
    opacity: 0.9,
    visible: true,
    render: (ctx, w, h, t) => {
      // Primary ASCII render from source image
      renderClassic(renderContext)
    },
  },
  {
    id: 'glow-overlay',
    blendMode: 'color-dodge',
    opacity: 0.3,
    visible: true,
    render: (ctx, w, h, t) => {
      // Bloom/glow pass
      applyBloom(ctx, w, h, 0.5, 0.4)
    },
  },
]

// In render loop:
compositeLayers(ctx, layers, w, h, t)
```

---

## 3. Mouse Interaction

Character displacement toward or away from cursor position. From Glyph's renderUtils.

### getMouseOffset

```typescript
function getMouseOffset(
  cellX: number,
  cellY: number,
  cellWidth: number,
  cellHeight: number,
  mouseX: number,
  mouseY: number,
  areaSize: number,
  spread: number,
  strength: number,
  interaction: 'attract' | 'push',
): { ox: number; oy: number } {
  // No mouse present
  if (mouseX < 0 || mouseY < 0) return { ox: 0, oy: 0 }

  // Cell center in pixel coordinates
  const cx = cellX * cellWidth + cellWidth * 0.5
  const cy = cellY * cellHeight + cellHeight * 0.5

  // Distance from cell center to mouse
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Area of effect radius
  const radius = areaSize * 0.5

  if (dist > radius) return { ox: 0, oy: 0 }

  // Distance falloff — quadratic for smooth edges
  const normalizedDist = dist / radius
  const falloff = 1 - normalizedDist * normalizedDist

  // Spread factor controls how far characters can move
  const maxDisplacement = spread * Math.max(cellWidth, cellHeight)

  // Direction: attract pulls toward mouse, push pushes away
  const dirSign = interaction === 'attract' ? 1 : -1

  // Normalize direction vector
  const invDist = dist > 0.01 ? 1 / dist : 0
  const nx = dx * invDist
  const ny = dy * invDist

  const displacement = falloff * strength * maxDisplacement * dirSign

  return {
    ox: nx * displacement,
    oy: ny * displacement,
  }
}
```

### Mouse Tracking Hook

```typescript
// Track mouse position on the canvas, normalized and pixel coordinates
function useMousePosition(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const mouseRef = useRef({ x: -1, y: -1, normX: -1, normY: -1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.normX = mouseRef.current.x / rect.width
      mouseRef.current.normY = mouseRef.current.y / rect.height
    }

    const onLeave = () => {
      mouseRef.current.x = -1
      mouseRef.current.y = -1
      mouseRef.current.normX = -1
      mouseRef.current.normY = -1
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    return () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [canvasRef])

  return mouseRef
}
```

### Applying Mouse Offset in a Renderer

```typescript
// Inside the per-cell rendering loop:
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    // ... compute char and color ...

    const { ox, oy } = getMouseOffset(
      x, y, cellWidth, cellHeight,
      mouse.x, mouse.y,
      /* areaSize */ 200,
      /* spread */ 2.0,
      /* strength */ 0.8,
      /* interaction */ 'push',
    )

    ctx.fillStyle = color
    ctx.fillText(char, x * cellWidth + ox, y * cellHeight + oy)
  }
}
```

---

## 4. Masking

Canvas-based masking techniques for revealing/hiding regions of the ASCII render.

### Circle Mask

```typescript
function applyCircleMask(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number,
  feather: number = 20,
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'

  const gradient = ctx.createRadialGradient(cx, cy, Math.max(0, radius - feather), cx, cy, radius)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.restore()
}
```

### Rectangle Mask

```typescript
function applyRectMask(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  cornerRadius: number = 0,
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'

  ctx.fillStyle = '#fff'
  if (cornerRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, cornerRadius)
    ctx.fill()
  } else {
    ctx.fillRect(x, y, w, h)
  }

  ctx.restore()
}
```

### Gradient Mask

```typescript
function applyGradientMask(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  direction: 'horizontal' | 'vertical' | 'diagonal',
  invert: boolean = false,
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'

  let x0: number, y0: number, x1: number, y1: number
  switch (direction) {
    case 'horizontal': x0 = 0; y0 = 0; x1 = width; y1 = 0; break
    case 'vertical':   x0 = 0; y0 = 0; x1 = 0; y1 = height; break
    case 'diagonal':   x0 = 0; y0 = 0; x1 = width; y1 = height; break
  }

  const gradient = ctx.createLinearGradient(x0!, y0!, x1!, y1!)
  if (invert) {
    gradient.addColorStop(0, 'rgba(255,255,255,0)')
    gradient.addColorStop(1, 'rgba(255,255,255,1)')
  } else {
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}
```

### Animated Masks

Time-based iris, wipe, and dissolve transitions.

```typescript
// Iris: expanding/contracting circle
function applyIrisMask(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  progress: number, // 0 to 1
): void {
  const maxRadius = Math.sqrt(width * width + height * height) * 0.5
  const radius = maxRadius * progress
  applyCircleMask(ctx, width * 0.5, height * 0.5, radius, maxRadius * 0.05)
}

// Wipe: sliding reveal from one direction
function applyWipeMask(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  progress: number, // 0 to 1
  direction: 'left' | 'right' | 'up' | 'down',
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = '#fff'

  switch (direction) {
    case 'left':  ctx.fillRect(0, 0, width * progress, height); break
    case 'right': ctx.fillRect(width * (1 - progress), 0, width * progress, height); break
    case 'up':    ctx.fillRect(0, 0, width, height * progress); break
    case 'down':  ctx.fillRect(0, height * (1 - progress), width, height * progress); break
  }

  ctx.restore()
}

// Dissolve: noise-based threshold reveal
function applyDissolveMask(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  progress: number, // 0 to 1
  scale: number = 0.02,
): void {
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = width; maskCanvas.height = height
  const mctx = maskCanvas.getContext('2d')!

  const imageData = mctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noise = (simplex2(x * scale, y * scale) + 1) * 0.5
      const alpha = noise < progress ? 255 : 0
      const i = (y * width + x) * 4
      data[i] = data[i + 1] = data[i + 2] = 255
      data[i + 3] = alpha
    }
  }

  mctx.putImageData(imageData, 0, 0)

  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(maskCanvas, 0, 0)
  ctx.restore()
}
```

### Value Field as Mask

Use any procedural value field to generate a mask.

```typescript
function applyFieldMask(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  fieldFn: (x: number, y: number, t: number) => number,
  time: number,
  threshold: number = 0.5,
): void {
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = width; maskCanvas.height = height
  const mctx = maskCanvas.getContext('2d')!

  const imageData = mctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = fieldFn(x, y, time)
      const alpha = Math.round(Math.max(0, Math.min(1, (value - threshold + 0.1) * 10)) * 255)
      const i = (y * width + x) * 4
      data[i] = data[i + 1] = data[i + 2] = 255
      data[i + 3] = alpha
    }
  }

  mctx.putImageData(imageData, 0, 0)

  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(maskCanvas, 0, 0)
  ctx.restore()
}
```

---

## 5. Feedback Buffer

Temporal recursion — store previous frames, apply decay and spatial transforms, blend with current frame for trails and echoes.

### Implementation Pattern for React

```typescript
// Feedback buffer stored in a ref to persist across frames
interface FeedbackBuffer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  initialized: boolean
}

function createFeedbackBuffer(): FeedbackBuffer {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx, initialized: false }
}

// Inside useEffect:
const feedback = useRef<FeedbackBuffer>(createFeedbackBuffer())
```

### Feedback with Decay

Multiply previous frame by a decay factor (0-1) before blending with current.

```typescript
function applyFeedbackDecay(
  displayCtx: CanvasRenderingContext2D,
  feedback: FeedbackBuffer,
  width: number, height: number,
  decay: number = 0.9,
  blendMode: GlobalCompositeOperation = 'source-over',
): void {
  const fb = feedback

  // Initialize or resize feedback buffer
  if (!fb.initialized || fb.canvas.width !== width || fb.canvas.height !== height) {
    fb.canvas.width = width
    fb.canvas.height = height
    fb.initialized = true
    return // first frame — nothing to feed back
  }

  // Apply decay to feedback buffer
  fb.ctx.globalCompositeOperation = 'source-over'
  fb.ctx.globalAlpha = decay
  fb.ctx.drawImage(fb.canvas, 0, 0)

  // Clear un-decayed residue
  fb.ctx.globalCompositeOperation = 'destination-in'
  fb.ctx.globalAlpha = 1
  fb.ctx.fillStyle = `rgba(255,255,255,${decay})`
  fb.ctx.fillRect(0, 0, width, height)

  // Blend feedback into display
  displayCtx.save()
  displayCtx.globalCompositeOperation = blendMode
  displayCtx.globalAlpha = decay
  displayCtx.drawImage(fb.canvas, 0, 0)
  displayCtx.restore()

  // Capture current display into feedback buffer for next frame
  fb.ctx.globalCompositeOperation = 'source-over'
  fb.ctx.globalAlpha = 1
  fb.ctx.clearRect(0, 0, width, height)
  fb.ctx.drawImage(displayCtx.canvas, 0, 0)
}
```

### Feedback with Zoom (Spatial Transform)

Resize-crop the feedback buffer to create a zoom-in or zoom-out trail effect.

```typescript
function applyFeedbackZoom(
  displayCtx: CanvasRenderingContext2D,
  feedback: FeedbackBuffer,
  width: number, height: number,
  decay: number = 0.92,
  zoom: number = 1.02, // >1 zooms in, <1 zooms out
): void {
  const fb = feedback

  if (!fb.initialized || fb.canvas.width !== width || fb.canvas.height !== height) {
    fb.canvas.width = width
    fb.canvas.height = height
    fb.initialized = true
    return
  }

  // Save current feedback content
  const tmp = document.createElement('canvas')
  tmp.width = width; tmp.height = height
  const tc = tmp.getContext('2d')!
  tc.drawImage(fb.canvas, 0, 0)

  // Clear and draw zoomed
  fb.ctx.clearRect(0, 0, width, height)
  fb.ctx.globalAlpha = decay

  const zw = width * zoom
  const zh = height * zoom
  const ox = (width - zw) * 0.5
  const oy = (height - zh) * 0.5

  fb.ctx.drawImage(tmp, ox, oy, zw, zh)
  fb.ctx.globalAlpha = 1

  // Blend feedback into display
  displayCtx.save()
  displayCtx.globalCompositeOperation = 'screen'
  displayCtx.globalAlpha = decay * 0.8
  displayCtx.drawImage(fb.canvas, 0, 0)
  displayCtx.restore()

  // Capture current frame
  fb.ctx.globalCompositeOperation = 'source-over'
  fb.ctx.globalAlpha = 1
  fb.ctx.drawImage(displayCtx.canvas, 0, 0)
}
```

### Feedback with Shift

Translate the feedback buffer for directional trails.

```typescript
function applyFeedbackShift(
  displayCtx: CanvasRenderingContext2D,
  feedback: FeedbackBuffer,
  width: number, height: number,
  decay: number = 0.9,
  shiftX: number = 0,  // pixels per frame
  shiftY: number = -1,  // negative = upward
): void {
  const fb = feedback

  if (!fb.initialized || fb.canvas.width !== width || fb.canvas.height !== height) {
    fb.canvas.width = width
    fb.canvas.height = height
    fb.initialized = true
    return
  }

  const tmp = document.createElement('canvas')
  tmp.width = width; tmp.height = height
  const tc = tmp.getContext('2d')!
  tc.drawImage(fb.canvas, 0, 0)

  fb.ctx.clearRect(0, 0, width, height)
  fb.ctx.globalAlpha = decay
  fb.ctx.drawImage(tmp, shiftX, shiftY)
  fb.ctx.globalAlpha = 1

  displayCtx.save()
  displayCtx.globalCompositeOperation = 'screen'
  displayCtx.globalAlpha = decay * 0.7
  displayCtx.drawImage(fb.canvas, 0, 0)
  displayCtx.restore()

  fb.ctx.globalCompositeOperation = 'source-over'
  fb.ctx.globalAlpha = 1
  fb.ctx.drawImage(displayCtx.canvas, 0, 0)
}
```

### Feedback with Rotation

Rotate the feedback buffer for spiral trail effects.

```typescript
function applyFeedbackRotate(
  displayCtx: CanvasRenderingContext2D,
  feedback: FeedbackBuffer,
  width: number, height: number,
  decay: number = 0.93,
  anglePerFrame: number = 0.01, // radians
): void {
  const fb = feedback

  if (!fb.initialized || fb.canvas.width !== width || fb.canvas.height !== height) {
    fb.canvas.width = width
    fb.canvas.height = height
    fb.initialized = true
    return
  }

  const tmp = document.createElement('canvas')
  tmp.width = width; tmp.height = height
  const tc = tmp.getContext('2d')!
  tc.drawImage(fb.canvas, 0, 0)

  fb.ctx.clearRect(0, 0, width, height)
  fb.ctx.save()
  fb.ctx.globalAlpha = decay
  fb.ctx.translate(width * 0.5, height * 0.5)
  fb.ctx.rotate(anglePerFrame)
  fb.ctx.translate(-width * 0.5, -height * 0.5)
  fb.ctx.drawImage(tmp, 0, 0)
  fb.ctx.restore()

  displayCtx.save()
  displayCtx.globalCompositeOperation = 'screen'
  displayCtx.globalAlpha = decay * 0.6
  displayCtx.drawImage(fb.canvas, 0, 0)
  displayCtx.restore()

  fb.ctx.globalCompositeOperation = 'source-over'
  fb.ctx.globalAlpha = 1
  fb.ctx.drawImage(displayCtx.canvas, 0, 0)
}
```

### Hue Shift on Feedback for Rainbow Trails

Apply a color grade shift to the feedback buffer each frame so trails cycle through the spectrum.

```typescript
function applyFeedbackHueShift(
  feedback: FeedbackBuffer,
  width: number, height: number,
  hueShiftPerFrame: number = 5, // degrees
): void {
  const fb = feedback
  if (!fb.initialized) return

  const imageData = fb.ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Convert shift to channel rotation factors
  const angle = (hueShiftPerFrame * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]

    // Simplified hue rotation in RGB space
    const nr = r * (0.667 + cos * 0.333) + g * (0.333 - cos * 0.333 - sin * 0.577) + b * (0.333 - cos * 0.333 + sin * 0.577)
    const ng = r * (0.333 - cos * 0.333 + sin * 0.577) + g * (0.667 + cos * 0.333) + b * (0.333 - cos * 0.333 - sin * 0.577)
    const nb = r * (0.333 - cos * 0.333 - sin * 0.577) + g * (0.333 - cos * 0.333 + sin * 0.577) + b * (0.667 + cos * 0.333)

    data[i]     = Math.max(0, Math.min(255, Math.round(nr)))
    data[i + 1] = Math.max(0, Math.min(255, Math.round(ng)))
    data[i + 2] = Math.max(0, Math.min(255, Math.round(nb)))
  }

  fb.ctx.putImageData(imageData, 0, 0)
}
```

### Complete Feedback Loop Example

```typescript
// In component setup (inside useEffect):
const feedbackRef = useRef<FeedbackBuffer>(createFeedbackBuffer())

// In render loop:
const render = () => {
  const t = (performance.now() - startTime) / 1000

  // Clear display
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)

  // Draw current frame content
  renderGenerativeBackground(ctx, w, h, t)

  // Apply feedback with zoom + hue shift for rainbow tunnel effect
  applyFeedbackZoom(ctx, feedbackRef.current, w, h, 0.92, 1.015)
  applyFeedbackHueShift(feedbackRef.current, w, h, 3)

  if (!prefersReduced) animRef.current = requestAnimationFrame(render)
}
```

---

## 6. BG Dither Compositing

How the bgDither and inverseDither layers compose with the main character rendering.

### Layer Order

```
Canvas (black background)
  └─ BG Dither pass       (source-over, low alpha dots)
  └─ Inverse Dither pass  (source-over, inverted fill on bright cells)
  └─ Main character render (source-over, the primary style renderer)
  └─ Post-FX overlays     (various blend modes)
```

### Integrated Render Function

```typescript
function renderComposited(
  ctx: CanvasRenderingContext2D,
  rc: RenderContext,
  options: {
    bgDither?: BGDitherConfig
    inverseDither?: InverseDitherConfig
    style: 'classic' | 'halftone' | 'braille' | 'dotcross' | 'line' | 'particles' | 'retro' | 'terminal' | 'claude'
    styleConfig?: Record<string, unknown>
    postFX?: Array<(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void>
  },
): void {
  const { cols, rows, cellWidth, cellHeight, time } = rc
  const width = cols * cellWidth
  const height = rows * cellHeight

  // Clear
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  // 1. BG Dither — subtle background texture
  if (options.bgDither) {
    renderBGDither(ctx, cols, rows, cellWidth, cellHeight, time, options.bgDither)
  }

  // 2. Inverse Dither — inverted dots on bright areas
  if (options.inverseDither) {
    renderInverseDither(
      ctx, rc.brightnessGrid, cols, rows, cellWidth, cellHeight,
      options.inverseDither,
    )
  }

  // 3. Main style renderer
  switch (options.style) {
    case 'classic':   renderClassic(rc); break
    case 'halftone':  renderHalftone(rc, options.styleConfig as HalftoneConfig); break
    case 'braille':   renderBraille(rc, options.styleConfig?.variant as BrailleVariant); break
    case 'dotcross':  renderDotCross(rc); break
    case 'line':      renderLine(rc, options.styleConfig as LineConfig); break
    case 'particles': renderParticles(rc, options.styleConfig as ParticleConfig); break
    case 'retro':     renderRetro(rc, options.styleConfig as RetroConfig); break
    case 'terminal':  renderTerminal(rc, options.styleConfig?.charset as string); break
    case 'claude':    renderClaude(rc); break
  }

  // 4. Post-FX chain
  if (options.postFX) {
    for (const fx of options.postFX) {
      fx(ctx, width, height, time)
    }
  }
}
```

### BG Dither Interaction with Styles

Different art styles benefit from different dither configurations:

| Style | Dither coverage | Dot size | Tint | Notes |
|-------|----------------|----------|------|-------|
| Classic | 0.2-0.4 | 1.0 | style tint | Subtle texture in dark areas |
| Halftone | 0.1-0.2 | 0.8 | neutral | Low coverage avoids competing with shapes |
| Braille | 0.3-0.5 | 1.2 | match color | Higher coverage complements dense patterns |
| Line | 0.15-0.3 | 1.0 | neutral | Moderate, avoids visual noise |
| Particles | 0.4-0.6 | 1.5 | warm | High coverage fills gaps between sparse particles |
| Terminal | 0.2 | 1.0 | green tint | Subtle green dots enhance phosphor feel |
| Claude | 0.3 | 1.2 | amber tint | Warm dots match brand aesthetic |
| Retro | 0.25 | 1.0 | palette-matched | Match the active duotone palette |

### Inverse Dither with Styles

Inverse dither is most effective with styles that have clear bright/dark separation:

```typescript
// Good with Classic — creates dot screen in bright areas
const inverseDitherForClassic: InverseDitherConfig = {
  threshold: 0.6,
  bgColor: '#000',
  fgColor: '#222',
  dotRadius: 0.35,
}

// Good with Terminal — green inverse dots
const inverseDitherForTerminal: InverseDitherConfig = {
  threshold: 0.5,
  bgColor: '#000',
  fgColor: '#0a1a0a',
  dotRadius: 0.4,
}

// Skip for Halftone and Particles — they have their own spatial patterns
```
