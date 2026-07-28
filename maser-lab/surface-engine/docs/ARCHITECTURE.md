# Maser Surface Engine — Architecture

## Design intent

Maser Surface Engine treats interface materials as **continuous tonal fields** that are discretized through an ordered dithering pipeline. The result should feel engineered and editorial — monochrome, high contrast, premium — never retro or pixel-art nostalgic.

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `core/Renderer` | WebGL2 context, RAF loop, uniform uploads, lifecycle |
| `core/Material` | Param targets + damped display values |
| `dither` | Bayer matrix generation & texture upload |
| `noise` | Seedable blue-noise field |
| `animation` | Clock + exponential damping (no spring overshoot) |
| `interaction` | Pointer / scroll sampling with damping |
| `pipeline/shaders` | 8-stage fragment pipeline |
| `materials` | Presets + future material kind registry |
| `react` | Thin React host — no per-frame React state |

## Rendering contract

1. UI mutates **material targets** only.
2. Each frame, `SurfaceMaterial.update(delta)` eases display params.
3. `InteractionField.update(delta)` eases pointer / scroll.
4. Renderer uploads uniforms and draws a fullscreen triangle.
5. Textures (Bayer, blue-noise) rebuild only when size/seed changes.

## Future expansion

`MATERIAL_KIND_REGISTRY` lists planned kinds. New materials should:

1. Add a shader variant or material class implementing the same param surface.
2. Register in `materials/presets.ts`.
3. Keep React hosts agnostic — swap via `kind` later.

## Performance rules

- Cap DPR (`maxDpr`, default 2) × `pixelDensity`
- Pause when offscreen or tab hidden
- Respect `prefers-reduced-motion`
- Never store decorative frame values in React state
