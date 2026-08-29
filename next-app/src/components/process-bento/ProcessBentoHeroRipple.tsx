'use client';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';
import { Ripple } from '@/registry/magicui/ripple';

const MOBILE_LITE_MQ = '(max-width: 760px)';

/**
 * Magic UI ripple for the Process bento hero tile — dark plate, subdued white rings.
 * Mounts only in view; skips animation loop when reduced motion (static dark plate remains).
 */
export function ProcessBentoHeroRipple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotionGate();
  const [numCircles, setNumCircles] = useState(6);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_LITE_MQ);
    const apply = () => setNumCircles(mq.matches ? 4 : 6);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.08, rootMargin: '48px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showRipple = inView && !reducedMotion;

  return (
    <div
      ref={containerRef}
      className="mm-process-bento__media mm-process-bento__media--hero-ripple"
      aria-hidden
    >
      <div className="mm-process-bento__hero-plate" />
      <div
        className={`mm-process-bento__hero-ripple-layer${showRipple ? '' : ' mm-process-bento__hero-ripple-layer--paused'}`}
      >
        {reducedMotion ? null : <Ripple numCircles={numCircles} />}
      </div>
    </div>
  );
}
