# ascii-shader-tsx

An agent skill for generating animated ASCII art, dithered visuals, and shader-like effects as self-contained React/TSX components.

Works with any AI coding agent that supports skill/instruction files — Claude Code, Gemini CLI, Cursor, Windsurf, Cline, or any agent that can read markdown references.

Combines the [Glyph](https://github.com/Codeptor/glyph) rendering engine (9 art styles, 8 dithering algorithms, 6 FX presets) with procedural animation techniques (simplex noise, particles, value fields, feedback buffers) into a comprehensive reference that your agent reads to generate production-ready components.

## What It Does

You describe what you want — your agent reads the relevant reference docs and generates a single `.tsx` file with everything inlined. Zero external dependencies beyond React.

**Generative mode** — no image input needed:
```
"create a matrix rain background with CRT scanlines"
"animated noise field with teal/purple plasma"
"blockchain network visualization with flowing hex data"
```

**Source mode** — process images, video, or webcam:
```
"convert this image to ASCII art with Floyd-Steinberg dithering"
"webcam feed rendered as braille characters"
"video with halftone dot effect and retro amber palette"
```

## What's Inside

### From Glyph Engine
| Category | Contents |
|----------|----------|
| **Art Styles** | Classic, Halftone (circle/square/diamond/pentagon/hexagon), Braille (3 variants), DotCross, Line, Particles, Retro (5 duotones), Terminal, Claude |
| **Dithering** | Floyd-Steinberg, Bayer 8x8, Atkinson, Jarvis-Judice-Ninke, Stucki, Sierra, Sierra-Lite |
| **FX** | CRT (scanlines + phosphor + bloom), Matrix Rain, Noise, Intervals, Beam, Glitch |
| **Color Modes** | Grayscale, Fullcolor, Matrix Green, Amber, Sepia, Cool-Blue, Neon, Custom |
| **Rendering** | BT.709 luminance, sRGB linearization LUT, edge detection, vignette |

### From ASCII Video Pipeline
| Category | Contents |
|----------|----------|
| **Noise** | Simplex 2D/3D, fractal Brownian motion (fBm), domain warping |
| **Procedural Fields** | Plasma, concentric rings, spiral arms, vortex, tunnel, ripple, sine fields |
| **Particles** | Explosion, embers, orbital, flow field, bezier paths |
| **Composition** | Multi-layer blending, feedback buffer (temporal recursion), masking |
| **Post-processing** | Bloom, chromatic aberration, film grain, color grading |
| **Character Sets** | 30+ palettes — runes, katakana, greek, math symbols, braille, box-drawing |

### Shared Foundation
| Category | Contents |
|----------|----------|
| **Architecture** | Canvas hook with ResizeObserver, devicePixelRatio, prefers-reduced-motion |
| **Mouse** | Attract/push interaction with distance falloff |
| **Masking** | Circle, rect, gradient, animated iris/wipe/dissolve |
| **Source Processing** | Image, video, webcam grid downsampling pipeline |

## Reference Files

```
SKILL.md                       — orchestrator, workflow, component contract
references/
├── architecture.md            — canvas hook, component template, responsive, a11y
├── rendering.md               — BT.709 brightness, sRGB LUT, 8 color modes, vignette
├── dithering.md               — 8 algorithms with full implementations
├── styles.md                  — 9 art style renderers with complete code
├── generative.md              — simplex noise, fBm, value fields, particles, matrix rain
├── effects.md                 — CRT, glitch, bloom, noise FX, direction system
├── charsets.md                — 30+ character palettes from both engines
├── composition.md             — blend modes, mouse interaction, feedback buffer, masking
└── image-source.md            — image/video/webcam processing pipeline
```

## Install

### Claude Code
```bash
claude install-skill https://github.com/Codeptor/ascii-shader-tsx
```

### Other Agents
Copy `SKILL.md` and the `references/` directory into your agent's skill/instruction directory, or point your agent's context to this repo.

For agents that support custom instructions (Cursor rules, Windsurf rules, etc.), add the `SKILL.md` content to your project rules and keep the `references/` folder accessible.

## Usage

Once installed, the skill triggers when you ask your agent to create ASCII/dither/shader components:

```
# Generative backgrounds
"create an animated ASCII noise background"
"matrix rain component with customizable speed and color"
"retro CRT terminal effect as a React component"

# Image processing
"convert an uploaded image to ASCII art with Atkinson dithering"
"webcam to braille art component"
"halftone dot effect on a video element"

# Complex compositions
"multi-layer ASCII background: plasma noise + floating particles + vignette"
"blockchain network visualization with hex streams and pulsing nodes"
```

## License

MIT
