---
name: ascii-shader-tsx
license: MIT
description: >
  Generate animated ASCII art, dithered visuals, and shader-like effects as self-contained
  React/TSX components. Use when the user wants to create ASCII backgrounds, dithered
  image/video effects, CRT/retro overlays, matrix rain, noise fields, halftone patterns,
  particle systems, braille art, terminal aesthetics, or any text/character-based visual
  effect for the web. Supports both generative (procedural, no input) and source-based
  (images, video, webcam to ASCII) modes. Also triggers when the user wants to convert an
  image to ASCII, add a dither effect, create a canvas shader component, build a retro or
  terminal background, animate characters, or create any character-grid visual. Even partial
  matches like ASCII component, dither, character art, CRT effect, halftone, noise background,
  pixel art canvas, text art, or generative canvas should trigger this skill.
---

# ASCII Shader TSX

Generate animated ASCII/dither visual effects as self-contained React TypeScript components. Combines the Glyph rendering engine (9 art styles, 8 dithering algorithms, 6 FX presets) with procedural animation techniques (noise fields, particles, value fields, feedback buffers).

## Modes

| Mode | Input | Output |
|------|-------|--------|
| **Generative** | None (or config props) | Procedural animated ASCII backgrounds, noise fields, matrix rain, particles |
| **Source** | Image / video / webcam | Real-time ASCII/dither conversion with art styles and FX |
| **Hybrid** | Source + generative overlays | Image with animated FX layers (CRT, glitch, noise, matrix rain) |

## Stack

Single self-contained `.tsx` file per component. **Zero external dependencies** beyond React.

| Concern | Approach |
|---------|----------|
| Rendering | Canvas 2D API (no WebGL) |
| Animation | `requestAnimationFrame` |
| Responsive | `ResizeObserver` + `devicePixelRatio` |
| Accessibility | `prefers-reduced-motion`, `aria-hidden` |
| TypeScript | Strict mode, fully typed props interface |
| Brightness | BT.709 luminance with sRGB linearization LUT |
| Dithering | Error diffusion + ordered (Bayer) |

## Component Contract

Every generated component follows this structure:

```tsx
interface Props {
  // Effect-specific (varies per component)
  charset?: string
  colorMode?: 'grayscale' | 'matrix' | 'amber' | 'sepia' | 'cool-blue' | 'neon' | 'custom'
  speed?: number
  density?: number
  // Source-mode only
  src?: string | HTMLImageElement | HTMLVideoElement
  // Universal
  className?: string
  style?: React.CSSProperties
}

export function AsciiEffect({ speed = 1, ...props }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    // ... setup, ResizeObserver, animation loop ...
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect() }
  }, [/* deps */])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={style} />
}
```

## Workflow

### Step 1: Determine Mode

- **Generative**: User wants an animated background, procedural effect, or decorative element with no image input
- **Source**: User provides/references an image, video, or webcam feed to convert to ASCII/dither
- **Hybrid**: Source with animated overlays (e.g., "add CRT effect to this image")

### Step 2: Read the Right References

Based on what the user wants, read the minimum set of reference files needed:

| User wants | Read these references |
|------------|----------------------|
| ASCII text backgrounds | `architecture.md` + `rendering.md` + `charsets.md` |
| Dithered image | `rendering.md` + `dithering.md` + `image-source.md` |
| Halftone / dot patterns | `styles.md` § Halftone |
| Matrix rain / data rain | `generative.md` § Matrix Rain |
| CRT / retro TV effect | `effects.md` § CRT |
| Noise fields / plasma | `generative.md` § Noise + Procedural Fields |
| Glitch effects | `effects.md` § Glitch |
| Particle systems | `generative.md` § Particles |
| Braille art | `styles.md` § Braille + `charsets.md` |
| Terminal / phosphor look | `styles.md` § Terminal |
| Retro duotone palette | `styles.md` § Retro |
| Mouse-interactive | `composition.md` § Mouse Interaction |
| Multi-layer compositing | `composition.md` § Layering |
| Webcam → ASCII | `image-source.md` + `rendering.md` |
| Image → ASCII conversion | `image-source.md` + `rendering.md` + `styles.md` |
| Animated background (complex) | `generative.md` + `effects.md` + `composition.md` |

**Always read `architecture.md`** — it has the canvas hook and component patterns every component needs.

### Step 3: Build the Component

