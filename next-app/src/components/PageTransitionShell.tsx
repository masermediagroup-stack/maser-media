'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useReducedMotion } from 'motion/react';
import { sanitizeScrollArtifacts } from '@/lib/scrollSanitize';

const SITE_ROUTES = new Set(['/', '/work', '/about', '/contact']);

/** Full route curtain: fade in → brief hold at black → slow reveal (seconds). */
const ROUTE_FADE = {
  in: 0.58,
  hold: 0.16,
  /** Gradual black → page; keep in 1200–1600ms range. */
  out: 1.4,
  easeIn: 'power3.inOut',
  easeOut: 'power3.out',
} as const;

/** Extra settle time on inner routes for fonts / hero imagery. */
const INNER_ROUTE_READY_MS = 100;

const TRANSITION_FAILSAFE_MS = Math.ceil(
  (ROUTE_FADE.in + ROUTE_FADE.hold + ROUTE_FADE.out + 0.35) * 1000,
);

const TRANSITION_ACTIVE_CLASS = 'mm-page-transition-active';
const TRANSITION_HIDE_CONTENT_CLASS = 'mm-page-transition-hide-content';

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname || '/';
}

function isSiteRoute(pathname: string): boolean {
  return SITE_ROUTES.has(normalizePath(pathname));
}

function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getInternalRoutePath(link: HTMLAnchorElement): string | null {
  const rawHref = link.getAttribute('href');
  if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return null;
  if (link.dataset.mmNativeNav === 'true') return null;
  if (link.target && link.target !== '_self') return null;
  if (link.hasAttribute('download')) return null;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return null;

  const nextPath = normalizePath(url.pathname);
  const currentPath = normalizePath(window.location.pathname);
  if (nextPath === currentPath || url.hash || !isSiteRoute(nextPath) || !isSiteRoute(currentPath)) {
    return null;
  }

  return nextPath;
}

function isModifiedNavigation(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}) {
  return (
    event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
  );
}

