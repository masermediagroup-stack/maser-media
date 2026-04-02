'use client';

import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

type ShaderGradientProps = ComponentProps<typeof ShaderGradient>;

const HERO_SHADER_BASE_PROPS: ShaderGradientProps & Record<string, unknown> = {
  animate: 'on',
  axesHelper: 'off',
  brightness: 0.86,
  cAzimuthAngle: 180,
  cDistance: 3.92,
  cPolarAngle: 115,
  cameraZoom: 1,
  color1: '#0b2280',
  color2: '#b8dcff',
  color3: '#000000',
  destination: 'onCanvas',
  embedMode: 'off',
  envPreset: 'city',
  format: 'gif',
  frameRate: 10,
  gizmoHelper: 'hide',
  grain: 'off',
  lightType: '3d',
  positionX: -0.5,
  positionY: 0.1,
  positionZ: 0,
  range: 'disabled',
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.06,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 235,
  shader: 'defaults',
  type: 'waterPlane',
  uAmplitude: 0,
  uDensity: 1.1,
  uFrequency: 5.5,
  uSpeed: 0.1,
  uStrength: 2.05,
  uTime: 0.2,
  wireframe: false,
} as const;

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }

  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function HeroShaderGradient() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const delayMs = reducedMotion ? 0 : 140;
    const id = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  const shaderProps = useMemo(
    () => ({
      ...HERO_SHADER_BASE_PROPS,
      animate: reducedMotion ? 'off' : HERO_SHADER_BASE_PROPS.animate,
      uSpeed: reducedMotion ? 0 : HERO_SHADER_BASE_PROPS.uSpeed,
    }),
    [reducedMotion]
  );

  return (
    <div
      className="hero-god-rays"
      aria-hidden="true"
      style={{ opacity: visible ? 1 : 0, transition: reducedMotion ? undefined : 'opacity 0.45s ease' }}
    >
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        pixelDensity={1}
        fov={50}
      >
        <ShaderGradient {...shaderProps} />
      </ShaderGradientCanvas>
    </div>
  );
}
