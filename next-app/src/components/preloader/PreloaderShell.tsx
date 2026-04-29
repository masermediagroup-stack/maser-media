'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

import { CONTENT } from '@/lib/content';
import { runPreloadGates } from './usePreloadGate';
import { FlowShaderCanvas } from './FlowShaderCanvas';

export type PreloaderShellProps = {
  children: ReactNode;
  mode?: 'session' | 'always' | 'never';
  maxDurationMs?: number;
};

type PreloaderRuntimeProps = {
  children: ReactNode;
  maxDurationMs: number;
  reduceMotion: boolean;
};

const SEEN_KEY = 'mm_preloader_seen';
const MIN_VISIBLE_MS = 1200;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', sync);
    else mq.addListener(sync);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', sync);
      else mq.removeListener(sync);
    };
  }, []);
  return reduced;
}

export function PreloaderShell({ children, mode = 'session', maxDurationMs = 4500 }: PreloaderShellProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const effectiveMode = useMemo(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') return 'always';
    }
    return mode;
  }, [mode]);

  const shouldRun = useMemo(() => {
    if (effectiveMode === 'never') return false;
    if (effectiveMode === 'always') return true;
    try {
      return sessionStorage.getItem(SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  }, [effectiveMode]);

  if (!shouldRun) return <>{children}</>;

  return (
    <PreloaderRuntime
      key={effectiveMode === 'always' ? pathname : 'session'}
      maxDurationMs={maxDurationMs}
      reduceMotion={reduceMotion}
    >
      {children}
    </PreloaderRuntime>
  );
}

function PreloaderRuntime({ children, maxDurationMs, reduceMotion }: PreloaderRuntimeProps) {
  const [active, setActive] = useState(true);
  const [readyToExit, setReadyToExit] = useState(false);
  const [progress, setProgress] = useState(0);
  const intensityRef = useRef(1);
  const shaderReadyRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    shownAtRef.current = performance.now();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const tl = gsap.timeline({ paused: true });
    tl.set('.mm-preloader', { opacity: 1 });
    tl.fromTo('.mm-preloader__shader', { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0);
    tl.fromTo('.mm-preloader__logo', { y: 24, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 0.12);
    tl.fromTo('.mm-preloader__bar', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.out' }, 0.22);
    tl.play(0);

    const progressTween = gsap.to(
      {},
      {
        duration: 0.7,
        onUpdate: () => {
          if (cancelled) return;
          const t = progressTween.progress() || 0;
          setProgress(Math.min(0.88, t * 0.88));
        },
      },
    );

    const run = async () => {
      const extra: string[] = [
        CONTENT.site.logo,
        CONTENT.hero.heroLogo?.src ?? '',
      ].filter(Boolean);

      await runPreloadGates({
        logoSrc: CONTENT.site.logo,
        extraImageSrcs: extra,
        maxDurationMs,
      });

      if (!reduceMotion) {
        const t0 = performance.now();
        while (!shaderReadyRef.current && performance.now() - t0 < 650) {
          await new Promise((r) => setTimeout(r, 16));
        }
      }

      const elapsed = performance.now() - shownAtRef.current;
      if (elapsed < MIN_VISIBLE_MS) {
        await new Promise((r) => setTimeout(r, MIN_VISIBLE_MS - elapsed));
      }

      if (cancelled) return;
      setReadyToExit(true);
    };

    run();

    return () => {
      cancelled = true;
      progressTween.kill();
      tl.kill();
    };
  }, [active, maxDurationMs, reduceMotion]);

  useEffect(() => {
    if (!active || !readyToExit) return;
    const node = rootRef.current;
    if (!node) return;

    intensityRef.current = 1.65;
    const tl = gsap.timeline();
    tl.to(
      {},
      {
        duration: 0.22,
        onUpdate: () => setProgress((p) => Math.min(1, p + 0.08)),
      },
    );
    tl.to('.mm-preloader__glass', { y: -14, opacity: 0, filter: 'blur(12px)', duration: 0.5, ease: 'power3.inOut' }, 0.12);
    tl.to('.mm-preloader__shader', { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 0.12);
    tl.to(node, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.42);
    tl.add(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // ignore
      }
      setActive(false);
    });
  }, [active, readyToExit]);

  const pct = Math.round(progress * 100);

  return (
    <>
      {children}
      {active ? (
        <div ref={rootRef} className="mm-preloader" role="dialog" aria-modal="true" aria-label="Loading">
          {!reduceMotion ? (
            <FlowShaderCanvas
              intensityRef={intensityRef}
              onFirstFrame={() => {
                shaderReadyRef.current = true;
              }}
            />
          ) : (
            <div className="mm-preloader__static" aria-hidden="true" />
          )}

          <div className="mm-preloader__glass">
            <Image
              src={CONTENT.site.logo}
              alt={CONTENT.site.logoAlt}
              width={CONTENT.site.logoWidth}
              height={CONTENT.site.logoHeight}
              className="mm-preloader__logo"
              priority
            />

            <div className="mm-preloader__meter" aria-label={`Loading ${pct}%`}>
              <div className="mm-preloader__track">
                <div className="mm-preloader__bar" style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} />
              </div>
              <div className="mm-preloader__pct" aria-hidden="true">{pct}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
