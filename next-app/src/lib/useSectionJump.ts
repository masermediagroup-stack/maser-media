'use client';

import { useCallback, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';

export function useSectionJump() {
  const pathname = usePathname();

  const handleSectionJump = useCallback(
    (sectionId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== '/') return;

      const section = document.getElementById(sectionId);
      if (!section) return;

      event.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      const needsTemporaryTabIndex = !section.hasAttribute('tabindex');
      if (needsTemporaryTabIndex) {
        section.setAttribute('tabindex', '-1');
      }
      section.focus({ preventScroll: true });
      if (needsTemporaryTabIndex) {
        section.removeAttribute('tabindex');
      }
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    },
    [pathname]
  );

  return { pathname, handleSectionJump };
}
