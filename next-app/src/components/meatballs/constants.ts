/** Liquid metal meatballs — locked chrome palette and homepage field caps. */

export const LMM_ALBEDO = "#10a4ff";
export const LMM_CREASE = "#0065a3";
export const LMM_SPEC = "#f3f7ff";

export const LMM_ALBEDO_RGB = [16 / 255, 164 / 255, 1] as const;
export const LMM_CREASE_RGB = [0, 101 / 255, 163 / 255] as const;
export const LMM_SPEC_RGB = [243 / 255, 247 / 255, 1] as const;

/** IQ quadratic smin tension `k` in CSS pixels (neck thickness). */
export const LMM_MERGE_K = 24;

/** Homepage field: fewer charges than the lab demo. */
export const MAX_PRIMARIES = 5;
export const MAX_CHARGES = 10;

export const SPAWN_COOLDOWN_MIN = 0.92;
export const SPAWN_COOLDOWN_MAX = 1.85;
/** Seconds to ease spawn rate up after the majority gate opens. */
export const SPAWN_HEAT_ON_TAU = 0.42;
/** Seconds to ease spawn rate down after the gate closes. */
export const SPAWN_HEAT_OFF_TAU = 0.32;
/** Below this, no new charges — leftovers still finish. */
export const SPAWN_HEAT_MIN = 0.12;
/** Gate must stay closed this long before spawn intent drops (anti-chatter). */
export const SPAWN_OFF_DWELL = 0.22;

export const RADIUS_MIN = 26;
export const RADIUS_MAX = 58;

/** Still cluster in normalized field space (reduced motion). */
export const STILL_CLUSTER: readonly { x: number; y: number; r: number }[] = [
  { x: 0.5, y: 0.42, r: 0.11 },
  { x: 0.58, y: 0.48, r: 0.08 },
  { x: 0.44, y: 0.5, r: 0.075 },
  { x: 0.53, y: 0.36, r: 0.06 },
  { x: 0.4, y: 0.4, r: 0.055 },
];

export const LIQUID_METAL_MEATBALLS_DEFAULTS = {
  mergeK: LMM_MERGE_K,
  maxPrimaries: MAX_PRIMARIES,
  hue: 0,
  sat: 1,
  /** Light homepage slate uses satin. Dark lab ground uses wet. */
  wetness: 0.28,
  wetnessSatin: 0.28,
  wetnessWet: 0.78,
  /** Slower than the lab demo so the proof band stays readable. */
  speed: 0.62,
} as const;
