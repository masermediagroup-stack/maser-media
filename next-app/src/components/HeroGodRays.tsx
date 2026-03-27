'use client';

import { GodRays } from '@paper-design/shaders-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/** MaserMedia Hero background — exported from Paper (ShaderGodRays "MaserMedia Hero background"). */
const MASER_MEDIA_HERO_GOD_RAYS = {
  offsetX: 0,
  offsetY: 0,
  intensity: 0.42,
  spotty: 0.84,
  midSize: 0.53,
  midIntensity: 0.45,
  density: 0.03,
  bloom: 0.61,
  speed: 1.39,
  scale: 0.53,
  /* Opaque black avoids WebGL clear / compositor flashes; Paper used transparent — too bright on first frames */
  colorBack: '#000000',
  /* No pure #fff — peak white in the god-rays read as a flare on refresh */
  colors: ['#0397F5', '#B8D9F8', '#ACD9FF', '#000000', '#000000'],
  colorBloom: '#042694',
};

const { colors, ...godRaysRest } = MASER_MEDIA_HERO_GOD_RAYS;
const COLORS = [...colors];

export function HeroGodRays() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const delayMs = reducedMotion ? 0 : 160;
    const t = window.setTimeout(() => {
      if (!cancelled) setVisible(true);
    }, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [reducedMotion]);

  return (
    <GodRays
      {...godRaysRest}
      colors={COLORS}
      speed={reducedMotion ? 0 : MASER_MEDIA_HERO_GOD_RAYS.speed}
      className="hero-god-rays"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        opacity: visible ? 1 : 0,
        transition: reducedMotion ? undefined : 'opacity 0.45s ease',
      }}
    />
  );
}
