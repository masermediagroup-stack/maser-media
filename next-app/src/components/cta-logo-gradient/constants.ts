import type { CtaLogoGradientLook } from "./types";

export const LOGO_SRC = "/assets/cta-logo-gradient/Blue-HD.svg";

/** Production CtaLogoTilt throw. */
export const MAX_TILT_X = 14;
export const MAX_TILT_Y = 16;
export const MAX_LIFT = 14;
export const LERP = 0.12;
export const LOOP_SECONDS = 9;
export const PERSPECTIVE_PX = 920;

/**
 * Locked ASCII metrics: footer font 22 / column pitch, then ÷ 5.
 * Never re-derive from live canvas height.
 */
export const ASCII_FOOTER_FONT = 22;
export const ASCII_FONT_SIZE = ASCII_FOOTER_FONT / 5;
export const ASCII_CELL_W = Math.max(8, Math.round(ASCII_FOOTER_FONT * 0.78)) / 5;
export const ASCII_CELL_H = ASCII_FOOTER_FONT / 5;

export const CTA_LOGO_GRADIENT_DEFAULTS: CtaLogoGradientLook = {
  speed: 1.5,
  highlight: 1,
  shade: 1,
  glow: 0.55,
  angle: 118,
};

