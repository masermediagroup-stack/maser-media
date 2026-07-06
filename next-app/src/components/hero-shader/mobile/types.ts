export interface HeroMobileRippleShaderControls {
  /** Wave amplitude for each ring pass. */
  rippleStrength?: number;
  /** Distance between ripple wave peaks (UV space). */
  ringWidth?: number;
  /** Outward expansion speed for ripple fronts. */
  rippleSpeed?: number;
  /** Ring falloff sharpness — higher = tighter rings. */
  decay?: number;
  /** UV displacement amount — warps the smokey field through the ripple. */
  distortionAmount?: number;
  /** Number of concentric rings spawned per click. */
  ringCount?: number;
}

export interface HeroMobileRippleShaderProps extends HeroMobileRippleShaderControls {
  className?: string;
  /** Primary shader accent (Maser blue). */
  color?: string;
}

export const DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS = {
  rippleStrength: 1.35,
  ringWidth: 0.022,
  rippleSpeed: 0.28,
  decay: 8.5,
  distortionAmount: 0.42,
  ringCount: 4,
} as const satisfies Required<HeroMobileRippleShaderControls>;
