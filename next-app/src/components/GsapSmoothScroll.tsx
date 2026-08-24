'use client';

import { useLayoutEffect, useRef } from 'react';
import type React from 'react';
import { useReducedMotion } from 'motion/react';

export function GsapSmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion || !wrapperRef.current || !contentRef.current) {
      return;
    }

    if (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) {
      return;
    }

    let cancelled = false;
    let cleanup = () => {};
    let deferFrame = 0;
    let settleFrame = 0;

    // Start immediately so ScrollSmoother can settle under the load curtain.
    // Do not key creation off curtain reveal — that lands on the same tick as intro unlock.
    const run = async () => {
      const [{ gsap }, { ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/ScrollSmoother'),
      ]);

      if (cancelled || !wrapperRef.current || !contentRef.current) {
        return;
      }

      const instantiate = () => {
        if (cancelled || !wrapperRef.current || !contentRef.current) {
          return;
        }

        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
        ScrollSmoother.get()?.kill();

        const smoother = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          smooth: 0.35,
          smoothTouch: false,
          normalizeScroll: false,
          ignoreMobileResize: true,
          effects: false,
        });

        ScrollTrigger.refresh();

        cleanup = () => {
          smoother.kill();
          wrapperRef.current?.removeAttribute('style');
          contentRef.current?.removeAttribute('style');
          document.querySelectorAll('.pin-spacer').forEach((node) => {
            node.remove();
          });
          ScrollTrigger.clearScrollMemory?.();
          ScrollTrigger.refresh();
        };
      };

      // If the curtain already lifted, skip this frame so create() cannot share a turn with finishCurtain.
      if (document.body.classList.contains('mm-intro-complete')) {
        deferFrame = window.requestAnimationFrame(() => {
          settleFrame = window.requestAnimationFrame(instantiate);
        });
        return;
      }

      instantiate();
    };

    void run();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(deferFrame);
      window.cancelAnimationFrame(settleFrame);
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
