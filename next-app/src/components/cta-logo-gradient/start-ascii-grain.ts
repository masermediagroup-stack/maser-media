import {
  ASCII_CELL_H,
  ASCII_CELL_W,
  ASCII_FONT_SIZE,
  LOGO_SRC,
  TEAR_MAX_FLYING,
} from "./constants";
import type { WashClock } from "./wash-clock";
import type { CtaLogoGradientLook } from "./types";
import {
  ASCII_CHAR_COUNT,
  ASCII_CHARS,
  liveCharIndex,
} from "./sparkle-bursts";
import { paintCornerWash } from "./wash-palette";
import {
  cellCenter,
  createPointerVelocity,
  decayPointer,
  drawFlying,
  launchFlyingChar,
  spawnBudget,
  stepFlying,
  tearMouseRadius,
  trackPointer,
  type FlyingChar,
  type TearColor,
} from "./ascii-tear";

export { ASCII_CHARS };

const FALLBACK_GLYPH_COLOR: TearColor = { r: 210, g: 238, b: 255 };
const COVERAGE_ALPHA = 24;
const DRAG_CLICK_PX = 12;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_SRC;
  });
}

function containDrawRect(
  cssW: number,
  cssH: number,
  imgW: number,
  imgH: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const ir = imgW / Math.max(1, imgH);
  const br = cssW / Math.max(1, cssH);
  if (ir > br) {
    const dw = cssW;
    const dh = cssW / ir;
    return { dx: 0, dy: (cssH - dh) / 2, dw, dh };
  }
  const dh = cssH;
  const dw = cssH * ir;
  return { dx: (cssW - dw) / 2, dy: 0, dw, dh };
}

function buildCoverage(
  img: HTMLImageElement,
  cssW: number,
  cssH: number,
  columns: number,
  rows: number,
): Uint8Array {
  const solid = new Uint8Array(columns * rows);
  const w = Math.max(1, Math.floor(cssW));
  const h = Math.max(1, Math.floor(cssH));
  const scratch = document.createElement("canvas");
  scratch.width = w;
  scratch.height = h;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    solid.fill(1);
    return solid;
  }
  const fit = containDrawRect(w, h, img.naturalWidth || w, img.naturalHeight || h);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, fit.dx, fit.dy, fit.dw, fit.dh);
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const px = Math.min(w - 1, Math.max(0, Math.floor((x + 0.5) * ASCII_CELL_W)));
        const py = Math.min(h - 1, Math.max(0, Math.floor((y + 0.5) * ASCII_CELL_H)));
        const a = data[(py * w + px) * 4 + 3] ?? 0;
        solid[i] = a > COVERAGE_ALPHA ? 1 : 0;
        i += 1;
      }
    }
    return solid;
  } catch {
    solid.fill(1);
    return solid;
  }
}

function sampleCellColor(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  column: number,
  row: number,
  dpr: number,
): TearColor | null {
  const probes = [
    [0.5, 0.5],
    [0.32, 0.32],
    [0.68, 0.32],
    [0.32, 0.68],
    [0.68, 0.68],
  ] as const;
  for (let p = 0; p < probes.length; p++) {
    const probe = probes[p];
    if (!probe) continue;
    const px = Math.min(
      canvas.width - 1,
      Math.max(0, Math.floor((column + probe[0]) * ASCII_CELL_W * dpr)),
    );
    const py = Math.min(
      canvas.height - 1,
      Math.max(0, Math.floor((row + probe[1]) * ASCII_CELL_H * dpr)),
    );
    try {
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      if ((pixel[3] ?? 0) > 16) {
        return { r: pixel[0] ?? 0, g: pixel[1] ?? 0, b: pixel[2] ?? 0 };
      }
    } catch {
      return FALLBACK_GLYPH_COLOR;
    }
  }
  return null;
}

/**
 * Uniform tiny grid filling the mark.
 * Cell size is pinned (footer font/column ÷ 5). Full lattice restroke is
 * resize-only. Sparkle is an in-place charset tick from a pre-stroked atlas.
 * Fill is the reverse-phase four-blob wash.
 *
 * Cursor tear is CTA-local: torn cells leave holes in this masked grain;
 * flying glyphs draw on the unmasked overlay so they can leave the silhouette.
 */
