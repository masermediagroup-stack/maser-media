export type CtaLogoGradientLook = {
  speed: number;
  highlight: number;
  shade: number;
  glow: number;
  /** Travel angle in degrees. */
  angle: number;
};

export type CtaLogoGradientProps = {
  className?: string;
  forceReducedMotion?: boolean;
  look?: CtaLogoGradientLook;
};
