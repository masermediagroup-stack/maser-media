import {
  ASCII_CELL_H,
  ASCII_CELL_W,
  ASCII_FONT_SIZE,
} from "./constants";
import type { WashClock } from "./wash-clock";
import type { CtaLogoGradientLook } from "./types";
import {
  ASCII_CHAR_COUNT,
  ASCII_CHARS,
  liveCharIndex,
} from "./sparkle-bursts";
import { paintCornerWash } from "./wash-palette";

export { ASCII_CHARS };

/**
 * Uniform tiny grid filling the mark.
 * Cell size is pinned (footer font/column ÷ 5). Full lattice restroke is
 * resize-only. Sparkle is an in-place charset tick from a pre-stroked atlas.
 * Fill is the reverse-phase four-blob wash.
 */
export function startAsciiGrain(options: {
  canvas: HTMLCanvasElement;
  lookRef: { current: CtaLogoGradientLook };
  clock: WashClock;
}): () => void {
  const { canvas, lookRef, clock } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  const mask = document.createElement("canvas");
  const maskCtx = mask.getContext("2d");
  const atlas = document.createElement("canvas");
  const atlasCtx = atlas.getContext("2d");
  if (!maskCtx || !atlasCtx) return () => {};

  let disposed = false;
  let rafId = 0;
  let lastPxW = 0;
  let lastPxH = 0;
  let columns = 1;
  let rows = 1;
  let dpr = 1;
  let shown = new Uint8Array(1);
  let cssW = 1;
  let cssH = 1;

  const rebuildAtlas = () => {
    atlas.width = Math.max(1, Math.ceil(ASCII_CHAR_COUNT * ASCII_CELL_W * dpr));
    atlas.height = Math.max(1, Math.ceil(ASCII_CELL_H * dpr));
    atlasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    atlasCtx.clearRect(0, 0, ASCII_CHAR_COUNT * ASCII_CELL_W, ASCII_CELL_H);
    atlasCtx.font = `${ASCII_FONT_SIZE}px ui-monospace, monospace`;
    atlasCtx.textAlign = "left";
    atlasCtx.textBaseline = "top";
    atlasCtx.fillStyle = "#ffffff";
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      atlasCtx.fillText(ASCII_CHARS[i] ?? ".", i * ASCII_CELL_W, 0);
    }
  };

  const blitCell = (column: number, row: number, index: number) => {
    const sx = index * ASCII_CELL_W * dpr;
    const sy = 0;
    const sw = ASCII_CELL_W * dpr;
    const sh = ASCII_CELL_H * dpr;
    const dx = column * ASCII_CELL_W;
    const dy = row * ASCII_CELL_H;
    maskCtx.clearRect(dx, dy, ASCII_CELL_W, ASCII_CELL_H);
    maskCtx.drawImage(atlas, sx, sy, sw, sh, dx, dy, ASCII_CELL_W, ASCII_CELL_H);
  };

  const rebuildMask = () => {
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.max(1, Math.ceil(cssW / ASCII_CELL_W));
    rows = Math.max(1, Math.ceil(cssH / ASCII_CELL_H));
    shown = new Uint8Array(columns * rows);
    rebuildAtlas();
    maskCtx.clearRect(0, 0, cssW, cssH);
    const t = performance.now() / 1000;
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = liveCharIndex(x, y, columns, rows, t);
        shown[i] = index;
        blitCell(x, y, index);
        i += 1;
      }
    }
  };

  const tickDirtyGlyphs = (timeSec: number) => {
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = liveCharIndex(x, y, columns, rows, timeSec);
        if (shown[i] !== index) {
          shown[i] = index;
          blitCell(x, y, index);
        }
        i += 1;
      }
    }
  };

  const syncCanvasSize = () => {
    dpr = window.devicePixelRatio || 1;
    cssW = Math.max(1, parent.clientWidth);
    cssH = Math.max(1, parent.clientHeight);
    const pxW = Math.max(1, Math.floor(cssW * dpr));
    const pxH = Math.max(1, Math.floor(cssH * dpr));
    if (pxW === lastPxW && pxH === lastPxH) return;

    lastPxW = pxW;
    lastPxH = pxH;
    canvas.width = pxW;
    canvas.height = pxH;
    mask.width = pxW;
    mask.height = pxH;
    rebuildMask();
  };

  const draw = () => {
    tickDirtyGlyphs(performance.now() / 1000);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "copy";
    paintCornerWash(
      ctx,
      canvas.width,
      canvas.height,
      lookRef.current,
      clock.phase,
      0.5,
      "glyph",
    );
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  };

  const tick = () => {
    if (disposed) return;
    draw();
    rafId = window.requestAnimationFrame(tick);
  };

  const observer = new ResizeObserver(syncCanvasSize);
  observer.observe(parent);
  syncCanvasSize();
  rafId = window.requestAnimationFrame(tick);

  return () => {
    disposed = true;
    observer.disconnect();
    window.cancelAnimationFrame(rafId);
  };
}
