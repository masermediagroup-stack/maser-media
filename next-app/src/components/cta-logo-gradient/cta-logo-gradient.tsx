"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  CTA_LOGO_GRADIENT_DEFAULTS,
  LERP,
  LOGO_SRC,
  MAX_LIFT,
  MAX_TILT_X,
  MAX_TILT_Y,
  PERSPECTIVE_PX,
} from "./constants";
import { createWashClock } from "./wash-clock";
import { startAsciiGrain } from "./start-ascii-grain";
import { startGradient } from "./start-gradient";
import { driveCssWash } from "./wash-palette";
import type { CtaLogoGradientLook, CtaLogoGradientProps } from "./types";
import "./tokens.css";

type TiltState = {
  x: number;
  y: number;
  z: number;
};

function prefersFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTilt(node: HTMLElement, current: TiltState) {
  node.style.setProperty("--cta-logo-tilt-x", `${current.x}deg`);
  node.style.setProperty("--cta-logo-tilt-y", `${current.y}deg`);
  node.style.setProperty("--cta-logo-tilt-z", `${current.z}px`);
}

/** Homepage CTA lockup. Drop in for production `CtaLogoTilt`. No demo chrome. */
export function CtaLogoGradient({
  className,
  forceReducedMotion = false,
  look = CTA_LOGO_GRADIENT_DEFAULTS,
}: CtaLogoGradientProps) {
  const hitRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const cssWashRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLCanvasElement>(null);
  const asciiRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef<CtaLogoGradientLook>(look);
  const [gpuPainted, setGpuPainted] = useState(false);

  useEffect(() => {
    lookRef.current = look;
  }, [look]);

  useEffect(() => {
    const clock = createWashClock();
    const wash = washRef.current;
    const ascii = asciiRef.current;
    const cssWash = cssWashRef.current;
    let rafId = 0;
    const tick = () => {
      const current = lookRef.current;
      const phase = clock.advance(current.speed);
      if (cssWash) driveCssWash(cssWash, current, phase);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    const stopWash = wash
      ? startGradient({
          canvas: wash,
          lookRef,
          clock,
          onPainted: () => setGpuPainted(true),
        })
      : () => {};
    const stopAscii = ascii
      ? startAsciiGrain({ canvas: ascii, lookRef, clock })
      : () => {};
    return () => {
      window.cancelAnimationFrame(rafId);
      stopWash();
      stopAscii();
    };
  }, []);

  useEffect(() => {
    const hit = hitRef.current;
    const tilt = tiltRef.current;
    if (!hit || !tilt) return;
    if (forceReducedMotion || prefersReducedMotion() || !prefersFinePointer()) {
      applyTilt(tilt, { x: 0, y: 0, z: 0 });
      return;
    }

    let disposed = false;
    let isVisible = true;
    let rafId = 0;
    const target: TiltState = { x: 0, y: 0, z: 0 };
    const current: TiltState = { x: 0, y: 0, z: 0 };

    const setPointerTilt = (clientX: number, clientY: number) => {
      const rect = hit.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
      target.y = x * MAX_TILT_Y;
      target.x = -y * MAX_TILT_X;
      target.z = MAX_LIFT;
    };

    const resetTilt = () => {
      target.x = 0;
      target.y = 0;
      target.z = 0;
    };

    const renderFrame = () => {
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      current.z += (target.z - current.z) * LERP;
      applyTilt(tilt, current);
    };

    const loop = () => {
      if (disposed || !isVisible) return;
      renderFrame();
      rafId = window.requestAnimationFrame(loop);
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      resetTilt();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          renderFrame();
          rafId = window.requestAnimationFrame(loop);
        } else {
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.01 },
    );

    hit.addEventListener("pointerenter", onPointerEnter);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerleave", onPointerLeave);
    observer.observe(hit);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      hit.removeEventListener("pointerenter", onPointerEnter);
      hit.removeEventListener("pointermove", onPointerMove);
      hit.removeEventListener("pointerleave", onPointerLeave);
      applyTilt(tilt, { x: 0, y: 0, z: 0 });
    };
  }, [forceReducedMotion]);

  return (
    <div
      ref={hitRef}
      className={cn("clg-hit", className)}
      style={
        {
          "--clg-highlight": String(look.highlight),
          "--clg-shade": String(look.shade),
          "--clg-glow": String(look.glow),
          "--clg-perspective": `${PERSPECTIVE_PX}px`,
        } as CSSProperties
      }
    >
      <div className="clg-viewport">
        <div ref={tiltRef} className="clg-tilt">
          <Image
            src={LOGO_SRC}
            alt=""
            fill
            sizes="(min-width: 820px) 40vw, 88vw"
            className="clg-plate"
            unoptimized
            draggable={false}
          />
          <div
            className="clg-mark"
            data-gpu={gpuPainted ? "painting" : "pending"}
            aria-hidden="true"
          >
            <div className="clg-wash-layer">
              <div ref={cssWashRef} className="clg-wash" />
            </div>
            <canvas ref={washRef} className="clg-canvas" />
            <canvas ref={asciiRef} className="clg-ascii" />
          </div>
        </div>
      </div>
    </div>
  );
}
