"use client";

import { useCallback, useEffect, useRef } from "react";
import { fitLogoTransform, rasterFillSvg, type SvgFillPoint } from "./fill-svg";

export const ASCII_CHARSETS = {
  blocks: " ░▒▓█",
  code: " ._-~:;=!*#$@",
  minimal: " .-+X#",
} as const;

export type AsciiCharSet = keyof typeof ASCII_CHARSETS;

export type AsciiShaderConfig = {
  cellSize: number;
  speed: number;
  waveFreq: number;
  waveIntensity: number;
  mouseRadius: number;
  flickerRate: number;
  noiseAmount: number;
  scanlines: number;
  charSet: AsciiCharSet;
};

/** Evil Rabbit AsciiShader defaults. */
export const ASCII_SHADER_DEFAULTS: AsciiShaderConfig = {
  cellSize: 16,
  speed: 1,
  waveFreq: 3,
  waveIntensity: 0.5,
  mouseRadius: 280,
  flickerRate: 8,
  noiseAmount: 0.3,
  scanlines: 0.15,
  charSet: "minimal",
};

const GLITCH = "01{}[]<>/\\|!@#$%&*:;=+-_~";
const MAX_FLYING = 250;
const SPEED_THRESH = 1600;
const SPAWN_DIVISOR = 400;
const SPAWN_CAP = 6;
const CELL_KEY = 100000;
const RASTER_WIDTH = 420;

export type AsciiShaderProps = {
  svgPath: string;
  svgWidth: number;
  svgHeight: number;
  config?: AsciiShaderConfig;
  theme?: "dark" | "light";
  /** `r,g,b` at a point. Maser blue for this test cut. */
  colorFn?: (x: number, y: number, w: number, h: number) => string;
  reducedMotion?: boolean;
  className?: string;
};

type Cell = {
  col: number;
  row: number;
  x: number;
  y: number;
  density: number;
  edgeFactor: number;
  tornUntil: number;
};

type FlyingChar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  r: number;
  g: number;
  b: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  cellIdx: number;
  mass: number;
  dragCoeff: number;
  tumblePhase: number;
  tumbleFreq: number;
  scaleY: number;
  flipSpeed: number;
};

type Velocity = { vx: number; vy: number; speed: number };

function cellKey(col: number, row: number): number {
  return CELL_KEY * col + row;
}

