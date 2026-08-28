import { LOOP_SECONDS } from "./constants";

export type WashClock = {
  advance: (speed: number) => number;
  readonly phase: number;
};

/**
 * Integrated wash phase. Speed is d(phase)/dt, not a multiply on wall time.
 * Angle is applied by consumers as which corner is hot, not added into this clock.
 */
export function createWashClock(): WashClock {
  let phase = 0;
  let lastSec = performance.now() / 1000;

  return {
    advance(speed: number) {
      const now = performance.now() / 1000;
      let dt = now - lastSec;
      lastSec = now;
      if (dt < 0) dt = 0;
      if (dt > 0.1) dt = 0.1;
      const rate = speed < 0 ? 0 : speed;
      phase += (dt * rate) / LOOP_SECONDS;
      phase -= Math.floor(phase);
      if (phase < 0) phase += 1;
      return phase;
    },
    get phase() {
      return phase;
    },
  };
}
