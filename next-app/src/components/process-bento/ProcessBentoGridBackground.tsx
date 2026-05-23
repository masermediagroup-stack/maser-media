'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';

const MOBILE_LITE_MQ = '(max-width: 760px)';
const GRID_SIZE = 32;
const TRAIL_LENGTH = 4;
const DARK_GRID_COLOR = 'rgba(16, 164, 255, 0.15)';
const DARK_EFFECT_COLOR = 'rgba(16, 164, 255, 0.65)';



function subscribeMobileLite(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(MOBILE_LITE_MQ);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getMobileLiteSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_LITE_MQ).matches;
}

function getMobileLiteServerSnapshot() {
  return false;
}
function isMobileLite(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_LITE_MQ).matches;
}

/**
 * Lightswind InteractiveGridBackground adapted for the Process bento launch tile.
 * Container-sized canvas, in-view rAF only, static poster on mobile / reduced motion.
 */
export function ProcessBentoGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const mouseActiveRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });
  const reducedMotion = useReducedMotionGate();
  const mobileLite = useSyncExternalStore(
    subscribeMobileLite,
    getMobileLiteSnapshot,
    getMobileLiteServerSnapshot,
  );
  const usePosterOnly = reducedMotion || mobileLite;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || usePosterOnly) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let inView = false;
    let rafId = 0;
    let running = false;

    const resize = () => {
      const w = Math.max(1, Math.floor(container.clientWidth));
      const h = Math.max(1, Math.floor(container.clientHeight));
      if (w === sizeRef.current.width && h === sizeRef.current.height) return;
      sizeRef.current = { width: w, height: h };
      canvas.width = w;
      canvas.height = h;
    };

    const draw = () => {
      if (cancelled || !inView || document.hidden) {
        running = false;
        return;
      }

      const { width: canvasWidth, height: canvasHeight } = sizeRef.current;
      if (canvasWidth < 1 || canvasHeight < 1) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.strokeStyle = DARK_GRID_COLOR;
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      if (!mouseActiveRef.current) {
        trailRef.current = [];
      }

      if (mouseActiveRef.current && trailRef.current.length > 0) {
        trailRef.current.forEach((cell, idx) => {
          const alpha = 1 - idx * (1 / (TRAIL_LENGTH + 1));
          const rgbaColor = DARK_EFFECT_COLOR.replace(/[\d.]+\)$/g, `${alpha})`);

          ctx.fillStyle = rgbaColor;
          ctx.shadowColor = rgbaColor;
          ctx.shadowBlur = 16;
          ctx.fillRect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        });
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (running || cancelled || !inView) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafId);
      running = false;
    };

    const pushTrailCell = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height) return;

      const snappedX = Math.floor(rawX / GRID_SIZE);
      const snappedY = Math.floor(rawY / GRID_SIZE);
      const last = trailRef.current[0];
      if (!last || last.x !== snappedX || last.y !== snappedY) {
        trailRef.current.unshift({ x: snappedX, y: snappedY });
        if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.pop();
      }
    };

    const onPointerEnter = () => {
      mouseActiveRef.current = true;
      if (inView) startLoop();
    };

    const onPointerLeave = () => {
      mouseActiveRef.current = false;
      trailRef.current = [];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!mouseActiveRef.current) return;
      pushTrailCell(e.clientX, e.clientY);
    };

    canvas.addEventListener('pointerenter', onPointerEnter);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointermove', onPointerMove);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          resize();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.08, rootMargin: '48px 0px' },
    );
    intersectionObserver.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (inView) startLoop();
    });
    resizeObserver.observe(container);

    const mobileMq = window.matchMedia(MOBILE_LITE_MQ);
    const onMobileChange = () => {
      if (mobileMq.matches) {
        stopLoop();
      } else if (!reducedMotion) {
        resize();
        if (inView) startLoop();
      }
    };
    mobileMq.addEventListener('change', onMobileChange);

    resize();

    return () => {
      cancelled = true;
      stopLoop();
      canvas.removeEventListener('pointerenter', onPointerEnter);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointermove', onPointerMove);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      mobileMq.removeEventListener('change', onMobileChange);
    };
  }, [usePosterOnly, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`mm-process-bento__media mm-process-bento__media--launch-grid${usePosterOnly ? ' mm-process-bento__media--poster-only' : ''}`}
      aria-hidden
    >
      <div className="mm-process-bento__poster mm-process-bento__poster--launch-grid" />
      <canvas ref={canvasRef} className="mm-process-bento__shader-canvas" />
    </div>
  );
}
