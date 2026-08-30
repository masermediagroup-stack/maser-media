import type { RefObject } from "react";

export type LiquidMetalLook = {
  /** Degrees offset around locked Maser-blue hue. */
  hue: number;
  /** Saturation multiplier. 1 = locked family. */
  sat: number;
  /** IQ smin k in CSS pixels. */
  mergeK: number;
  /** Material 0 satin … 1 wet. Not a light. */
  wetness: number;
  /** Travel multiplier on the weighted arc. 1 = locked mercury pace. Not spawn. */
  speed: number;
};

export type LiquidMetalMeatballsProps = {
  /** Element whose intersection starts/stops spawning. */
  triggerRef: RefObject<Element | null>;
  /** Demo override; also honors OS `prefers-reduced-motion`. */
  forceReducedMotion?: boolean;
  className?: string;
  /**
   * Optional look override, sampled from rAF. Product defaults stay locked
   * when omitted. Must not remount the canvas (not an effect dep).
   */
  lookRef?: RefObject<LiquidMetalLook | null>;
};

export type SequencePhase = "idle" | "sequence" | "finishing" | "still";
