# Maser Surface Engine

Procedural monochrome material system for web interfaces.

Part of **Maser Lab**. This is a graphics engine — not a UI kit.

## Philosophy

Premium dithered surfaces feel expensive when dithering is structural, not decorative:

- Continuous tonal fields first, then ordered discretization
- High-resolution Bayer matrices (8×8 / 16×16) instead of chunky pixels
- Soft bloom and grain as finishing, never as the identity
- Cursor and scroll as light influences, not dramatic transforms
- Everything heavily damped — nothing snaps

## Pipeline

1. Procedural grayscale gradient  
2. Ordered Bayer dithering (2 / 4 / 8 / 16)  
3. Optional blue-noise overlay  
4. Posterization  
5. Contrast remapping  
6. Highlight bloom  
7. Animated grain  
8. Motion interpolation (CPU-side exponential damping → shader uniforms)

## Architecture

```text
src/engine/
  core/          Renderer, Material, types
  dither/        Bayer matrices
  noise/         Blue-noise generation
  animation/     Clock + damping
  interaction/   Pointer / scroll fields
  pipeline/      WebGL2 shaders
  materials/     Presets + future kind registry
  react/         SurfaceCanvas + control hooks
```

Subsystems are independently reusable. Future materials (liquid, paper, chrome, glass, SDF…) register into the same contract.

## Commands

```bash
cd maser-lab/surface-engine
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

Demo: http://localhost:3000

From the monorepo root:

```bash
npm run lab:surface
```

## Card Demo

The demo card applies the surface material to its media region. Cursor softly influences light direction, gradient drift, noise, and bloom. Card tilt is capped to a few degrees with overdamped springs.
