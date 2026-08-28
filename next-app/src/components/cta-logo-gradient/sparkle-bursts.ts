/** Seeded 0..1. Never Math.random. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export const ASCII_CHARS = ".:+x*#";
export const ASCII_CHAR_COUNT = ASCII_CHARS.length;

const SLOTS = 3;

export function baseCharIndex(column: number, row: number): number {
  const n = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
  const frac = n - Math.floor(n);
  return Math.floor(Math.abs(frac) * ASCII_CHAR_COUNT) % ASCII_CHAR_COUNT;
}

/**
 * In-place character tick. Always a valid charset index — never empty.
 * Clustered bursts swap to another glyph then settle. A sparse minority
 * keeps a slow live-terminal tick.
 */
export function liveCharIndex(
  column: number,
  row: number,
  columns: number,
  rows: number,
  timeSec: number,
): number {
  const base = baseCharIndex(column, row);
  const n = ASCII_CHAR_COUNT;

  for (let slot = 0; slot < SLOTS; slot++) {
    const period = 1.55 + slot * 0.4;
    const shifted = timeSec + slot * 0.67;
    const generation = Math.floor(shifted / period);
    const elapsed = shifted - generation * period;
    const holdSec = 0.09 + hash(generation * 19.1 + slot * 4.7) * 0.08;
    if (elapsed > holdSec) continue;
    const cx = hash(generation * 13.7 + slot * 4.1) * columns;
    const cy = hash(generation * 29.3 + slot * 8.7) * rows;
    const radius = 2.4 + hash(generation * 5.9 + slot) * 3.4;
    if (Math.hypot(column - cx, row - cy) > radius) continue;
    const member = hash(column * 17.2 + row * 9.4 + generation * 3.1 + slot);
    if (member < 0.28) continue;
    const swap = 1 + Math.floor(hash(column + row * 13 + generation + slot) * (n - 1));
    return (base + swap) % n;
  }

  const vitality = hash(column * 41.2 + row * 17.9);
  if (vitality > 0.948) {
    const period = 0.24 + hash(column * 3.1 + row) * 0.48;
    const phase = hash(column * 8.8 + row * 2.2);
    const step = Math.floor(timeSec / period + phase * 11);
    return (base + step) % n;
  }

  return base;
}
