"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LiquidMetalFallback } from "./fallback";
import { MeatballRenderer, isWebGL2Available } from "./renderer";
import { MeatballSimulation } from "./simulation";
import { SPAWN_OFF_DWELL, LIQUID_METAL_MEATBALLS_DEFAULTS } from "./constants";
import type { LiquidMetalLook, LiquidMetalMeatballsProps } from "./types";
import "./tokens.css";

function subscribeNever(): () => void {
  return () => {};
}

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

function dprForWidth(width: number): number {
  const cap = width < 768 ? 1.25 : 1.75;
  return Math.min(window.devicePixelRatio || 1, cap);
}

/**
 * Spawn only when a majority of the trigger height is on screen.
 * Stop once the section bottom has entered the viewport.
 */
function isSpawnZoneActive(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const visH = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
  const ratio = visH / Math.max(1, rect.height);
  if (ratio < 0.5) return false;
  if (rect.bottom < vh - 4) return false;
  return true;
}

export function LiquidMetalMeatballs({
  triggerRef,
  forceReducedMotion = false,
  className,
  lookRef,
}: LiquidMetalMeatballsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const osReduced = usePrefersReducedMotion();
  const reduced = forceReducedMotion || osReduced;
  const reducedRef = useRef(reduced);
  const lookSourceRef = lookRef;

  const freezeStillRef = useRef<() => void>(() => {});
  const restartLiveRef = useRef<() => void>(() => {});

  const webgl = useSyncExternalStore(
    subscribeNever,
    isWebGL2Available,
    () => true,
  );
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !webgl) return;

    let renderer: MeatballRenderer;
    try {
      renderer = new MeatballRenderer(canvas);
    } catch {
      queueMicrotask(() => setGlFailed(true));
      return;
    }

    const lockedLook: LiquidMetalLook = {
      hue: LIQUID_METAL_MEATBALLS_DEFAULTS.hue,
      sat: LIQUID_METAL_MEATBALLS_DEFAULTS.sat,
      mergeK: LIQUID_METAL_MEATBALLS_DEFAULTS.mergeK,
      wetness: LIQUID_METAL_MEATBALLS_DEFAULTS.wetnessSatin,
      speed: LIQUID_METAL_MEATBALLS_DEFAULTS.speed,
    };

    const sim = new MeatballSimulation();
    const syncLook = () => {
      const look = lookSourceRef?.current ?? lockedLook;
      sim.setTravelSpeed(look.speed);
      renderer.applyLook(look);
    };
    let raf = 0;
    let last = performance.now();
    let spawning = false;
    let offDwell = 0;
    let width = 0;
    let height = 0;
    let running = true;
    let intersecting = false;
    let sized = false;

    const ensureLoop = () => {
      if (!running || document.hidden) return;
      if (raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const readSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
    };

    const sampleGate = (dt: number) => {
      const trigger = triggerRef.current;
      const raw = Boolean(trigger && isSpawnZoneActive(trigger));
      if (raw) {
        offDwell = 0;
        spawning = true;
      } else if (dt <= 0) {
        offDwell = SPAWN_OFF_DWELL;
        spawning = false;
      } else {
        offDwell += dt;
        if (offDwell >= SPAWN_OFF_DWELL) spawning = false;
      }
      if (!reducedRef.current) {
        sim.setSpawning(spawning, { width, height });
      }
    };

    const freezeStill = () => {
      sim.loadStillCluster(width, height);
      syncLook();
      renderer.draw(sim.charges);
    };

    const restartLive = () => {
      readSize();
      renderer.setSize(width, height, dprForWidth(width));
      sim.reset();
      offDwell = 0;
      sampleGate(0);
      syncLook();
      renderer.draw(sim.charges);
      ensureLoop();
    };

    freezeStillRef.current = freezeStill;
    restartLiveRef.current = restartLive;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextW = Math.max(1, rect.width);
      const nextH = Math.max(1, rect.height);
      const widthChanged = Math.abs(nextW - width) >= 1;
      /* Height-only changes (accordion open) must not reallocate the
         drawing buffer mid-interaction. Window resize still updates both. */
      if (sized && !widthChanged) {
        return;
      }
      width = nextW;
      height = nextH;
      sized = true;
      renderer.setSize(width, height, dprForWidth(width));
      if (reducedRef.current) {
        freezeStill();
        return;
      }
      syncLook();
      renderer.draw(sim.charges);
    };

    const loop = (now: number) => {
      if (!running) return;
      if (document.hidden) {
        raf = 0;
        last = now;
        return;
      }
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (reducedRef.current) {
        syncLook();
        renderer.draw(sim.charges);
        raf = 0;
        return;
      }
      sampleGate(dt);
      syncLook();
      sim.step(dt, width, height);
      renderer.draw(sim.charges);
      const busy = spawning || sim.aliveCount > 0;
      if (!busy && !intersecting) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      ensureLoop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = Boolean(entry?.isIntersecting);
        if (intersecting) ensureLoop();
      },
      { root: null, rootMargin: "80% 0px 40% 0px", threshold: 0 },
    );

    const trigger = triggerRef.current;
    if (trigger) io.observe(trigger);
    else io.observe(canvas);

    resize();
    requestAnimationFrame(resize);
    if (reducedRef.current) freezeStill();
    else {
      sampleGate(0);
      ensureLoop();
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      freezeStillRef.current = () => {};
      restartLiveRef.current = () => {};
      renderer.dispose();
    };
    // lookRef is sampled in rAF; adding it here remounts the GL program.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webgl, triggerRef]);

  useEffect(() => {
    reducedRef.current = reduced;
    if (reduced) freezeStillRef.current();
    else restartLiveRef.current();
  }, [reduced]);

  if (!webgl || glFailed) {
    return <LiquidMetalFallback className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className ? `lmm-canvas ${className}` : "lmm-canvas"}
      aria-hidden
    />
  );
}
