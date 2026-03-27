export class Sound {
  private static audioContext: AudioContext | null = null;
  private static isInitialized = false;

  public static init(): void {
    if (this.isInitialized) return;
    try {
      // Safari prefix fallback not needed in modern TS targets, but keep type-safe guard
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Attempt to resume immediately in case of gesture context
      this.audioContext.resume().catch(() => {
        // Ignore; we'll resume on first play
      });
      this.isInitialized = true;
    } catch {
      // No audio available; silently ignore
      this.audioContext = null;
      this.isInitialized = true;
    }
  }

  public static playLineClear(linesCleared: number): void {
    if (!linesCleared || linesCleared <= 0) return;
    if (!this.audioContext) {
      this.init();
    }
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    // Ensure context is running
    void ctx.resume();

    const now = ctx.currentTime;

    // Retro terminal-style beeps: short square-wave blips with quick decay
    // Schedule one blip per line with slight spacing
    const beepDuration = 0.08; // seconds
    const gap = 0.05; // seconds between beeps

    for (let i = 0; i < linesCleared; i++) {
      const startTime = now + i * (beepDuration + gap);
      this.scheduleBeep(ctx, startTime, beepDuration, 900 + i * 120);
    }
  }

  private static scheduleBeep(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    frequency: number
  ): void {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Quick attack and exponential decay for a clicky retro feel
    const maxGain = 0.08; // master volume per beep
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.01);
  }
}


