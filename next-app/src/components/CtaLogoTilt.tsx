'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useOverflowClipCheck, runOverflowClipCheck } from '@/hooks/useOverflowClipCheck';

const LOGO_SRC = '/assets/Blue-HD.svg';
const LOGO_VIEWBOX_WIDTH = 3776.87;
const LOGO_VIEWBOX_HEIGHT = 1915.83;
const LOGO_ASPECT = LOGO_VIEWBOX_WIDTH / LOGO_VIEWBOX_HEIGHT;
const LOGO_WIDTH = 640;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_ASPECT);
const MAX_TILT_X = 14;
const MAX_TILT_Y = 16;
const MAX_LIFT = 14;
const LERP = 0.12;

type TiltState = {
  x: number;
  y: number;
  z: number;
};

function prefersFinePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function applyCardTilt(viewport: HTMLElement, current: TiltState) {
  viewport.style.setProperty('--cta-logo-tilt-x', `${current.x}deg`);
  viewport.style.setProperty('--cta-logo-tilt-y', `${current.y}deg`);
  viewport.style.setProperty('--cta-logo-tilt-z', `${current.z}px`);
}

export function CtaLogoTilt({ className }: { className?: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useOverflowClipCheck(shellRef, { label: 'CTA logo', tolerance: 4 });

  useEffect(() => {
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    if (!shell || !viewport || reduceMotion || !prefersFinePointer()) return;

    let disposed = false;
    let isVisible = true;
    let rafId = 0;

    const target: TiltState = { x: 0, y: 0, z: 0 };
    const current: TiltState = { x: 0, y: 0, z: 0 };

    const setPointerTilt = (clientX: number, clientY: number) => {
      const rect = viewport.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;

      target.y = x * MAX_TILT_Y;
      target.x = -y * MAX_TILT_X;
      target.z = MAX_LIFT;
    };

    const resetTilt = () => {
      target.x = 0;
      target.y = 0;
      target.z = 0;
    };

    const renderFrame = () => {
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      current.z += (target.z - current.z) * LERP;
      applyCardTilt(viewport, current);

      if (process.env.NODE_ENV !== 'production' && shell) {
        const issues = runOverflowClipCheck(shell, { label: 'CTA logo (tilt)', tolerance: 4 });
        shell.dataset.mmClipCheck = issues.length === 0 ? 'ok' : 'fail';
      }
    };

    const loop = () => {
      if (disposed || !isVisible) return;
      renderFrame();
      rafId = window.requestAnimationFrame(loop);
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shell.classList.add('mm-cta__logo--active');
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shell.classList.remove('mm-cta__logo--active');
      resetTilt();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          renderFrame();
          rafId = window.requestAnimationFrame(loop);
        } else {
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.01 },
    );

    shell.addEventListener('pointerenter', onPointerEnter);
    shell.addEventListener('pointermove', onPointerMove);
    shell.addEventListener('pointerleave', onPointerLeave);
    observer.observe(shell);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      shell.removeEventListener('pointerenter', onPointerEnter);
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerleave', onPointerLeave);
      shell.classList.remove('mm-cta__logo--active');
      viewport.style.removeProperty('--cta-logo-tilt-x');
      viewport.style.removeProperty('--cta-logo-tilt-y');
      viewport.style.removeProperty('--cta-logo-tilt-z');
    };
  }, [reduceMotion]);

  return (
    <div ref={shellRef} className={cn('mm-cta__logo-shell', className)}>
      <div ref={viewportRef} className="mm-cta__logo-viewport">
        <Image
          src={LOGO_SRC}
          alt="Maser Media"
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          className="mm-cta__logo"
          priority={false}
        />
      </div>
    </div>
  );
}
