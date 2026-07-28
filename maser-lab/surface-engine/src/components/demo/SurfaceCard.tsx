"use client";

import { useRef, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionStyle,
} from "motion/react";
import { SurfaceCanvas } from "@/engine";
import type { SurfaceMaterialPartial } from "@/engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SurfaceCardProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  material?: SurfaceMaterialPartial;
  className?: string;
  onCtaClick?: () => void;
}

/**
 * Demonstration card for the Surface Engine.
 * Soft cursor tilt — heavily damped, never gimmicky.
 */
export function SurfaceCard({
  title = "Surface Field 01",
  description = "A procedural monochrome material driven by the Maser Surface Engine. Ordered dithering, tonal remapping, and cursor-aware light — engineered for editorial interfaces.",
  ctaLabel = "Explore Engine",
  material,
  className,
  onCtaClick,
}: SurfaceCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, {
    stiffness: 120,
    damping: 28,
    mass: 0.8,
  });
  const springY = useSpring(rotateY, {
    stiffness: 120,
    damping: 28,
    mass: 0.8,
  });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    // Very subtle — max ~2.5 degrees
    rotateY.set(px * 5);
    rotateX.set(py * -4);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const style = {
    rotateX: springX,
    rotateY: springY,
    transformPerspective: 1200,
  } as MotionStyle;

  return (
    <motion.article
      ref={cardRef}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "group relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
        <SurfaceCanvas
          className="absolute inset-0"
          material={material}
          interactive
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12), transparent 55%)",
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Maser Lab
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-500">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-2">
          <Button
            type="button"
            onClick={onCtaClick}
            className="w-full rounded-xl bg-neutral-950 text-white hover:bg-neutral-800"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
