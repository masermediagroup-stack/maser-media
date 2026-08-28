import type { CtaLogoGradientLook } from "./types";

const BLUE: [number, number, number] = [0.062745, 0.643137, 1.0];
const WHITE: [number, number, number] = [0.960784, 0.984314, 1.0];
const DARK: [number, number, number] = [0.031373, 0.447059, 0.768627];

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function luma(rgb: [number, number, number]): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/** White/Glow retint the glyphs but must not bleach them out of the mark. */
function glyphLook(look: CtaLogoGradientLook): CtaLogoGradientLook {
  return {
    ...look,
    highlight: look.highlight * 0.38,
    glow: look.glow * 0.22,
  };
}

function keepGlyphVisible(
  rgb: [number, number, number],
): [number, number, number] {
  const y = luma(rgb);
  if (y <= 0.58) return rgb;
  const t = Math.min(1, (y - 0.58) / 0.32);
  return mix(rgb, BLUE, t);
}

function paletteAt(
  t: number,
  look: CtaLogoGradientLook,
): [number, number, number] {
  const u = t - Math.floor(t);
  const seg = u * 4;
  const i = Math.floor(seg);
  const f = seg - i;
  const hiMix = mix(BLUE, WHITE, look.highlight * 0.48);
  const hi: [number, number, number] = [
    clamp01(hiMix[0] + WHITE[0] * look.glow * 0.18),
    clamp01(hiMix[1] + WHITE[1] * look.glow * 0.18),
    clamp01(hiMix[2] + WHITE[2] * look.glow * 0.18),
  ];
  const lo = mix(BLUE, DARK, look.shade * 0.82);
  let a = BLUE;
  let b = BLUE;
  if (i < 0.5) {
    a = BLUE;
    b = hi;
  } else if (i < 1.5) {
    a = hi;
    b = BLUE;
  } else if (i < 2.5) {
    a = BLUE;
    b = lo;
  } else {
    a = lo;
    b = BLUE;
  }
  const c = mix(a, b, f);
  return [clamp01(c[0]), clamp01(c[1]), clamp01(c[2])];
}

function toCss(rgb: [number, number, number]): string {
  return `rgb(${Math.round(rgb[0] * 255)} ${Math.round(rgb[1] * 255)} ${Math.round(rgb[2] * 255)})`;
}

function toRgba(rgb: [number, number, number], alpha: number): string {
  return `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${alpha})`;
}

/** Must match wash.wgsl. Neighboring cycle distance — never +0.5. */
export const WASH_NEIGHBOR = 0.09;
/** CSS/GPU blob size (ellipse radii as a fraction of the box). */
export const WASH_BLOB_RADIUS = 1.2;
export const WASH_BLOB_STOP = 0.78;

/** Angle 0° = TL hot, then clockwise TR → BR → BL. */
export function hotFromAngle(angleDeg: number): number {
  const turns = angleDeg / 360;
  return (turns - Math.floor(turns)) * 4;
}

function dist4(index: number, hot: number): number {
  const d = Math.abs(index - hot);
  return Math.min(d, 4 - d);
}

function cornerColor(
  phase: number,
  index: number,
  hot: number,
  look: CtaLogoGradientLook,
): [number, number, number] {
  return paletteAt(phase + dist4(index, hot) * WASH_NEIGHBOR, look);
}

/** Drive CSS blob colors. Angle picks the hot corner; UV stays put. */
export function driveCssWash(
  node: HTMLElement,
  look: CtaLogoGradientLook,
  phase: number,
) {
  const hot = hotFromAngle(look.angle);
  node.style.setProperty("--clg-tl", toCss(cornerColor(phase, 0, hot, look)));
  node.style.setProperty("--clg-tr", toCss(cornerColor(phase, 1, hot, look)));
  node.style.setProperty("--clg-br", toCss(cornerColor(phase, 2, hot, look)));
  node.style.setProperty("--clg-bl", toCss(cornerColor(phase, 3, hot, look)));
}

/**
 * Four radial blobs, same mixer as CSS/GPU.
 * `phaseShift` 0.5 inverts the logo cycle for glyphs.
 */
export function paintCornerWash(
  target: CanvasRenderingContext2D,
  width: number,
  height: number,
  look: CtaLogoGradientLook,
  phase: number,
  phaseShift: number,
  layer: "logo" | "glyph" = "logo",
) {
  if (width < 1 || height < 1) return;
  const sample = layer === "glyph" ? glyphLook(look) : look;
  const shifted = phase + phaseShift;
  const hot = hotFromAngle(look.angle);
  const colorAt = (index: number) => {
    const rgb = cornerColor(shifted, index, hot, sample);
    return layer === "glyph" ? keepGlyphVisible(rgb) : rgb;
  };
  const tl = colorAt(0);
  const tr = colorAt(1);
  const br = colorAt(2);
  const bl = colorAt(3);

  target.save();
  target.setTransform(width, 0, 0, height, 0, 0);
  target.globalCompositeOperation = "copy";
  target.fillStyle = toCss(layer === "glyph" ? keepGlyphVisible(BLUE) : BLUE);
  target.fillRect(0, 0, 1, 1);
  target.globalCompositeOperation = "source-over";

  const paintBlob = (
    cx: number,
    cy: number,
    rgb: [number, number, number],
  ) => {
    const gradient = target.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      WASH_BLOB_RADIUS,
    );
    gradient.addColorStop(0, toRgba(rgb, 1));
    gradient.addColorStop(WASH_BLOB_STOP, toRgba(rgb, 0));
    target.fillStyle = gradient;
    target.fillRect(0, 0, 1, 1);
  };

  paintBlob(1, 1, br);
  paintBlob(0, 1, bl);
  paintBlob(1, 0, tr);
  paintBlob(0, 0, tl);
  target.restore();
}
