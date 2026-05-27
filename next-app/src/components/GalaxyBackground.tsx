'use client';

import { useEffect } from 'react';

/** Fixed site backdrop — dark base with a soft gradient (replaces animated galaxy canvas). */
export function GalaxyBackground() {
  useEffect(() => {
    document.body.classList.add('galaxy-active');
    return () => {
      document.body.classList.remove('galaxy-active');
    };
  }, []);

  return <div className="galaxy-background" id="galaxy-background" aria-hidden="true" />;
}
