'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';

const MOBILE_LITE_MQ = '(max-width: 760px)';

const MASER_LIQUID_COLORS = ['#10a4ff', '#0065a3', '#0a2f4c', '#10a4ff'] as const;

const LiquidSurface = dynamic(() => import('@/components/process-bento/LiquidSurface'), {
  ssr: false,
  loading: () => null,
});

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileLite(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_LITE_MQ).matches;
}

function supportsWebGl(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;

    const loseContext = gl.getExtension('WEBGL_lose_context');
    loseContext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function ProcessQuoteLiquidSurface() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionGate();
  const [usePosterOnly, setUsePosterOnly] = useState(true);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [tileEl, setTileEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setTileEl(container.parentElement);

    const mobileLite = isMobileLite();
    const motionReduced = reducedMotion || prefersReducedMotion();
    if (mobileLite || motionReduced || !supportsWebGl()) {
      setUsePosterOnly(true);
      return;
    }

    setUsePosterOnly(false);

    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!cancelled) setInView(entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: '80px 0px' },
    );
    observer.observe(container);

    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();

    const mobileMq = window.matchMedia(MOBILE_LITE_MQ);
    const onMobileChange = () => {
      if (mobileMq.matches || prefersReducedMotion() || !supportsWebGl()) {
        setUsePosterOnly(true);
      } else if (!reducedMotion) {
        setUsePosterOnly(false);
      }
    };
    mobileMq.addEventListener('change', onMobileChange);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      mobileMq.removeEventListener('change', onMobileChange);
    };
  }, [reducedMotion]);

  const paused = !inView || !tabVisible;

  return (
    <div
      ref={containerRef}
      className={`mm-process-bento__media${usePosterOnly ? ' mm-process-bento__media--poster-only' : ''}`}
      aria-hidden
    >
      <div className="mm-process-bento__poster mm-process-bento__poster--quote-liquid" />
      {!usePosterOnly ? (
        <LiquidSurface
          className="mm-process-bento__liquid-surface"
          showCursor={false}
          paused={paused}
          interactionRoot={tileEl}
          darkNavyColor="#07111f"
          colors={[...MASER_LIQUID_COLORS]}
          scheme={1}
          speed={1.35}
          intensity={1.65}
          touchStrength={0.38}
          grainIntensity={0.06}
          logoTextureSrc="/assets/MaserMedia-MM-monogram-white-transparent.png"
          logoOpacity={0.42}
          logoScale={2.65}
          logoOffset={{ x: -0.1, y: 0.01 }}
        />
      ) : null}
    </div>
  );
}
