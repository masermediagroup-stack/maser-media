'use client';

import { useLayoutEffect, useRef } from 'react';
import type React from 'react';
import { useReducedMotion } from 'motion/react';
import {
  isScrollSmootherEligible,
  loadScrollSmootherPlugins,
  setScrollSmootherActive,
} from '@/lib/scrollSmoother';

export function GsapSmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion || !isScrollSmootherEligible() || !wrapperRef.current || !contentRef.current) {
      return;
    }

    let cancelled = false;
    let cleanup = () => {};

    const run = async () => {
      const { ScrollTrigger, ScrollSmoother } = await loadScrollSmootherPlugins();

      if (cancelled || !wrapperRef.current || !contentRef.current) {
        return;
      }

      ScrollSmoother.get()?.kill();
      setScrollSmootherActive(false);

      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 0.35,
        smoothTouch: false,
        normalizeScroll: false,
        ignoreMobileResize: true,
        effects: false,
      });

      setScrollSmootherActive(true);
      ScrollTrigger.refresh();

      cleanup = () => {
        smoother.kill();
        setScrollSmootherActive(false);
        wrapperRef.current?.removeAttribute('style');
        contentRef.current?.removeAttribute('style');
        document.querySelectorAll('.pin-spacer').forEach((node) => {
          node.remove();
        });
        ScrollTrigger.clearScrollMemory?.();
        ScrollTrigger.refresh();
      };
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduceMotion]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef} className="mm-smooth-wrapper">
      <div id="smooth-content" ref={contentRef} className="mm-smooth-content">
        {children}
      </div>
    </div>
  );
}
