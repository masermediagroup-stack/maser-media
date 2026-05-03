'use client';

import { useEffect, useRef } from 'react';
import type React from 'react';
import { useReducedMotion } from 'motion/react';

export function GsapSmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !wrapperRef.current || !contentRef.current) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

    let cleanup = () => {};
    let cancelled = false;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/ScrollSmoother'),
      ]);

      if (cancelled || !wrapperRef.current || !contentRef.current) return;

      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 0.65,
        normalizeScroll: true,
        ignoreMobileResize: true,
        effects: false,
      });

      cleanup = () => {
        smoother.kill();
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
