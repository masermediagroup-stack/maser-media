'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * `useReducedMotion()` is `null` during SSR. Branching on `=== true` before mount
 * can disagree with the client’s first paint and cause hydration mismatches.
 * Use `mounted && prefersReducedMotion === true` when the UI must differ for
 * reduced-motion users after hydration.
 */
export function useReducedMotionAfterMount() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return { mounted, prefersReducedMotion };
}
