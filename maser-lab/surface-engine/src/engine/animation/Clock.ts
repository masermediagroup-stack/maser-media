/**
 * Frame clock for the Surface Engine.
 * Caps delta to keep damping stable after tab switches.
 */

export class Clock {
  private started = 0;
  private last = 0;
  private elapsedInternal = 0;
  private running = false;

  start(): void {
    const now = performance.now();
    this.started = now;
    this.last = now;
    this.elapsedInternal = 0;
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  /** Returns { time, delta } in seconds. Delta capped at 48ms. */
  tick(): { time: number; delta: number } {
    if (!this.running) {
      this.start();
    }
    const now = performance.now();
    const raw = (now - this.last) / 1000;
    const delta = Math.min(0.048, Math.max(0, raw));
    this.last = now;
    this.elapsedInternal += delta;
    return { time: this.elapsedInternal, delta };
  }

  get elapsed(): number {
    return this.elapsedInternal;
  }
}
