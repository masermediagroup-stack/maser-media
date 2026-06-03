/**
 * Shared ScrollSmoother + ScrollTrigger registration and init coordination.
 * Landing ScrollTriggers should run after ScrollSmoother.create() when eligible.
 */

type ScrollSmootherPlugins = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  ScrollSmoother: typeof import('gsap/ScrollSmoother').ScrollSmoother;
};

let pluginsPromise: Promise<ScrollSmootherPlugins> | null = null;

export function isScrollSmootherEligible(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) return false;
  return true;
}

export function loadScrollSmootherPlugins(): Promise<ScrollSmootherPlugins> {
  pluginsPromise ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/ScrollSmoother'),
  ]).then(([{ gsap }, { ScrollTrigger }, { ScrollSmoother }]) => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    return { gsap, ScrollTrigger, ScrollSmoother };
  });

  return pluginsPromise;
}

export function setScrollSmootherActive(active: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('mm-scroll-smoother-active', active);
}

/**
 * Waits until ScrollSmoother exists (desktop homepage) or times out.
 * No-ops when smooth scroll is disabled (mobile / reduced motion).
 */
export async function whenScrollSmootherReady(timeoutMs = 4000): Promise<void> {
  if (!isScrollSmootherEligible()) return;

  const { ScrollSmoother } = await loadScrollSmootherPlugins();
  if (ScrollSmoother.get()) return;

  const started = performance.now();
  while (!ScrollSmoother.get()) {
    if (performance.now() - started > timeoutMs) break;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}
