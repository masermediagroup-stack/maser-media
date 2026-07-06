export interface HeroRippleShaderControls {
  /** Wave amplitude for each ring pass. */
  rippleStrength?: number;
  /** Distance between ripple wave peaks (UV space). */
  ringWidth?: number;
  /** Outward expansion speed for ripple fronts. */
  rippleSpeed?: number;
  /** Ring falloff sharpness — higher = tighter rings. */
  decay?: number;
  /** Brightness of white ridge highlights on blue areas. */
  whiteIntensity?: number;
  /** UV displacement amount for embossed groove look. */
  distortionAmount?: number;
  /** Number of concentric rings spawned per click. */
  ringCount?: number;
}

export interface HeroRippleShaderProps extends HeroRippleShaderControls {
  className?: string;
  /** Primary shader accent (Maser blue). */
  color?: string;
}

export const DEFAULT_HERO_RIPPLE_CONTROLS = {
  rippleStrength: 0.14,
  ringWidth: 0.018,
  rippleSpeed: 0.42,
  decay: 9.5,
  whiteIntensity: 0.72,
  distortionAmount: 0.055,
  ringCount: 5,
} as const satisfies Required<HeroRippleShaderControls>;
