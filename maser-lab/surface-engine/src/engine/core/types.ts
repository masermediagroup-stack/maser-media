/**
 * Maser Surface Engine — Core Types
 *
 * A procedural monochrome material system for web interfaces.
 * Materials describe continuous tonal fields; the renderer discretizes
 * them through an ordered dithering pipeline.
 */

export type BayerSize = 2 | 4 | 8 | 16;

export type MaterialKind =
  | "surface"
  | "liquid"
  | "bubble"
  | "paper"
  | "foam"
  | "mesh"
  | "marble"
  | "crt"
  | "film"
  | "chrome"
  | "glass"
  | "ink"
  | "fabric"
  | "heatmap"
  | "topo"
  | "gradient"
  | "sdf"
  | "custom";

/** All realtime material controls exposed by the engine. */
export interface SurfaceMaterialParams {
  /** Ordered dither matrix size. */
  ditherSize: BayerSize;
  /** Quantization levels before dither (2–32). */
  posterization: number;
  /** Blue-noise threshold mix amount (0–1). */
  noiseScale: number;
  /** Blue-noise temporal drift speed. */
  noiseSpeed: number;
  /** Contrast remapping strength (0–2, 1 = identity). */
  contrast: number;
  /** Brightness offset (−1–1). */
  brightness: number;
  /** Gradient direction in degrees. */
  gradientAngle: number;
  /** Gradient start luminance (0–1). */
  gradientColorA: number;
  /** Gradient end luminance (0–1). */
  gradientColorB: number;
  /** Highlight bloom amount (0–1). */
  bloom: number;
  /** Bloom soft radius in UV space. */
  bloomRadius: number;
  /** Animated grain intensity (0–1). */
  grainAmount: number;
  /** Render pixel density relative to device DPR (0.5–2). */
  pixelDensity: number;
  /** Shadow region pull (0–1). */
  shadowStrength: number;
  /** Highlight region lift (0–1). */
  highlightStrength: number;
  /** Soft gradient falloff (0–1). */
  softEdge: number;
  /** Deterministic procedural seed. */
  randomSeed: number;
  /** Global animation rate multiplier. */
  animationSpeed: number;
  /** How strongly the cursor warps the field (0–1). */
  cursorInfluence: number;
  /** How strongly scroll warps the field (0–1). */
  scrollInfluence: number;
  /** Parallax / depth factor (0–1). */
  depth: number;
  /** Normalized light position [x, y] in 0–1 space. */
  lightPosition: [number, number];
  /** Final opacity (0–1). */
  opacity: number;
  /** Enable blue-noise overlay stage. */
  blueNoiseEnabled: boolean;
}

export type SurfaceMaterialPartial = Partial<SurfaceMaterialParams>;

export interface Vec2 {
  x: number;
  y: number;
}

export interface InteractionSample {
  /** Pointer in element-normalized 0–1 space. */
  pointer: Vec2;
  /** Pointer velocity (normalized units / second). */
  pointerVelocity: Vec2;
  /** Whether the pointer is currently over the surface. */
  pointerActive: boolean;
  /** Scroll progress sample (0–1 typical). */
  scroll: number;
  /** Scroll velocity. */
  scrollVelocity: number;
}

/** Runtime uniforms fed each frame after CPU-side interpolation. */
export interface SurfaceFrameState {
  time: number;
  delta: number;
  resolution: [number, number];
  dpr: number;
  pointer: Vec2;
  light: Vec2;
  scroll: number;
  reducedMotion: boolean;
}

export interface SurfaceRendererOptions {
  canvas: HTMLCanvasElement;
  material?: SurfaceMaterialPartial;
  /** Cap device pixel ratio. Default 2. */
  maxDpr?: number;
  /** Pause when offscreen. Default true. */
  pauseWhenHidden?: boolean;
  onContextLost?: () => void;
}

export type UniformMap = Record<string, WebGLUniformLocation | null>;

export interface MaterialPreset {
  id: string;
  label: string;
  description: string;
  params: SurfaceMaterialPartial;
}
