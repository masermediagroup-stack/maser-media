"use client";

import AsciiWave from "@/components/lightswind/ascii-wave";
import { useReducedMotionGate } from "@/hooks/useReducedMotionGate";

export type AsciiWaveFooterProps = {
  color?: string;
  speed?: number;
  className?: string;
};

const DEFAULT_BLUE = "#10A4FF";

/**
 * Full-width ASCII wave strip for the site footer. Honors `prefers-reduced-motion`
 * (empty strip — no animation).
 */
export function AsciiWaveFooter({
  color = DEFAULT_BLUE,
  speed = 1,
  className,
}: AsciiWaveFooterProps) {
  const reducedMotion = useReducedMotionGate();

  return (
    <div
      className={`mm-footer__ascii h-[clamp(5.75rem,18vw,8.5rem)] w-full shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      {reducedMotion ? (
        <div className="h-full w-full" />
      ) : (
        <AsciiWave className="h-full" color={color} speed={speed} animated />
      )}
    </div>
  );
}
