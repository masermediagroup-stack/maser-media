'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'motion/react';

const INNER_ROUTES = new Set(['/work', '/about', '/pricing', '/contact']);

type PageState = 'current' | 'exiting' | 'entering';

type PageEntry = {
  id: number;
  pathname: string;
  children: ReactNode;
  state: PageState;
};

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname || '/';
}

function isInnerRoute(pathname: string): boolean {
  return INNER_ROUTES.has(normalizePath(pathname));
}

function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function PageTransitionShell({ children }: { children: ReactNode }) {
  const pathname = normalizePath(usePathname() ?? '/');
  const reduceMotion = useReducedMotion();
  const nextIdRef = useRef(1);
  const skipNextTransitionRef = useRef(false);
  const lockedRef = useRef(false);
  const currentPageRef = useRef<PageEntry>({
    id: 0,
    pathname,
    children,
    state: 'current',
  });
  const nodeRefs = useRef(new Map<number, HTMLDivElement>());
  const [pages, setPages] = useState<PageEntry[]>(() => [currentPageRef.current]);

  useEffect(() => {
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
      if (nextPath === currentPath) return;

      if (url.hash) {
        skipNextTransitionRef.current = true;
        return;
      }

      if (!isInnerRoute(nextPath)) return;

      if (lockedRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useLayoutEffect(() => {
    const currentPage = currentPageRef.current;

    if (currentPage.pathname === pathname) {
      const updated = { ...currentPage, children, state: 'current' as const };
      currentPageRef.current = updated;
      setPages((existing) =>
        existing.length === 1 && existing[0].id === updated.id ? existing : [updated],
      );
      return;
    }

    const skipTransition = skipNextTransitionRef.current;
    skipNextTransitionRef.current = false;

    const nextPage: PageEntry = {
      id: nextIdRef.current,
      pathname,
      children,
      state: 'current',
    };
    nextIdRef.current += 1;

    const shouldTransition = !reduceMotion && !skipTransition && isInnerRoute(pathname);
    currentPageRef.current = nextPage;

    if (!shouldTransition) {
      lockedRef.current = false;
      document.body.classList.remove('mm-page-transition-active');
      setPages([nextPage]);
      if (isInnerRoute(pathname)) {
        resetScroll();
      }
      return;
    }

    lockedRef.current = true;
    setPages([
      { ...currentPage, state: 'exiting' },
      { ...nextPage, state: 'entering' },
    ]);
  }, [children, pathname, reduceMotion]);

  useLayoutEffect(() => {
    const exitingPage = pages.find((page) => page.state === 'exiting');
    const enteringPage = pages.find((page) => page.state === 'entering');

    if (!exitingPage || !enteringPage) return;

    const exitingNode = nodeRefs.current.get(exitingPage.id);
    const enteringNode = nodeRefs.current.get(enteringPage.id);
    if (!exitingNode || !enteringNode) return;

    let cancelled = false;
    let cleanup = () => {};

    const run = async () => {
      const { gsap } = await import('gsap');
      if (cancelled) return;

      document.body.classList.add('mm-page-transition-active');
      resetScroll();

      gsap.set(exitingNode, {
        position: 'relative',
        zIndex: 1,
        willChange: 'transform, opacity',
      });
      gsap.set(enteringNode, {
        autoAlpha: 1,
        clipPath: 'inset(100% 0% 0% 0%)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        overflow: 'auto',
        zIndex: 60,
        willChange: 'clip-path, transform',
      });

      const timeline = gsap.timeline({
        defaults: { duration: 0.9, ease: 'power2.inOut', force3D: true },
        onComplete: () => {
          if (cancelled) return;

          resetScroll();
          gsap.set(exitingNode, { clearProps: 'all' });
          gsap.set(enteringNode, {
            clearProps:
              'clipPath,position,top,left,width,height,overflow,zIndex,opacity,visibility,willChange,transform',
          });
          document.body.classList.remove('mm-page-transition-active');
          lockedRef.current = false;

          setPages([{ ...currentPageRef.current, state: 'current' }]);
        },
      });

      timeline
        .to(exitingNode, { y: '-18vh', autoAlpha: 0.55, scale: 0.985 }, 0)
        .fromTo(
          enteringNode,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)' },
          0,
        );

      cleanup = () => {
        timeline.kill();
        gsap.set([exitingNode, enteringNode], { clearProps: 'all' });
      };
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
      document.body.classList.remove('mm-page-transition-active');
      lockedRef.current = false;
    };
  }, [pages]);

  return (
    <div data-page-transition-wrapper>
      {pages.map((page) => (
        <div
          key={page.id}
          ref={(node) => {
            if (node) {
              nodeRefs.current.set(page.id, node);
            } else {
              nodeRefs.current.delete(page.id);
            }
          }}
          data-page-transition-container
          data-page-transition-state={page.state}
          data-page-transition-path={page.pathname}
        >
          {page.children}
        </div>
      ))}
    </div>
  );
}
