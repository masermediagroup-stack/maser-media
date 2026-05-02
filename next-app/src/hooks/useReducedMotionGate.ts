'use client';

import { useEffect, useState } from 'react';

/**
 * Client-only `prefers-reduced-motion: reduce` for React trees.
 * GSAP setup should still read `matchMedia` at init for consistency with first paint.
 */
export function useReducedMotionGate(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return reduced;
}
