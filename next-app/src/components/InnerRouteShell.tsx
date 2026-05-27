'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground } from '@/components/GalaxyBackground';
import { LiquidNav } from '@/components/LiquidNav';

/** Shared chrome for /about, /work, and inner work case-study routes. */
export function InnerRouteShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <LiquidNav />
      {children}
    </MotionConfig>
  );
}
