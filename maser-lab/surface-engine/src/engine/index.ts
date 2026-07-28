/**
 * Maser Surface Engine
 *
 * Procedural monochrome material system for web interfaces.
 * Architecture separates Renderer, Material, Noise, Dither,
 * Interactions, Animation, and UI Controls.
 */

export { ENGINE_NAME, ENGINE_VERSION, DEFAULT_MATERIAL, DAMP } from "./core/constants";
export type {
  BayerSize,
  MaterialKind,
  SurfaceMaterialParams,
  SurfaceMaterialPartial,
  SurfaceRendererOptions,
  SurfaceFrameState,
  InteractionSample,
  Vec2,
  MaterialPreset,
} from "./core/types";

export { SurfaceMaterial } from "./core/Material";
export { SurfaceRenderer } from "./core/Renderer";

export { getBayerMatrix, uploadBayerTexture } from "./dither/bayer";
export {
  generateBlueNoise,
  uploadBlueNoiseTexture,
  BLUE_NOISE_SIZE,
} from "./noise/blueNoise";

export { damp, damp2, lerp, clamp, saturate } from "./animation/damp";
export { Clock } from "./animation/Clock";

export { InteractionField } from "./interaction/InteractionField";

export {
  MATERIAL_PRESETS,
  MATERIAL_KIND_REGISTRY,
  getPreset,
} from "./materials/presets";

export { SurfaceCanvas } from "./react/SurfaceCanvas";
export type { SurfaceCanvasProps } from "./react/SurfaceCanvas";
export { useSurfaceControls } from "./react/useSurfaceControls";