export function PageTransitionShell({ children }: { children: ReactNode }) {
  const pathname = normalizePath(usePathname() ?? '/');
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);
  const routeClickPendingRef = useRef(false);
  const pendingPathRef = useRef<string | null>(null);
  const lockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);
  const gsapRef = useRef<typeof import('gsap').gsap | null>(null);
  const revealRunIdRef = useRef(0);

  const clearUnlockTimer = useCallback(() => {
    if (unlockTimerRef.current === null) return;
    window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = null;
  }, []);

  const clearOverlayInlineStyles = useCallback((overlay: HTMLDivElement) => {
    overlay.style.removeProperty('opacity');
    overlay.style.removeProperty('visibility');
  }, []);

  const setTransitionCover = useCallback((cover: boolean) => {
    document.body.classList.toggle(TRANSITION_HIDE_CONTENT_CLASS, cover);
  }, []);

  const armTransitionLock = useCallback(() => {
    clearUnlockTimer();
    document.body.classList.add(TRANSITION_ACTIVE_CLASS, TRANSITION_HIDE_CONTENT_CLASS);
    lockedRef.current = true;
    unlockTimerRef.current = window.setTimeout(() => {
      lockedRef.current = false;
      routeClickPendingRef.current = false;
      pendingPathRef.current = null;
      document.body.classList.remove(TRANSITION_ACTIVE_CLASS, TRANSITION_HIDE_CONTENT_CLASS);
      const overlay = overlayRef.current;
      if (!overlay) return;
      clearOverlayInlineStyles(overlay);
      const gsap = gsapRef.current;
      if (gsap) {
        gsap.killTweensOf(overlay);
        gsap.set(overlay, { autoAlpha: 0 });
      } else {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
      }
    }, TRANSITION_FAILSAFE_MS);
  }, [clearOverlayInlineStyles, clearUnlockTimer]);

  const releaseTransitionLock = useCallback(() => {
    clearUnlockTimer();
    lockedRef.current = false;
    routeClickPendingRef.current = false;
    pendingPathRef.current = null;
    document.body.classList.remove(TRANSITION_ACTIVE_CLASS, TRANSITION_HIDE_CONTENT_CLASS);
  }, [clearUnlockTimer]);

  const loadGsap = useCallback(async () => {
    if (gsapRef.current) return gsapRef.current;
    const { gsap } = await import('gsap');
    gsapRef.current = gsap;
    return gsap;
  }, []);

  const coverRouteInstantly = useCallback(
    async (overlay: HTMLDivElement) => {
      const gsap = await loadGsap();
      clearOverlayInlineStyles(overlay);
      gsap.killTweensOf(overlay);
      gsap.set(overlay, { autoAlpha: 1 });
    },
    [clearOverlayInlineStyles, loadGsap],
  );

  const fadeOverlayIn = useCallback(
    async (overlay: HTMLDivElement) => {
      const gsap = await loadGsap();
      clearOverlayInlineStyles(overlay);
      gsap.killTweensOf(overlay);

      await new Promise<void>((resolve) => {
        gsap.fromTo(
          overlay,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: ROUTE_FADE.in,
            ease: ROUTE_FADE.easeIn,
            overwrite: 'auto',
            onComplete: resolve,
          },
        );
      });
    },
    [clearOverlayInlineStyles, loadGsap],
  );

  const waitForRouteReady = useCallback(async (routePath: string) => {
    await waitForPaint();
    if (routePath !== '/') {
      await delay(INNER_ROUTE_READY_MS);
      await waitForPaint();
    }
  }, []);

  const refreshHomeScroll = useCallback(async () => {
    try {
      const { loadScrollSmootherPlugins } = await import('@/lib/scrollSmoother');
      const { ScrollTrigger } = await loadScrollSmootherPlugins();
      ScrollTrigger.refresh();
    } catch {
      // ScrollTrigger not registered on this route.
    }
  }, []);

  const beginRouteTransition = useCallback(
    async (nextPath: string) => {
      if (reduceMotion || routeClickPendingRef.current) return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      routeClickPendingRef.current = true;
      pendingPathRef.current = nextPath;
      armTransitionLock();

      try {
        await fadeOverlayIn(overlay);
        if (pendingPathRef.current !== nextPath) return;
        router.push(nextPath);
      } catch {
        releaseTransitionLock();
        routeClickPendingRef.current = false;
        pendingPathRef.current = null;
      }
    },
    [armTransitionLock, fadeOverlayIn, reduceMotion, releaseTransitionLock, router],
  );

  useEffect(() => {
    let cancelled = false;

    const preloadGsap = async () => {
      const gsap = await loadGsap();
      if (cancelled) return;
      const overlay = overlayRef.current;
      if (overlay) {
        clearOverlayInlineStyles(overlay);
        gsap.set(overlay, { autoAlpha: 0 });
      }
    };

    void preloadGsap();

    return () => {
      cancelled = true;
    };
  }, [clearOverlayInlineStyles, loadGsap]);

  useEffect(() => {
    const hideContentEarly = (link: HTMLAnchorElement) => {
      if (reduceMotion || routeClickPendingRef.current || lockedRef.current) return;
      if (!getInternalRoutePath(link)) return;
      armTransitionLock();
    };

    const interceptLinkNavigation = (link: HTMLAnchorElement) => {
      const nextPath = getInternalRoutePath(link);
      if (!nextPath || reduceMotion) return false;
      if (routeClickPendingRef.current) return true;

      void beginRouteTransition(nextPath);
      return true;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.defaultPrevented || isModifiedNavigation(event)) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;
      hideContentEarly(link);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;

      if (interceptLinkNavigation(link)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedNavigation(event)) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;

      if (interceptLinkNavigation(link)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onPopState = () => {
      const overlay = overlayRef.current;
      if (!overlay || reduceMotion || !isSiteRoute(window.location.pathname)) return;
      routeClickPendingRef.current = true;
      armTransitionLock();
      void coverRouteInstantly(overlay);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      clearUnlockTimer();
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, [
    armTransitionLock,
    beginRouteTransition,
    clearUnlockTimer,
    coverRouteInstantly,
    reduceMotion,
  ]);

  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    const routeChanged = previousPath !== pathname;

    if (!routeChanged) return;

    if (isSiteRoute(pathname)) {
      resetScroll();
    }

    const nextIsHome = pathname === '/';
    const prevWasHome = previousPath === '/';
    if (!nextIsHome || prevWasHome) {
      void sanitizeScrollArtifacts();
    }
  }, [pathname]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const routeChanged = previousPath !== pathname;

    if (!routeChanged) return;

    if (reduceMotion || !isSiteRoute(pathname)) {
      releaseTransitionLock();
      previousPathRef.current = pathname;
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      previousPathRef.current = pathname;
      return;
    }

    const runId = ++revealRunIdRef.current;
    let cancelled = false;

    const isStale = () => cancelled || revealRunIdRef.current !== runId;

    const run = async () => {
      const gsap = await loadGsap();
      if (isStale()) return;

      clearUnlockTimer();
      clearOverlayInlineStyles(overlay);
      gsap.killTweensOf(overlay);

      const clickedThrough = routeClickPendingRef.current;
      routeClickPendingRef.current = false;
      pendingPathRef.current = null;

      armTransitionLock();
      gsap.set(overlay, { autoAlpha: 1 });

      if (!clickedThrough) {
        gsap.set(overlay, { autoAlpha: 0 });
        await new Promise<void>((resolve) => {
          gsap.fromTo(
            overlay,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: ROUTE_FADE.in,
              ease: ROUTE_FADE.easeIn,
              overwrite: 'auto',
              onComplete: resolve,
            },
          );
        });
        if (isStale()) return;
        await delay(ROUTE_FADE.hold * 1000);
        if (isStale()) return;
      }

      if (pathname === '/') {
        await refreshHomeScroll();
        if (isStale()) return;
      }

      await waitForRouteReady(pathname);
      if (isStale()) return;

      await waitForPaint();
      if (isStale()) return;

      await new Promise<void>((resolve) => {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: ROUTE_FADE.out,
          ease: ROUTE_FADE.easeOut,
          overwrite: 'auto',
          onStart: () => {
            if (isStale()) return;
            setTransitionCover(false);
          },
          onComplete: resolve,
        });
      });
      if (isStale()) return;

      releaseTransitionLock();
      gsap.set(overlay, { autoAlpha: 0 });
      previousPathRef.current = pathname;
    };

    void run();

    return () => {
      cancelled = true;

      if (routeClickPendingRef.current) {
        return;
      }

      clearUnlockTimer();
      const gsap = gsapRef.current;
      if (gsap) {
        gsap.killTweensOf(overlay);
        gsap.set(overlay, { autoAlpha: 0 });
      }
      lockedRef.current = false;
      document.body.classList.remove(TRANSITION_ACTIVE_CLASS, TRANSITION_HIDE_CONTENT_CLASS);
      previousPathRef.current = pathname;
    };
  }, [
    armTransitionLock,
    clearOverlayInlineStyles,
    clearUnlockTimer,
    loadGsap,
    pathname,
    reduceMotion,
    refreshHomeScroll,
    releaseTransitionLock,
    setTransitionCover,
    waitForRouteReady,
  ]);

  return (
    <>
      {children}
      <div ref={overlayRef} className="mm-route-fade" aria-hidden="true" />
    </>
  );
}
