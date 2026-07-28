"use client";

import { motion } from "motion/react";
import { SurfaceCard } from "@/components/demo/SurfaceCard";
import { MaterialControls } from "@/components/demo/MaterialControls";
import { useSurfaceControls, ENGINE_VERSION, MATERIAL_KIND_REGISTRY } from "@/engine";

export function LabDemo() {
  const { params, setParam, setMany, reset } = useSurfaceControls();

  const futureKinds = Object.entries(MATERIAL_KIND_REGISTRY).filter(
    ([, meta]) => !meta.available,
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, #e8e8e8 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 90% 10%, #d4d4d4 0%, transparent 50%), linear-gradient(180deg, #f4f4f5 0%, #ececee 48%, #e4e4e7 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 md:py-20">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Maser Lab · v{ENGINE_VERSION}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Maser Surface Engine
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg">
            A procedural graphics engine for monochrome interface materials.
            Not a UI kit — a rendering pipeline designed for cards, type,
            imagery, and entire sections.
          </p>
        </motion.header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-start"
          >
            <SurfaceCard material={params} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <MaterialControls
              params={params}
              onChange={setParam}
              onPreset={setMany}
              onReset={reset}
            />
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="border-t border-neutral-300/60 pt-10"
        >
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-neutral-900">
            Pipeline
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "1 · Procedural gradient",
              "2 · Ordered Bayer dither",
              "3 · Blue-noise overlay",
              "4 · Posterization",
              "5 · Contrast remapping",
              "6 · Highlight bloom",
              "7 · Animated grain",
              "8 · Motion interpolation",
            ].map((stage) => (
              <li
                key={stage}
                className="rounded-xl border border-neutral-200/80 bg-white/70 px-4 py-3 text-sm text-neutral-700 backdrop-blur-sm"
              >
                {stage}
              </li>
            ))}
          </ol>

          <h2 className="mt-10 font-[family-name:var(--font-display)] text-lg font-semibold text-neutral-900">
            Future materials
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            The registry is designed for expansion. Surface ships first; the
            rest plug into the same renderer contract.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {futureKinds.map(([id, meta]) => (
              <li
                key={id}
                className="rounded-full border border-neutral-300/70 bg-white/50 px-3 py-1 text-xs text-neutral-500"
              >
                {meta.label}
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}
