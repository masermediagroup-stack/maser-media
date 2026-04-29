'use client';

import type { ComponentProps } from 'react';
import { useMemo, useSyncExternalStore } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

type ShaderGradientProps = ComponentProps<typeof ShaderGradient>;

const HERO_SHADER_BASE_PROPS: ShaderGradientProps & Record<string, unknown> = {
  animate: 'on',
  axesHelper: 'off',
  brightness: 1.2,
  cAzimuthAngle: 180,
  cDistance: 3.92,
  cPolarAngle: 115,
  cameraZoom: 1,
  color1: '#1e54a8',
  color2: '#d9ecff',
  color3: '#4f8dca',
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
  reflection: 0.12,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 235,
  shader: 'defaults',
  type: 'waterPlane',
  uAmplitude: 0,
  uDensity: 1.1,
  uFrequency: 5.5,
  uSpeed: 0.1,
  uStrength: 1.75,
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

  const shaderProps = useMemo(
    () => ({
      ...HERO_SHADER_BASE_PROPS,
      animate: reducedMotion ? 'off' : HERO_SHADER_BASE_PROPS.animate,
      uSpeed: reducedMotion ? 0 : HERO_SHADER_BASE_PROPS.uSpeed,
    }),
    [reducedMotion]
  );

  return (
    <div className="hero-god-rays" aria-hidden="true">
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        pixelDensity={1.25}
        fov={50}
      >
        <ShaderGradient {...shaderProps} />
      </ShaderGradientCanvas>
    </div>
  );
}
