import type { InteractionSample, Vec2 } from "../core/types";
import { DAMP } from "../core/constants";
import { damp, damp2 } from "../animation/damp";

/**
 * Pointer + scroll influence field.
 * Samples raw input, then damps toward display values for Stage 8.
 */
export class InteractionField {
  private targetPointer: Vec2 = { x: 0.5, y: 0.5 };
  private displayPointer: Vec2 = { x: 0.5, y: 0.5 };
  private prevPointer: Vec2 = { x: 0.5, y: 0.5 };
  private velocity: Vec2 = { x: 0, y: 0 };
  private active = false;

  private targetScroll = 0;
  private displayScroll = 0;
  private scrollVelocity = 0;
  private prevScroll = 0;

  setPointer(nx: number, ny: number, active = true): void {
    this.targetPointer = {
      x: Math.min(1, Math.max(0, nx)),
      y: Math.min(1, Math.max(0, ny)),
    };
    this.active = active;
  }

  clearPointer(): void {
    this.active = false;
    // Ease light back toward center-right editorial rest pose.
    this.targetPointer = { x: 0.62, y: 0.32 };
  }

  setScroll(progress: number): void {
    this.targetScroll = progress;
  }

  /** Advance damped samples. Call once per frame. */
  update(delta: number): InteractionSample {
    this.displayPointer = damp2(
      this.displayPointer,
      this.targetPointer,
      DAMP.pointer,
      delta,
    );

    const invDelta = delta > 0 ? 1 / delta : 0;
    this.velocity = {
      x: (this.displayPointer.x - this.prevPointer.x) * invDelta,
      y: (this.displayPointer.y - this.prevPointer.y) * invDelta,
    };
    this.prevPointer = { ...this.displayPointer };

    this.displayScroll = damp(
      this.displayScroll,
      this.targetScroll,
      DAMP.scroll,
      delta,
    );
    this.scrollVelocity =
      (this.displayScroll - this.prevScroll) * invDelta;
    this.prevScroll = this.displayScroll;

    return {
      pointer: { ...this.displayPointer },
      pointerVelocity: { ...this.velocity },
      pointerActive: this.active,
      scroll: this.displayScroll,
      scrollVelocity: this.scrollVelocity,
    };
  }

  get pointer(): Vec2 {
    return this.displayPointer;
  }
}
