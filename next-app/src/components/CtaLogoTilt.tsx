'use client';

import { useReducedMotion } from 'motion/react';
import { CtaLogoGradient } from './cta-logo-gradient';

export function CtaLogoTilt({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <CtaLogoGradient
      className={className}
      forceReducedMotion={Boolean(reduceMotion)}
    />
  );
}
