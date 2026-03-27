'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

const PARTICLE_LIMIT = 18;

export function CursorAura() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (coarsePointer || reducedMotionMedia.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let running = false;
    let isReduced: boolean = reducedMotionMedia.matches;
    const particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnParticle = () => {
      if (!pointer.active) return;
      if (particles.length >= PARTICLE_LIMIT) particles.shift();

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.06 + Math.random() * 0.2;
      const life = 28 + Math.random() * 30;

      particles.push({
        x: pointer.x + (Math.random() - 0.5) * 7,
        y: pointer.y + (Math.random() - 0.5) * 7,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.015,
        life,
        maxLife: life,
        size: 0.55 + Math.random() * 1.2,
      });
    };

    let spawnAccumulator = 0;

    const frame = () => {
      if (isReduced) {
        running = false;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (pointer.active) {
        const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 92);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.105)');
        gradient.addColorStop(0.24, 'rgba(255, 255, 255, 0.06)');
        gradient.addColorStop(0.62, 'rgba(255, 255, 255, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 92, 0, Math.PI * 2);
        ctx.fill();

        // Very sparse particle cadence: subtle sparkle, not a continuous trail.
        spawnAccumulator += 0.055;
        while (spawnAccumulator >= 1) {
          spawnParticle();
          spawnAccumulator -= 1;
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.976;
        p.vy *= 0.976;
        const alpha = (p.life / p.maxLife) * 0.12;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (pointer.active || particles.length > 0) {
        rafId = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const ensureRunning = () => {
      if (running || isReduced) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      ensureRunning();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      isReduced = event.matches;
      if (isReduced) {
        pointer.active = false;
        particles.length = 0;
        cancelAnimationFrame(rafId);
        running = false;
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ensureRunning();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        running = false;
        return;
      }
      if (pointer.active || particles.length > 0) {
        ensureRunning();
      }
    };

    resize();
    ensureRunning();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotionMedia.addEventListener('change', onReducedMotionChange);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotionMedia.removeEventListener('change', onReducedMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-aura-layer" aria-hidden="true" />;
}
