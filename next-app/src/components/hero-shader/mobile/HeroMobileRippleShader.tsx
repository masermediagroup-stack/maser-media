'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';
import { heroRippleFragmentShader, heroRippleVertexShader } from './shaders';
import {
  DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS,
  type HeroMobileRippleShaderProps,
} from './types';

const MAX_ACTIVE_RIPPLES = 4;
const MAX_FRAME_DELTA_S = 1 / 30;

function hexToSrgbVec3(hex: string): THREE.Vector3 {
  const normalized = hex.replace('#', '').trim();
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return new THREE.Vector3(16 / 255, 164 / 255, 1);
  }

  const int = parseInt(value, 16);
  return new THREE.Vector3(
    ((int >> 16) & 0xff) / 255,
    ((int >> 8) & 0xff) / 255,
    (int & 0xff) / 255,
  );
}

type DriftUniforms = {
  uResolution: { value: THREE.Vector2 };
  uTime: { value: number };
  uColor: { value: THREE.Vector3 };
  uRippleOrigins: { value: THREE.Vector2[] };
  uRippleStartTimes: { value: number[] };
  uRippleActives: { value: number[] };
  uRippleStrength: { value: number };
  uRingWidth: { value: number };
  uRippleSpeed: { value: number };
  uDecay: { value: number };
  uDistortionAmount: { value: number };
  uRingCount: { value: number };
};

function DriftShaderPlane({
  color,
  visibleRef,
  shaderClockRef,
}: {
  color: string;
  visibleRef: React.RefObject<boolean>;
  shaderClockRef: React.RefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const controls = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS;

  const uniforms = useMemo<DriftUniforms>(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uColor: { value: hexToSrgbVec3(color) },
      uRippleOrigins: {
        value: Array.from({ length: MAX_ACTIVE_RIPPLES }, () => new THREE.Vector2(0.5, 0.5)),
      },
      uRippleStartTimes: { value: Array.from({ length: MAX_ACTIVE_RIPPLES }, () => -10) },
      uRippleActives: { value: Array.from({ length: MAX_ACTIVE_RIPPLES }, () => 0) },
      uRippleStrength: { value: controls.rippleStrength },
      uRingWidth: { value: controls.ringWidth },
      uRippleSpeed: { value: controls.rippleSpeed },
      uDecay: { value: controls.decay },
      uDistortionAmount: { value: controls.distortionAmount },
      uRingCount: { value: controls.ringCount },
    }),
    [color, controls],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material || !visibleRef.current || document.hidden) return;

    shaderClockRef.current += Math.min(delta, MAX_FRAME_DELTA_S);
    material.uniforms.uTime.value = shaderClockRef.current;
    material.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={heroRippleVertexShader}
        fragmentShader={heroRippleFragmentShader}
        uniforms={uniforms}
        toneMapped={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function HeroMobileDriftCanvas({
  color,
  visibleRef,
  shaderClockRef,
}: {
  color: string;
  visibleRef: React.RefObject<boolean>;
  shaderClockRef: React.RefObject<number>;
}) {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.15);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        premultipliedAlpha: false,
      }}
      dpr={dpr}
      frameloop="always"
      style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.NoToneMapping;
        gl.outputColorSpace = THREE.LinearSRGBColorSpace;
      }}
    >
      <DriftShaderPlane color={color} visibleRef={visibleRef} shaderClockRef={shaderClockRef} />
    </Canvas>
  );
}

export function HeroMobileRippleShader({
  className = '',
  color = '#10A4FF',
}: HeroMobileRippleShaderProps) {
  const reduceMotion = useReducedMotionGate();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const shaderClockRef = useRef(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '35% 0px 35% 0px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const canvasClassName = `mm-hero__smokey-canvas mm-hero__smokey-canvas--mobile h-full min-h-0 w-full ${className}`.trim();

  if (reduceMotion) {
    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full min-w-0 overflow-hidden bg-black ${canvasClassName}`}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 95% 70% at 50% 88%, rgba(16, 164, 255, 0.12), transparent 58%), #000',
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full min-w-0 overflow-hidden ${canvasClassName}`}
      aria-hidden
    >
      <HeroMobileDriftCanvas
        color={color}
        visibleRef={visibleRef}
        shaderClockRef={shaderClockRef}
      />
    </div>
  );
}
