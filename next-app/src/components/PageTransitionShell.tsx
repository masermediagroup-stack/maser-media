'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'motion/react';

const SITE_ROUTES = new Set(['/', '/work', '/about', '/pricing', '/contact']);
const TRANSITION_FAILSAFE_MS = 1400;

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

export function PageTransitionShell({ children }: { children: ReactNode }) {
  const pathname = normalizePath(usePathname() ?? '/');
  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);
  const routeClickPendingRef = useRef(false);
  const lockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);

  const clearUnlockTimer = useCallback(() => {
    if (unlockTimerRef.current === null) return;
    window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = null;
  }, []);

  useEffect(() => {
    const showOverlay = () => {
      const overlay = overlayRef.current;
      if (!overlay || reduceMotion) return;

      clearUnlockTimer();
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      document.body.classList.add('mm-page-transition-active');
      lockedRef.current = true;
      unlockTimerRef.current = window.setTimeout(() => {
        lockedRef.current = false;
        routeClickPendingRef.current = false;
        document.body.classList.remove('mm-page-transition-active');
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
      }, TRANSITION_FAILSAFE_MS);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');

      if (!link || event.defaultPrevented) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const nextPath = normalizePath(url.pathname);
      const currentPath = normalizePath(window.location.pathname);
      if (nextPath === currentPath || url.hash || !isSiteRoute(nextPath) || !isSiteRoute(currentPath)) return;

      if (lockedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      routeClickPendingRef.current = true;
      showOverlay();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      clearUnlockTimer();
      document.removeEventListener('click', onClick, true);
    };
  }, [clearUnlockTimer, reduceMotion]);

  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    const routeChanged = previousPath !== pathname;
    previousPathRef.current = pathname;

    if (!routeChanged) return;

    if (isSiteRoute(pathname)) {
      resetScroll();
    }

    if (reduceMotion || !isSiteRoute(pathname)) {
      clearUnlockTimer();
      routeClickPendingRef.current = false;
      lockedRef.current = false;
      document.body.classList.remove('mm-page-transition-active');
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;

    let cancelled = false;
    let cleanup = () => {};

    const run = async () => {
      const { gsap } = await import('gsap');
      if (cancelled) return;

      clearUnlockTimer();
      if (!routeClickPendingRef.current) {
        gsap.set(overlay, { autoAlpha: 1 });
        document.body.classList.add('mm-page-transition-active');
      }

      routeClickPendingRef.current = false;

      const tween = gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.42,
        delay: 0.08,
        ease: 'power2.out',
        onComplete: () => {
          if (cancelled) return;
          clearUnlockTimer();
          lockedRef.current = false;
          document.body.classList.remove('mm-page-transition-active');
        },
      });

      cleanup = () => {
        tween.kill();
        gsap.set(overlay, { autoAlpha: 0 });
      };
    };

    void run();

    return () => {
      cancelled = true;
      clearUnlockTimer();
      cleanup();
      lockedRef.current = false;
      document.body.classList.remove('mm-page-transition-active');
    };
  }, [clearUnlockTimer, pathname, reduceMotion]);

  return (
    <>
      {children}
      <div ref={overlayRef} className="mm-route-fade" aria-hidden="true" />
    </>
  );
}
