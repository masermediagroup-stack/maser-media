"use client";

import AsciiWave from "@/components/lightswind/ascii-wave";
import { useReducedMotionGate } from "@/hooks/useReducedMotionGate";

export type AsciiWaveFooterProps = {
  colors?: string[];
  speed?: number;
  className?: string;
};

/** Maser palette: bright blue → mid blue → dark blue → black */
const MASER_FOOTER_PALETTE = ["#10A4FF", "#0097F5", "#0065A3", "#111111"] as const;

/**
 * Full-width ASCII wave strip for the site footer. Honors `prefers-reduced-motion`
 * (empty strip — no animation).
 */
export function AsciiWaveFooter({
  colors = [...MASER_FOOTER_PALETTE],
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
        <AsciiWave className="h-full" colors={colors} speed={speed} animated />
      )}
    </div>
  );
}