function hash01(n: number): number {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Full Evil Rabbit AsciiShader, scoped to this canvas.
 * Triangle SVG_PATH is replaced by the caller (Blue-HD).
 */
export function AsciiShader({
  svgPath,
  svgWidth,
  svgHeight,
  config = ASCII_SHADER_DEFAULTS,
  theme = "light",
  colorFn,
  reducedMotion = false,
  className,
}: AsciiShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef(config);
  const themeRef = useRef(theme);
  const colorFnRef = useRef(colorFn);
  const reducedRef = useRef(reducedMotion);
  const rafRef = useRef(0);
  const cellsRef = useRef<Cell[]>([]);
  const flyingRef = useRef<FlyingChar[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const lastPtrRef = useRef({ x: -9999, y: -9999, time: 0 });
  const velRef = useRef<Velocity>({ vx: 0, vy: 0, speed: 0 });
  const sizeRef = useRef({ w: 1, h: 1 });
  const originRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const visibleRef = useRef(true);
  const samplesRef = useRef<SvgFillPoint[] | null>(null);

  useEffect(() => {
    configRef.current = config;
    themeRef.current = theme;
    colorFnRef.current = colorFn;
    reducedRef.current = reducedMotion;
  }, [config, theme, colorFn, reducedMotion]);

  const rebuild = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const samples = samplesRef.current;
    if (!samples) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(1, parent.clientWidth);
    const cssH = Math.max(1, parent.clientHeight);
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    sizeRef.current = { w: cssW, h: cssH };

    const innerW = cssW / 1.56;
    const innerH = cssH / 1.56;
    const padX = (cssW - innerW) / 2;
    const padY = (cssH - innerH) / 2;
    const fitted = fitLogoTransform(innerW, innerH, svgWidth, svgHeight);
    const scale = fitted.scale;
    const offsetX = fitted.offsetX + padX;
    const offsetY = fitted.offsetY + padY;
    const cellSize = configRef.current.cellSize;
    const cellH = 1.6 * cellSize;
    const bins = new Map<number, { count: number; edgeSum: number }>();

    for (const sample of samples) {
      const key = cellKey(
        Math.floor((sample.x * scale + offsetX) / cellSize),
        Math.floor((sample.y * scale + offsetY) / cellH),
      );
      const bin = bins.get(key);
      if (bin) {
        bin.count += 1;
        bin.edgeSum += sample.edgeDist;
      } else {
        bins.set(key, { count: 1, edgeSum: sample.edgeDist });
      }
    }

    let maxCount = 0;
    for (const bin of bins.values()) {
      if (bin.count > maxCount) maxCount = bin.count;
    }

    const cells: Cell[] = [];
    for (const [key, bin] of bins) {
      const row = key % CELL_KEY;
      const col = (key - row) / CELL_KEY;
      cells.push({
        col,
        row,
        x: col * cellSize + cellSize / 2,
        y: row * cellH + 0.8 * cellSize,
        density: maxCount > 0 ? bin.count / maxCount : 0,
        edgeFactor: bin.edgeSum / bin.count / 10,
        tornUntil: 0,
      });
    }

    cellsRef.current = cells;
    flyingRef.current = [];
  }, [svgWidth, svgHeight]);

  useEffect(() => {
    samplesRef.current = rasterFillSvg(
      { pathData: svgPath, width: svgWidth, height: svgHeight },
      RASTER_WIDTH,
    );
    rebuild();
  }, [rebuild, svgPath, svgWidth, svgHeight]);

  useEffect(() => {
    rebuild();
  }, [config.cellSize, rebuild]);

  useEffect(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => rebuild());
    ro.observe(parent);
    return () => ro.disconnect();
  }, [rebuild]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const { w, h } = sizeRef.current;
      return {
        x: ((clientX - rect.left) / Math.max(1, rect.width)) * w,
        y: ((clientY - rect.top) / Math.max(1, rect.height)) * h,
      };
    };

    const track = (x: number, y: number) => {
      const now = performance.now();
      const last = lastPtrRef.current;
      const dt = (now - last.time) / 1000;
      if (dt > 0.001 && dt < 0.15) {
        const instVx = (x - last.x) / dt;
        const instVy = (y - last.y) / dt;
        const vel = velRef.current;
        vel.vx = 0.55 * vel.vx + 0.45 * instVx;
        vel.vy = 0.55 * vel.vy + 0.45 * instVy;
        vel.speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
      }
      lastPtrRef.current = { x, y, time: now };
      mouseRef.current = { x, y };
    };

    const onMove = (event: PointerEvent) => {
      const p = toLocal(event.clientX, event.clientY);
      track(p.x, p.y);
    };
    const onDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      onMove(event);
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      velRef.current = { vx: 0, vy: 0, speed: 0 };
      lastPtrRef.current = { x: -9999, y: -9999, time: 0 };
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") onLeave();
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);
    canvas.addEventListener("pointerup", onUp);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const vis = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { threshold: 0.01 },
    );
    vis.observe(canvas);
    return () => vis.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const tick = (now: number) => {
      if (!visibleRef.current || document.visibilityState === "hidden") {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (originRef.current === null) originRef.current = now;
      const elapsed = (now - originRef.current) * 0.001;
      const dt = Math.min((now - (lastFrameRef.current || now)) / 1000, 0.05);
      lastFrameRef.current = now;

      const cfg = configRef.current;
      const reduced = reducedRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { w: cssW, h: cssH } = sizeRef.current;
      const cells = cellsRef.current;
      const mouse = mouseRef.current;
      const vel = velRef.current;
      const flying = flyingRef.current;
      const animT = elapsed * (reduced ? 0 : cfg.speed);
      const cellSize = cfg.cellSize;
      const charset = ASCII_CHARSETS[cfg.charSet] ?? ASCII_CHARSETS.minimal;
      const charCount = charset.length;
      const radius = cfg.mouseRadius;
      const radiusSq = radius * radius;
      const light = themeRef.current === "light";
      const tint = colorFnRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      if (cells.length === 0) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      let minCol = Infinity;
      let maxCol = -Infinity;
      let minRow = Infinity;
      let maxRow = -Infinity;
      for (const cell of cells) {
        if (cell.col < minCol) minCol = cell.col;
        if (cell.col > maxCol) maxCol = cell.col;
        if (cell.row < minRow) minRow = cell.row;
        if (cell.row > maxRow) maxRow = cell.row;
      }
      const colSpan = Math.max(1, maxCol - minCol);
      const rowSpan = Math.max(1, maxRow - minRow);

      const intensityOf = (cell: Cell) => {
        const wave =
          0.5 *
            Math.sin(
              (cell.x / cssW) * cfg.waveFreq * 6.28 +
                (cell.y / cssH) * cfg.waveFreq * 3.14 -
                2 * animT,
            ) +
          0.5;
        let value =
          0.5 * cell.density +
          0.3 * cell.edgeFactor +
          wave * cfg.waveIntensity * 0.3;
        const dx = cell.x - mouse.x;
        const dy = cell.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const near =
          distSq < radiusSq ? Math.max(0, 1 - Math.sqrt(distSq) / radius) : 0;
        if (near > 0) value = Math.min(1, value + 0.5 * near);
        return { value, wave, near };
      };

      const palette = (value: number, wave: number, near: number) => {
        let r: number;
        let g: number;
        let b: number;
        if (light) {
          const e = 30 + 80 * value;
          r = 0.85 * e + 15 * wave;
          g = 0.9 * e + 10 * wave;
          b = e;
        } else {
          const e = 120 + 135 * value;
          r = 0.85 * e + 30 * wave;
          g = 0.9 * e + 20 * wave;
          b = e;
        }
        const alpha = 0.3 + 0.7 * value;
        if (near > 0.1) {
          if (light) {
            r *= 1 - 0.4 * near;
            g *= 1 - 0.4 * near;
            b *= 1 - 0.3 * near;
          } else {
            r += (255 - r) * near;
            g += (255 - g) * near;
            b += (255 - b) * near * 0.8;
          }
        }
        return { r: r | 0, g: g | 0, b: b | 0, alpha };
      };

      if (!reduced && vel.speed > SPEED_THRESH && flying.length < MAX_FLYING) {
        const budget = Math.min(
          Math.floor((vel.speed - SPEED_THRESH) / SPAWN_DIVISOR),
          SPAWN_CAP,
          MAX_FLYING - flying.length,
        );
        const dirX = vel.vx / vel.speed;
        const dirY = vel.vy / vel.speed;
        let spawned = 0;
        const start = Math.floor(Math.random() * cells.length);
        for (let n = 0; n < cells.length && spawned < budget; n++) {
          const idx = (start + n) % cells.length;
          const cell = cells[idx];
          if (!cell || cell.tornUntil > now) continue;
          const dx = cell.x - mouse.x;
          const dy = cell.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (
            distSq > radiusSq ||
            Math.random() > (1 - Math.sqrt(distSq) / radius) * 0.7
          ) {
            continue;
          }
          const { value, wave } = intensityOf(cell);
          const clamped = value > 1 ? 1 : value;
          const glyph =
            charset[Math.min(Math.floor(clamped * (charCount - 1)), charCount - 1)] ??
            ".";
          if (glyph === " ") continue;
          const colors = palette(clamped, wave, 0);
          const mass = 0.5 + 1.5 * Math.random();
          const heading = Math.atan2(dirY, dirX);
          const spread = heading + 1.2 / mass * (Math.random() - 0.5);
          const launchScale = (0.06 + 0.16 * Math.random()) / Math.sqrt(mass);
          const launch = vel.speed * launchScale;
          const side = heading + 1.5708 * (Math.random() > 0.5 ? 1 : -1);
          const sidePush = (vel.speed * (0.01 + 0.04 * Math.random())) / mass;
          const life = 1 + 1.2 * Math.random() + 0.3 * mass;
          cell.tornUntil = now + 1000 * life;
          flying.push({
            x: cell.x,
            y: cell.y,
            vx: Math.cos(spread) * launch + Math.cos(side) * sidePush,
            vy: Math.sin(spread) * launch + Math.sin(side) * sidePush - 30 / mass,
            char: glyph,
            r: colors.r,
            g: colors.g,
            b: colors.b,
            life,
            maxLife: life,
            size: cellSize,
            rotation: (Math.random() - 0.5) * 0.3,
            rotSpeed: (8 / mass) * (Math.random() - 0.5),
            cellIdx: idx,
            mass,
            dragCoeff: 0.001 + 0.002 * Math.random(),
            tumblePhase: 6.28 * Math.random(),
            tumbleFreq: 2 + 4 * Math.random(),
            scaleY: 1,
            flipSpeed: (6 / mass) * (Math.random() - 0.5),
          });
          spawned += 1;
        }
      }

      ctx.font = `${cellSize}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let write = 0;
      for (let i = 0; i < flying.length; i++) {
        const p = flying[i];
        if (!p) continue;
        const age = p.maxLife - p.life;
        p.vy += 280 * p.mass * 0.7 * dt;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1) {
          const drag = (p.dragCoeff * spd * spd) / p.mass;
          p.vx -= (p.vx / spd) * drag * dt;
          p.vy -= (p.vy / spd) * drag * dt;
        }
        p.vx += (15 * Math.sin(age * p.tumbleFreq + p.tumblePhase)) / p.mass * dt;
        p.vy +=
          (8 * Math.cos(age * p.tumbleFreq * 0.7 + 1.3 * p.tumblePhase)) /
          p.mass *
          dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotSpeed * dt;
        p.rotSpeed *= 1 - 1.2 * dt;
        p.scaleY = Math.cos(age * p.flipSpeed + p.tumblePhase);
        p.life -= dt;
        if (p.life <= 0 || p.x < -200 || p.x > cssW + 200 || p.y > cssH + 200) {
          continue;
        }
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        ctx.setTransform(
          dpr * cos,
          dpr * sin * p.scaleY,
          -dpr * sin,
          dpr * cos * p.scaleY,
          dpr * p.x,
          dpr * p.y,
        );
        const frac = p.life / p.maxLife;
        const fade = frac < 0.35 ? (frac / 0.35) * (frac / 0.35) : 1;
        if (tint) {
          ctx.fillStyle = `rgba(${tint(p.x, p.y, cssW, cssH)},${fade})`;
        } else {
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${fade})`;
        }
        ctx.fillText(p.char, 0, 0);
        flying[write] = p;
        write += 1;
      }
      flying.length = write;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cellSize}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (!cell || cell.tornUntil > now) continue;
        const revealT = Math.max(
          0,
          elapsed -
            (0.5 * ((cell.col - minCol) / colSpan) +
              0.5 * ((cell.row - minRow) / rowSpan)) *
              1.2,
        );
        const reveal = Math.min(revealT / 1, 1);
        if (reveal <= 0) continue;
        const revealed = reveal >= 1;
        const glitchSlot = revealed
          ? -1
          : Math.floor(20 * revealT + 7 * cell.col + 13 * cell.row);
        const { value, wave, near } = intensityOf(cell);
        let lit = value;
        const flickerSeed =
          43758.5453 *
          Math.sin(
            127.1 * cell.col +
              311.7 * cell.row +
              (animT * cfg.flickerRate | 0) * 43.37,
          );
        const flicker = flickerSeed - Math.floor(flickerSeed);
        if (flicker < 0.15 * cfg.noiseAmount) lit = 2.5 * flicker;
        const glyph =
          charset[Math.min((lit * (charCount - 1)) | 0, charCount - 1)] ?? ".";
        if (glyph === " ") continue;
        const colors = palette(lit, wave, near);
        let r = colors.r;
        let g = colors.g;
        let b = colors.b;
        let alpha = colors.alpha;
        let drawn = glyph;
        if (!revealed && glitchSlot >= 0) {
          drawn = GLITCH[Math.abs(glitchSlot) % GLITCH.length] ?? glyph;
          alpha *= reveal;
        } else if (near > 0.3 && flicker < 0.3) {
          drawn =
            GLITCH[
              (7 * cell.col + 13 * cell.row + ((12 * animT) | 0)) % GLITCH.length
            ] ?? glyph;
        }
        if (tint) {
          const parts = tint(cell.x, cell.y, cssW, cssH).split(",").map(Number);
          const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          r = Math.round((parts[0] ?? 16) * luma);
          g = Math.round((parts[1] ?? 164) * luma);
          b = Math.round((parts[2] ?? 255) * luma);
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillText(drawn, cell.x, cell.y);
      }

      if (cfg.scanlines > 0) {
        ctx.fillStyle = light
          ? `rgba(255,255,255,${0.5 * cfg.scanlines})`
          : `rgba(0,0,0,${0.5 * cfg.scanlines})`;
        for (let y = 0; y < cssH; y += 3) ctx.fillRect(0, y, cssW, 1);
      }

      if (!reduced && cfg.noiseAmount > 0.1) {
        const count = (40 * cfg.noiseAmount) | 0;
        const seed = (3 * animT) | 0;
        ctx.font = `${0.8 * cellSize}px ui-monospace, monospace`;
        const noiseRgb = "16,164,255";
        for (let i = 0; i < count; i++) {
          const a = hash01(127.1 * i + 311.7 * seed);
          const b = hash01(269.5 * i + 183.3 * seed);
          ctx.fillStyle = `rgba(${noiseRgb},${0.03 + 0.06 * a})`;
          ctx.fillText(
            GLITCH[(7 * i + seed) % GLITCH.length] ?? ".",
            0.2 * cssW + a * cssW * 0.6,
            0.15 * cssH + b * cssH * 0.7,
          );
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ touchAction: "none", display: "block", width: "100%", height: "100%" }}
    />
  );
}
