'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';
import { heroRippleFragmentShader, heroRippleVertexShader } from './shaders';
import {
  DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS,
  type HeroMobileRippleShaderControls,
  type HeroMobileRippleShaderProps,
} from './types';

const RIPPLE_LIFETIME_S = 8;
const MAX_ACTIVE_RIPPLES = 4;
const MAX_FRAME_DELTA_S = 1 / 30;
const DRAG_RIPPLE_MIN_DISTANCE_PX = 34;
const DRAG_RIPPLE_MIN_INTERVAL_S = 0.16;

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

export type RippleState = {
  origin: THREE.Vector2;
  startTime: number;
  active: boolean;
};

type RipplePoolState = {
  ripples: RippleState[];
  nextIndex: number;
};

type RippleUniforms = {
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

function RippleShaderPlane({
  controls,
  color,
  rippleRef,
  visibleRef,
  shaderClockRef,
}: {
  controls: Required<HeroMobileRippleShaderControls>;
  color: string;
  rippleRef: React.RefObject<RipplePoolState>;
  visibleRef: React.RefObject<boolean>;
  shaderClockRef: React.RefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo<RippleUniforms>(
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
    [controls, color],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material || !visibleRef.current || document.hidden) return;

    shaderClockRef.current += Math.min(delta, MAX_FRAME_DELTA_S);
    const elapsed = shaderClockRef.current;

    material.uniforms.uTime.value = elapsed;
    material.uniforms.uResolution.value.set(size.width, size.height);

    rippleRef.current.ripples.forEach((ripple, index) => {
      const rippleAge = elapsed - ripple.startTime;
      const active = ripple.active && rippleAge <= RIPPLE_LIFETIME_S;

      if (!active) {
        ripple.active = false;
      }

      material.uniforms.uRippleActives.value[index] = active ? 1 : 0;
      material.uniforms.uRippleStartTimes.value[index] = ripple.startTime;
      material.uniforms.uRippleOrigins.value[index].copy(ripple.origin);
    });
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

function HeroMobileRippleCanvas({
  controls,
  color,
  rippleRef,
  visibleRef,
  shaderClockRef,
}: {
  controls: Required<HeroMobileRippleShaderControls>;
  color: string;
  rippleRef: React.RefObject<RipplePoolState>;
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
      <RippleShaderPlane
        controls={controls}
        color={color}
        rippleRef={rippleRef}
        visibleRef={visibleRef}
        shaderClockRef={shaderClockRef}
      />
    </Canvas>
  );
}

export function HeroMobileRippleShader({
  className = '',
  color = '#10A4FF',
  rippleStrength = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.rippleStrength,
  ringWidth = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.ringWidth,
  rippleSpeed = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.rippleSpeed,
  decay = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.decay,
  distortionAmount = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.distortionAmount,
  ringCount = DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.ringCount,
}: HeroMobileRippleShaderProps) {
  const reduceMotion = useReducedMotionGate();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const shaderClockRef = useRef(0);
  const activePointerRef = useRef<{
    id: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const rippleRef = useRef<RipplePoolState>({
    nextIndex: 0,
    ripples: Array.from({ length: MAX_ACTIVE_RIPPLES }, () => ({
      origin: new THREE.Vector2(0.5, 0.5),
      startTime: -10,
      active: false,
    })),
  });

  const controls = useMemo<Required<HeroMobileRippleShaderControls>>(
    () => ({
      rippleStrength,
      ringWidth,
      rippleSpeed,
      decay,
      distortionAmount,
      ringCount,
    }),
    [rippleStrength, ringWidth, rippleSpeed, decay, distortionAmount, ringCount],
  );

  const spawnRipple = useCallback(
    (clientX: number, clientY: number) => {
      const node = containerRef.current;
      if (!node || reduceMotion) return;

      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      const x = THREE.MathUtils.clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = THREE.MathUtils.clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
      const pool = rippleRef.current;
      const slot = pool.ripples[pool.nextIndex];

      slot.origin.set(x, y);
      slot.startTime = shaderClockRef.current;
      slot.active = true;
      pool.nextIndex = (pool.nextIndex + 1) % pool.ripples.length;
    },
    [reduceMotion],
  );

  const clearRipples = useCallback(() => {
    activePointerRef.current = null;
    rippleRef.current.ripples.forEach((ripple) => {
      ripple.active = false;
      ripple.startTime = -10;
    });
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || reduceMotion) return;

    const hero = node.closest<HTMLElement>('.mm-hero');
    const interactionTarget = hero ?? node;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      spawnRipple(event.clientX, event.clientY);
      activePointerRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: shaderClockRef.current,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const activePointer = activePointerRef.current;
      if (!activePointer || activePointer.id !== event.pointerId) return;

      const dx = event.clientX - activePointer.x;
      const dy = event.clientY - activePointer.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = shaderClockRef.current - activePointer.time;

      if (distance < DRAG_RIPPLE_MIN_DISTANCE_PX || elapsed < DRAG_RIPPLE_MIN_INTERVAL_S) {
        return;
      }

      spawnRipple(event.clientX, event.clientY);
      activePointer.x = event.clientX;
      activePointer.y = event.clientY;
      activePointer.time = shaderClockRef.current;
    };

    const onPointerEnd = (event: PointerEvent) => {
      if (activePointerRef.current?.id === event.pointerId) {
        activePointerRef.current = null;
      }
    };

    interactionTarget.addEventListener('pointerdown', onPointerDown, { passive: true });
    interactionTarget.addEventListener('pointermove', onPointerMove, { passive: true });
    interactionTarget.addEventListener('pointerup', onPointerEnd, { passive: true });
    interactionTarget.addEventListener('pointercancel', onPointerEnd, { passive: true });

    return () => {
      interactionTarget.removeEventListener('pointerdown', onPointerDown);
      interactionTarget.removeEventListener('pointermove', onPointerMove);
      interactionTarget.removeEventListener('pointerup', onPointerEnd);
      interactionTarget.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [reduceMotion, spawnRipple]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting);
        visibleRef.current = next;
        if (!next) {
          clearRipples();
        }
      },
      { rootMargin: '35% 0px 35% 0px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [clearRipples]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearRipples();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [clearRipples]);

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
      <HeroMobileRippleCanvas
        controls={controls}
        color={color}
        rippleRef={rippleRef}
        visibleRef={visibleRef}
        shaderClockRef={shaderClockRef}
      />
    </div>
  );
}
