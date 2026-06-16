"use client";

import React, { useRef, useEffect } from "react";

interface AsciiWaveProps {
  className?: string;
  /** Single accent fallback when `colors` is not set. */
  color?: string;
  /** Multi-color palette for scattered gradient effacing. */
  colors?: string[];
  speed?: number;
  /** When false, draws a single frame (no animation loop). */
  animated?: boolean;
}

type Rgb = readonly [number, number, number];

const DEFAULT_COLOR = "#10A4FF";

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  if (!Number.isFinite(value)) return [16, 164, 255];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToCss([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const mix = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * mix),
    Math.round(a[1] + (b[1] - a[1]) * mix),
    Math.round(a[2] + (b[2] - a[2]) * mix),
  ];
}

function samplePalette(palette: Rgb[], t: number): Rgb {
  if (palette.length === 0) return hexToRgb(DEFAULT_COLOR);
  if (palette.length === 1) return palette[0];

  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (palette.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(lower + 1, palette.length - 1);
  const frac = scaled - lower;

  return lerpRgb(palette[lower], palette[upper], frac);
}

function scatterMix(col: number, row: number, time: number, speed: number, charWeight: number): number {
  const n1 = Math.sin(col * 0.37 + row * 0.91 + time * 0.004 * speed) * 0.5 + 0.5;
  const n2 = Math.sin(col * 0.13 - row * 0.55 + time * 0.006 * speed + 1.7) * 0.5 + 0.5;
  const n3 = Math.sin(col * 0.71 + row * 0.22 - time * 0.003 * speed) * 0.5 + 0.5;
  const n4 = Math.sin(col * 0.29 + row * 0.64 + time * 0.002 * speed + 4.1) * 0.5 + 0.5;

  const scattered = n1 * 0.34 + n2 * 0.28 + n3 * 0.22 + n4 * 0.16;
  return Math.max(0, Math.min(1, scattered * 0.72 + charWeight * 0.28));
}

const AsciiWave: React.FC<AsciiWaveProps> = ({
  className,
  color = DEFAULT_COLOR,
  colors,
  speed = 1,
  animated = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = (colors?.length ? colors : [color]).map(hexToRgb);

    let animationId = 0;
    let time = 0;

    const resize = () => {
      if (!container || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(container.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(container.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const chars = " .:+x*#".split("");

    const getMetrics = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const fontSize = Math.max(12, Math.min(22, Math.round(height / 6)));
      const columnWidth = Math.max(8, Math.round(fontSize * 0.78));
      const columns = Math.max(1, Math.ceil(width / columnWidth));
      const rows = Math.max(1, Math.ceil(height / fontSize));

      return { width, height, fontSize, columnWidth, columns, rows };
    };

    const drawFrame = () => {
      const { width, height, fontSize, columnWidth, columns, rows } = getMetrics();

      ctx.clearRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let x = 0; x < columns; x++) {
        const shapeBase = Math.sin(x * 0.1) * 0.6 + Math.cos(x * 0.25) * 0.4;
        const breath = Math.sin(time * 0.002 * speed) * 0.1;
        const flicker = Math.sin(time * 0.008 * speed + x * 100) * 0.05;
        const noise = shapeBase + breath + flicker;
        const columnHeightNormal = Math.max(0.35, ((noise + 1) / 2) * 0.82 + 0.22);
        const activeRows = Math.floor(columnHeightNormal * rows);

        for (let y = rows - 1; y > rows - activeRows; y--) {
          const flowShift = time * 0.005 * speed;
          const charNoise = Math.sin(y * 0.2 - flowShift + x * 10);
          const distFromTop = y - (rows - activeRows);
          const fade = Math.min(1, distFromTop / Math.max(4, fontSize * 0.45));
          const normalizedNoise = (charNoise + 1) / 2;
          const charIndex = Math.floor(normalizedNoise * chars.length);
          const char = chars[Math.min(charIndex, chars.length - 1)];
          const charWeight = charIndex / Math.max(1, chars.length - 1);
          const posX = x * columnWidth;
          const posY = y * fontSize;

          if (Math.random() > 0.9) continue;

          const mix = scatterMix(x, y, time, speed, charWeight);
          const rgb = samplePalette(palette, mix);

          ctx.fillStyle = rgbToCss(rgb);
          ctx.globalAlpha = fade;
          ctx.fillText(char, posX, posY);
        }
      }

      ctx.globalAlpha = 1.0;
    };

    const tick = () => {
      drawFrame();
      time += 16;
      animationId = requestAnimationFrame(tick);
    };

    if (animated) {
      animationId = requestAnimationFrame(tick);
    } else {
      drawFrame();
    }

    return () => {
      observer.disconnect();
      if (animated) cancelAnimationFrame(animationId);
    };
  }, [color, colors, speed, animated]);

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden ${className ?? ""}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

export default AsciiWave;
