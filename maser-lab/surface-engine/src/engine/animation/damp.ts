/**
 * Heavily damped exponential interpolation.
 * No spring, no overshoot — natural ease toward targets.
 */

/** Approach `target` with a time-constant of `smoothTime` seconds. */
export function damp(
  current: number,
  target: number,
  smoothTime: number,
  delta: number,
): number {
  if (smoothTime <= 0) return target;
  const omega = 2 / Math.max(0.0001, smoothTime);
  const x = omega * delta;
  // Exp approximation stable for large delta.
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  return target + (current - target) * exp;
}

export function damp2(
  current: { x: number; y: number },
  target: { x: number; y: number },
  smoothTime: number,
  delta: number,
): { x: number; y: number } {
  return {
    x: damp(current.x, target.x, smoothTime, delta),
    y: damp(current.y, target.y, smoothTime, delta),
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function saturate(value: number): number {
  return clamp(value, 0, 1);
}