Write a single `.tsx` file containing:
1. **Props interface** — typed, with sensible defaults
2. **Inline utilities** — brightness LUT, color modes, noise, dithering (whatever the component needs, inlined from reference docs — no imports from external modules)
3. **Canvas hook** — setup, resize, animation loop, cleanup (from `architecture.md`)
4. **Render function** — the actual drawing logic
5. **Default export** — the React component

### Step 4: Creative Direction

**Every component should look distinct.** The references provide building blocks — combine, modify, invent.

| Dimension | Options |
|-----------|---------|
| **Character set** | Standard `' .:-=+*#%@'`, blocks `' ░▒▓█'`, detailed (68 chars), minimal `' ·░█'`, binary `' 01'`, braille (64 patterns), custom themed |
| **Color mode** | Grayscale, matrix green, amber, sepia, cool-blue, neon (HSL cycling), fullcolor (source RGB), custom hex |
| **Art style** | Classic (char mapping), halftone (5 shapes), braille, dotcross, line, particles, retro (5 duotones), terminal (green phosphor) |
| **Dithering** | None, Floyd-Steinberg, Bayer 8×8, Atkinson, JJN, Stucki, Sierra, Sierra-Lite |
| **FX** | None, noise (simplex 3D), intervals, beam, glitch, CRT (scanlines+phosphor+bloom), matrix rain |
| **Animation** | Static, slow drift, wavy, pulsing, flowing, reactive |
| **Density** | xs (8px), sm (10px), md (16px), lg (20px), xl (24px) |

## References

| File | Contents |
|------|----------|
| `references/architecture.md` | Canvas hook, component template, ResizeObserver, cleanup, a11y, devicePixelRatio, performance |
| `references/rendering.md` | BT.709 brightness, sRGB LUT, adjustBrightness, 8 color modes (implementations), char mapping, vignette, edge detection |
| `references/dithering.md` | 8 algorithms: error diffusion framework, FS/Atkinson/JJN/Stucki/Sierra kernels, Bayer 8×8 ordered |
| `references/styles.md` | 9 art style renderers: classic, halftone (5 shapes), braille (3 variants), dotcross, line, particles, retro (5 duotones), terminal, claude |
| `references/generative.md` | Simplex noise 2D/3D, fBm, procedural value fields (plasma, rings, spiral, vortex, tunnel, sine fields), HSV color, particles, matrix rain |
| `references/effects.md` | Pre-render FX (noise, intervals, beam, glitch with direction system), post-render FX (CRT, matrix rain), bloom, vignette, scanlines, grain, chromatic aberration, border glow |
| `references/charsets.md` | All character sets (10 standard + 3 braille + 5 terminal), palette libraries from ascii-video, custom charset creation |
| `references/composition.md` | Multi-layer compositing, canvas blend modes, masking, mouse interaction (attract/push), feedback buffer, BG dither, inverse dither |
| `references/image-source.md` | Image/video/webcam loading, sampler canvas, grid downsampling, real-time processing loop |

## Critical Patterns

### Canvas Hook (Required in Every Component)

See `references/architecture.md` for the full pattern. Key points:
- Use `ResizeObserver` for responsive sizing
- Handle `devicePixelRatio` for sharp rendering on HiDPI
- Check `prefers-reduced-motion` and render a single frame if true
- Always clean up RAF and observer on unmount
- Use `willReadFrequently: true` on sampler canvas (source mode), `false` on display canvas

### BT.709 Brightness (From Glyph Engine)

Always use perceptually accurate brightness calculation. See `references/rendering.md` for the full implementation. The sRGB-to-linear LUT is critical for performance — pre-compute at module level.

### Performance Guidelines

- Use `Float32Array` for brightness/value grids — not regular arrays
- Pre-compute the sRGB linearization LUT (256 entries) at module scope
- For source mode: use a separate sampler canvas sized to grid resolution
- Cap grid dimensions: `cols = Math.floor(width / cellWidth)`, never more than ~400 cols
- Minimize per-cell string allocations — use indexed char lookups
- For generative mode: vectorize math operations where possible
- Use `globalCompositeOperation` for blending instead of manual pixel math

### Output Checklist

Before generating a component, verify:
- [ ] Single `.tsx` file, zero imports beyond React
- [ ] All utility functions inlined (brightness, noise, dither, color)
- [ ] Props interface with sensible defaults
- [ ] Canvas hook with ResizeObserver + cleanup
- [ ] `aria-hidden="true"` on canvas
- [ ] `prefers-reduced-motion` check
- [ ] Usage example in a comment at the top
