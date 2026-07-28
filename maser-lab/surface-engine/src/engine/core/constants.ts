import type { SurfaceMaterialParams } from "./types";

/** Default material — engineered editorial monochrome. */
export const DEFAULT_MATERIAL: SurfaceMaterialParams = {
  ditherSize: 8,
  posterization: 6,
  noiseScale: 0.22,
  noiseSpeed: 0.18,
  contrast: 1.15,
  brightness: 0.02,
  gradientAngle: 138,
  gradientColorA: 0.08,
  gradientColorB: 0.92,
  bloom: 0.28,
  bloomRadius: 0.22,
  grainAmount: 0.06,
  pixelDensity: 1,
  shadowStrength: 0.35,
  highlightStrength: 0.4,
  softEdge: 0.55,
  randomSeed: 0.417,
  animationSpeed: 0.35,
  cursorInfluence: 0.45,
  scrollInfluence: 0.12,
  depth: 0.28,
  lightPosition: [0.62, 0.28],
  opacity: 1,
  blueNoiseEnabled: true,
};

/** Exponential damping time constants (seconds to approach target). */
export const DAMP = {
  pointer: 0.18,
  light: 0.28,
  scroll: 0.32,
  material: 0.14,
  grain: 0.4,
} as const;

export const ENGINE_VERSION = "0.1.0";
export const ENGINE_NAME = "Maser Surface Engine";
