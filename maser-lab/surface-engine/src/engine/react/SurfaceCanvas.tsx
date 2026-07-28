"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SurfaceRenderer } from "../core/Renderer";
import type { SurfaceMaterialPartial } from "../core/types";
import { cn } from "@/lib/utils";

export interface SurfaceCanvasProps {
  className?: string;
  style?: CSSProperties;
  material?: SurfaceMaterialPartial;
  /** Soft cursor influence — desktop pointer only by default. */
  interactive?: boolean;
  maxDpr?: number;
  onReady?: (renderer: SurfaceRenderer) => void;
}

/**
 * React host for the Surface Engine.
 * Material updates go to the renderer via refs — no per-frame React state.
 */
export function SurfaceCanvas({
  className,
  style,
  material,
  interactive = true,
  maxDpr = 2,
  onReady,
}: SurfaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SurfaceRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: SurfaceRenderer;
    try {
      renderer = new SurfaceRenderer({
        canvas,
        material,
        maxDpr,
      });
    } catch {
      return;
    }

    rendererRef.current = renderer;
    renderer.start();
    onReady?.(renderer);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      renderer.setScroll(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      rendererRef.current = null;
    };
    // Mount once — material changes applied via dedicated effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDpr]);

  useEffect(() => {
    if (material && rendererRef.current) {
      rendererRef.current.setMaterial(material);
    }
  }, [material]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !rendererRef.current) return;
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / Math.max(1, rect.width);
    const ny = (event.clientY - rect.top) / Math.max(1, rect.height);
    rendererRef.current.setPointer(nx, ny, true);
  };

  const handlePointerLeave = () => {
    rendererRef.current?.clearPointer();
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("block h-full w-full", className)}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden
    />
  );
}