export function startAsciiGrain(options: {
  canvas: HTMLCanvasElement;
  flyCanvas: HTMLCanvasElement;
  hit: HTMLElement;
  lookRef: { current: CtaLogoGradientLook };
  clock: WashClock;
  forceReducedMotion?: boolean;
}): () => void {
  const { canvas, flyCanvas, hit, lookRef, clock, forceReducedMotion = false } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const flyCtx = flyCanvas.getContext("2d");
  if (!parent || !ctx || !flyCtx) return () => {};

  const mask = document.createElement("canvas");
  const maskCtx = mask.getContext("2d");
  const atlas = document.createElement("canvas");
  const atlasCtx = atlas.getContext("2d");
  if (!maskCtx || !atlasCtx) return () => {};

  let disposed = false;
  let rafId = 0;
  let lastPxW = 0;
  let lastPxH = 0;
  let lastFlyPxW = 0;
  let lastFlyPxH = 0;
  let columns = 1;
  let rows = 1;
  let dpr = 1;
  let shown = new Uint8Array(1);
  let hole = new Uint8Array(1);
  let solid: Uint8Array = new Uint8Array(1);
  let tornUntil = new Float64Array(1);
  let cssW = 1;
  let cssH = 1;
  let flyCssW = 1;
  let flyCssH = 1;
  let flyOffsetX = 0;
  let flyOffsetY = 0;
  let lastFrameMs = performance.now();
  let isVisible = true;
  let logoImg: HTMLImageElement | null = null;
  let tearOn = !forceReducedMotion && !prefersReducedMotion();

  const flying: FlyingChar[] = [];
  const vel = createPointerVelocity();
  let gestureDrag = 0;
  let toreThisGesture = false;

  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setTearOn = (next: boolean) => {
    tearOn = next;
    if (tearOn) return;
    flying.length = 0;
    tornUntil.fill(0);
    hole.fill(0);
    vel.hasSample = false;
    vel.speed = 0;
    vel.vx = 0;
    vel.vy = 0;
    flyCtx.setTransform(1, 0, 0, 1, 0, 0);
    flyCtx.clearRect(0, 0, flyCanvas.width, flyCanvas.height);
  };

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

  const clearCell = (column: number, row: number) => {
    maskCtx.clearRect(
      column * ASCII_CELL_W,
      row * ASCII_CELL_H,
      ASCII_CELL_W,
      ASCII_CELL_H,
    );
  };

  const rebuildMask = () => {
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.max(1, Math.ceil(cssW / ASCII_CELL_W));
    rows = Math.max(1, Math.ceil(cssH / ASCII_CELL_H));
    const count = columns * rows;
    shown = new Uint8Array(count);
    hole = new Uint8Array(count);
    tornUntil = new Float64Array(count);
    solid = logoImg
      ? buildCoverage(logoImg, cssW, cssH, columns, rows)
      : new Uint8Array(count);
    flying.length = 0;
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

  const tickDirtyGlyphs = (timeSec: number, nowMs: number) => {
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (tornUntil[i]! > nowMs) {
          if (hole[i] !== 1) {
            hole[i] = 1;
            clearCell(x, y);
          }
          i += 1;
          continue;
        }
        const index = liveCharIndex(x, y, columns, rows, timeSec);
        if (hole[i] === 1 || shown[i] !== index) {
          shown[i] = index;
          hole[i] = 0;
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
    if (pxW !== lastPxW || pxH !== lastPxH) {
      lastPxW = pxW;
      lastPxH = pxH;
      canvas.width = pxW;
      canvas.height = pxH;
      mask.width = pxW;
      mask.height = pxH;
      rebuildMask();
    }

    flyCssW = Math.max(1, flyCanvas.clientWidth);
    flyCssH = Math.max(1, flyCanvas.clientHeight);
    flyOffsetX = (flyCssW - cssW) / 2;
    flyOffsetY = (flyCssH - cssH) / 2;
    const flyPxW = Math.max(1, Math.floor(flyCssW * dpr));
    const flyPxH = Math.max(1, Math.floor(flyCssH * dpr));
    if (flyPxW !== lastFlyPxW || flyPxH !== lastFlyPxH) {
      lastFlyPxW = flyPxW;
      lastFlyPxH = flyPxH;
      flyCanvas.width = flyPxW;
      flyCanvas.height = flyPxH;
    }
  };

  const spawnFromPointer = (nowMs: number) => {
    if (!tearOn || !isVisible || !logoImg) return;
    const budget = spawnBudget(vel.speed, flying.length);
    if (budget <= 0) return;

    const radius = tearMouseRadius(cssW, cssH);
    const col0 = Math.max(0, Math.floor((vel.x - radius) / ASCII_CELL_W));
    const col1 = Math.min(columns - 1, Math.ceil((vel.x + radius) / ASCII_CELL_W));
    const row0 = Math.max(0, Math.floor((vel.y - radius) / ASCII_CELL_H));
    const row1 = Math.min(rows - 1, Math.ceil((vel.y + radius) / ASCII_CELL_H));

    type Candidate = { i: number; x: number; y: number; dist: number };
    const near: Candidate[] = [];
    for (let y = row0; y <= row1; y++) {
      for (let x = col0; x <= col1; x++) {
        const i = y * columns + x;
        if (solid[i] !== 1) continue;
        if (tornUntil[i]! > nowMs) continue;
        const c = cellCenter(x, y);
        const dist = Math.hypot(c.x - vel.x, c.y - vel.y);
        if (dist > radius) continue;
        near.push({ i, x, y, dist });
      }
    }
    near.sort((a, b) => a.dist - b.dist);

    let spawned = 0;
    for (let n = 0; n < near.length && spawned < budget; n++) {
      const cell = near[n];
      if (!cell) continue;
      const distNorm = cell.dist / radius;
      if (Math.random() < distNorm * distNorm) continue;
      const color =
        sampleCellColor(ctx, canvas, cell.x, cell.y, dpr) ?? FALLBACK_GLYPH_COLOR;
      const c = cellCenter(cell.x, cell.y);
      const particle = launchFlyingChar({
        x: c.x,
        y: c.y,
        charIndex: shown[cell.i] ?? 0,
        color,
        vel,
      });
      if (flying.length >= TEAR_MAX_FLYING) break;
      flying.push(particle);
      tornUntil[cell.i] = nowMs + particle.lifespan * 1000;
      hole[cell.i] = 1;
      clearCell(cell.x, cell.y);
      spawned += 1;
      toreThisGesture = true;
    }
  };

  const localPoint = (clientX: number, clientY: number) => {
    const rect = hit.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const onPointerDown = (event: PointerEvent) => {
    gestureDrag = 0;
    toreThisGesture = false;
    const p = localPoint(event.clientX, event.clientY);
    vel.hasSample = false;
    trackPointer(vel, p.x, p.y, performance.now());
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!tearOn) return;
    const p = localPoint(event.clientX, event.clientY);
    const now = performance.now();
    if (event.buttons > 0 || event.pointerType !== "mouse") {
      gestureDrag += Math.hypot(event.movementX, event.movementY);
    }
    trackPointer(vel, p.x, p.y, now);
    spawnFromPointer(now);
  };

  const onPointerLeave = () => {
    vel.hasSample = false;
  };

  const onClickCapture = (event: MouseEvent) => {
    if (gestureDrag > DRAG_CLICK_PX || toreThisGesture) {
      event.preventDefault();
      event.stopPropagation();
    }
    gestureDrag = 0;
    toreThisGesture = false;
  };

  const drawFly = () => {
    flyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    flyCtx.clearRect(0, 0, flyCssW, flyCssH);
    if (!tearOn || flying.length === 0) return;
    drawFlying(flyCtx, flying, flyOffsetX, flyOffsetY);
  };

  const draw = (nowMs: number) => {
    tickDirtyGlyphs(nowMs / 1000, nowMs);
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
    drawFly();
  };

  const tick = (nowMs: number) => {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (nowMs - lastFrameMs) / 1000));
    lastFrameMs = nowMs;
    if (isVisible && document.visibilityState !== "hidden") {
      decayPointer(vel, nowMs);
      if (tearOn && flying.length > 0) {
        stepFlying(flying, dt, cssW, cssH, flyOffsetX, flyOffsetY);
      }
      draw(nowMs);
    }
    rafId = window.requestAnimationFrame(tick);
  };

  const onMotionChange = () => {
    setTearOn(!forceReducedMotion && !prefersReducedMotion());
  };

  const observer = new ResizeObserver(syncCanvasSize);
  observer.observe(parent);
  observer.observe(flyCanvas);

  const vis = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
      if (isVisible) lastFrameMs = performance.now();
    },
    { threshold: 0.01 },
  );
  vis.observe(hit);

  motionMq.addEventListener("change", onMotionChange);

  hit.addEventListener("pointerdown", onPointerDown);
  hit.addEventListener("pointermove", onPointerMove);
  hit.addEventListener("pointerleave", onPointerLeave);
  hit.addEventListener("pointercancel", onPointerLeave);
  hit.addEventListener("click", onClickCapture, true);

  syncCanvasSize();
  lastFrameMs = performance.now();
  rafId = window.requestAnimationFrame(tick);

  void loadLogo().then((img) => {
    if (disposed) return;
    logoImg = img;
    lastPxW = 0;
    lastPxH = 0;
    syncCanvasSize();
  });

  return () => {
    disposed = true;
    observer.disconnect();
    vis.disconnect();
    motionMq.removeEventListener("change", onMotionChange);
    hit.removeEventListener("pointerdown", onPointerDown);
    hit.removeEventListener("pointermove", onPointerMove);
    hit.removeEventListener("pointerleave", onPointerLeave);
    hit.removeEventListener("pointercancel", onPointerLeave);
    hit.removeEventListener("click", onClickCapture, true);
    window.cancelAnimationFrame(rafId);
  };
}
