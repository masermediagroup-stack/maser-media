'use client';

import { useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';

const noopSubscribe = () => () => {};

/**
 * `useReducedMotion()` is `null` during SSR. Branching before mount can disagree
 * with the client after hydration and cause mismatches (e.g. WebGL shaders).
 *
 * `mounted` is false on the server and during hydration; React then re-renders
 * with `true` after hydration when `getSnapshot` differs from `getServerSnapshot`.
 */
export function useReducedMotionAfterMount() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return { mounted, prefersReducedMotion };
}
