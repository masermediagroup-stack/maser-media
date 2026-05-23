'use client';

import {
  ShaderGradient,
  ShaderGradientCanvas,
  type GradientT,
} from '@shadergradient/react';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';

/**
 * Work section WebGL background — always mounted with continuous animation
 * (only paused when the user prefers reduced motion).
 */
export function WorkShaderGradient() {
  const reduceMotion = useReducedMotionGate();
  const animate: 'on' | 'off' = reduceMotion ? 'off' : 'on';

  const gradientProps = {
    animate,
    axesHelper: 'off',
    brightness: 1.2,
    cAzimuthAngle: 170,
    cDistance: 4.41,
    cPolarAngle: 70,
    cameraZoom: 1,
    color1: '#fffcff',
    color2: '#2eabff',
    color3: '#ffffff',
    destination: 'onCanvas',
    embedMode: 'off',
    envPreset: 'city',
    format: 'gif',
    fov: 45,
    frameRate: 10,
    gizmoHelper: 'hide',
    grain: 'off',
    lightType: '3d',
    pixelDensity: 1,
    positionX: 0,
    positionY: 0.9,
    positionZ: -0.3,
    range: 'disabled',
    rangeEnd: 40,
    rangeStart: 0,
    reflection: 0.1,
    rotationX: 45,
    rotationY: 0,
    rotationZ: 0,
    shader: 'defaults',
    type: 'waterPlane',
    uAmplitude: 0,
    uDensity: 1.2,
    uFrequency: 0,
    uSpeed: 0.2,
    uStrength: 3.4,
    uTime: 0,
    wireframe: false,
  } as GradientT;

  return (
    <ShaderGradientCanvas
      className="mm-work__shader-canvas"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      pointerEvents="none"
    >
      <ShaderGradient {...gradientProps} />
    </ShaderGradientCanvas>
  );
}
