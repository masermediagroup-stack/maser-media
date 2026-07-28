import type { MaterialPreset } from "../core/types";

/**
 * Curated material presets.
 * Future kinds (liquid, paper, chrome…) register here.
 */
export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: "editorial",
    label: "Editorial",
    description: "High-contrast ordered surface for hero media.",
    params: {
      ditherSize: 8,
      posterization: 6,
      contrast: 1.18,
      bloom: 0.28,
      grainAmount: 0.05,
      softEdge: 0.55,
      cursorInfluence: 0.45,
    },
  },
  {
    id: "velvet",
    label: "Velvet",
    description: "Softer tonal steps with gentle bloom.",
    params: {
      ditherSize: 16,
      posterization: 10,
      contrast: 0.95,
      bloom: 0.42,
      bloomRadius: 0.32,
      grainAmount: 0.08,
      softEdge: 0.72,
      shadowStrength: 0.22,
    },
  },
  {
    id: "ink",
    label: "Ink Plate",
    description: "Harder thresholds, print-like density.",
    params: {
      ditherSize: 4,
      posterization: 3,
      contrast: 1.35,
      bloom: 0.12,
      grainAmount: 0.1,
      softEdge: 0.28,
      noiseScale: 0.12,
    },
  },
  {
    id: "mist",
    label: "Mist",
    description: "Low contrast atmospheric wash.",
    params: {
      ditherSize: 16,
      posterization: 12,
      contrast: 0.78,
      brightness: 0.08,
      bloom: 0.35,
      grainAmount: 0.04,
      softEdge: 0.85,
      gradientColorA: 0.22,
      gradientColorB: 0.78,
    },
  },
];

export function getPreset(id: string): MaterialPreset | undefined {
  return MATERIAL_PRESETS.find((preset) => preset.id === id);
}

/** Registry stub for future material kinds. */
export const MATERIAL_KIND_REGISTRY = {
  surface: { label: "Surface", available: true },
  liquid: { label: "Liquid", available: false },
  bubble: { label: "Bubble", available: false },
  paper: { label: "Paper", available: false },
  foam: { label: "Foam", available: false },
  mesh: { label: "Mesh", available: false },
  marble: { label: "Marble", available: false },
  crt: { label: "CRT", available: false },
  film: { label: "Film Grain", available: false },
  chrome: { label: "Chrome", available: false },
  glass: { label: "Glass", available: false },
  ink: { label: "Ink", available: false },
  fabric: { label: "Fabric", available: false },
  heatmap: { label: "Heat Maps", available: false },
  topo: { label: "Topographic", available: false },
  gradient: { label: "Animated Gradients", available: false },
  sdf: { label: "Signed Distance Fields", available: false },
  custom: { label: "Custom Shader", available: false },
} as const;
