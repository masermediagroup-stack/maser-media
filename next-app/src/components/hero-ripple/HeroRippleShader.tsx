'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';
import { heroRippleFragmentShader, heroRippleVertexShader } from './shaders';
import {
  DEFAULT_HERO_RIPPLE_CONTROLS,
  type HeroRippleShaderControls,
  type HeroRippleShaderProps,
} from './types';

const RIPPLE_LIFETIME_S = 4.2;

export type RippleState = {
  origin: THREE.Vector2;
  startTime: number;
  active: boolean;
};

type RippleUniforms = {
  uResolution: { value: THREE.Vector2 };
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uAspect: { value: number };
  uRippleOrigin: { value: THREE.Vector2 };
  uRippleStartTime: { value: number };
  uRippleActive: { value: number };
  uRippleStrength: { value: number };
  uRingWidth: { value: number };
  uRippleSpeed: { value: number };
  uDecay: { value: number };
  uWhiteIntensity: { value: number };
  uDistortionAmount: { value: number };
  uRingCount: { value: number };
};

function RippleShaderPlane({
  controls,
  color,
  rippleRef,
  visibleRef,
}: {
  controls: Required<HeroRippleShaderControls>;
  color: string;
  rippleRef: React.RefObject<RippleState>;
  visibleRef: React.RefObject<boolean>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo<RippleUniforms>(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uAspect: { value: 1 },
      uRippleOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      uRippleStartTime: { value: -10 },
      uRippleActive: { value: 0 },
      uRippleStrength: { value: controls.rippleStrength },
      uRingWidth: { value: controls.ringWidth },
      uRippleSpeed: { value: controls.rippleSpeed },
      uDecay: { value: controls.decay },
      uWhiteIntensity: { value: controls.whiteIntensity },
      uDistortionAmount: { value: controls.distortionAmount },
      uRingCount: { value: controls.ringCount },
    }),
    [controls, color],
  );

  useFrame(() => {
    const material = materialRef.current;
    if (!material || !visibleRef.current || document.hidden) return;

    const elapsed = performance.now() / 1000;

    material.uniforms.uTime.value = elapsed;
    material.uniforms.uResolution.value.set(size.width, size.height);
    material.uniforms.uAspect.value = size.width / Math.max(size.height, 1);

    const ripple = rippleRef.current;
    if (!ripple?.active) {
      material.uniforms.uRippleActive.value = 0;
      return;
    }

    const rippleAge = elapsed - ripple.startTime;
    if (rippleAge > RIPPLE_LIFETIME_S) {
      ripple.active = false;
      material.uniforms.uRippleActive.value = 0;
      return;
    }

    material.uniforms.uRippleActive.value = 1;
    material.uniforms.uRippleStartTime.value = ripple.startTime;
    material.uniforms.uRippleOrigin.value.copy(ripple.origin);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={heroRippleVertexShader}
        fragmentShader={heroRippleFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function HeroRippleCanvas({
  controls,
  color,
  rippleRef,
  visibleRef,
  frameloop,
}: {
  controls: Required<HeroRippleShaderControls>;
  color: string;
  rippleRef: React.RefObject<RippleState>;
  visibleRef: React.RefObject<boolean>;
  frameloop: 'always' | 'never';
}) {
  const coarsePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const dpr = coarsePointer ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
        premultipliedAlpha: false,
      }}
      dpr={dpr}
      frameloop={frameloop}
      style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 1);
      }}
    >
      <RippleShaderPlane
        controls={controls}
        color={color}
        rippleRef={rippleRef}
        visibleRef={visibleRef}
      />
    </Canvas>
  );
}

export function HeroRippleShader({
  className = '',
  color = '#10A4FF',
  rippleStrength = DEFAULT_HERO_RIPPLE_CONTROLS.rippleStrength,
  ringWidth = DEFAULT_HERO_RIPPLE_CONTROLS.ringWidth,
  rippleSpeed = DEFAULT_HERO_RIPPLE_CONTROLS.rippleSpeed,
  decay = DEFAULT_HERO_RIPPLE_CONTROLS.decay,
  whiteIntensity = DEFAULT_HERO_RIPPLE_CONTROLS.whiteIntensity,
  distortionAmount = DEFAULT_HERO_RIPPLE_CONTROLS.distortionAmount,
  ringCount = DEFAULT_HERO_RIPPLE_CONTROLS.ringCount,
}: HeroRippleShaderProps) {
  const reduceMotion = useReducedMotionGate();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const rippleRef = useRef<RippleState>({
    origin: new THREE.Vector2(0.5, 0.5),
    startTime: -10,
    active: false,
  });

  const controls = useMemo<Required<HeroRippleShaderControls>>(
    () => ({
      rippleStrength,
      ringWidth,
      rippleSpeed,
      decay,
      whiteIntensity,
      distortionAmount,
      ringCount,
    }),
    [rippleStrength, ringWidth, rippleSpeed, decay, whiteIntensity, distortionAmount, ringCount],
  );

  const spawnRipple = useCallback(
    (clientX: number, clientY: number) => {
      const node = containerRef.current;
      if (!node || reduceMotion) return;

      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;

      rippleRef.current.origin.set(x, y);
      rippleRef.current.startTime = performance.now() / 1000;
      rippleRef.current.active = true;
    },
    [reduceMotion],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node || reduceMotion) return;

    const hero = node.closest<HTMLElement>('.mm-hero');
    const interactionTarget = hero ?? node;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      spawnRipple(event.clientX, event.clientY);
    };

    interactionTarget.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => interactionTarget.removeEventListener('pointerdown', onPointerDown);
  }, [reduceMotion, spawnRipple]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting);
        visibleRef.current = next;
        setInView(next);
      },
      { rootMargin: '35% 0px 35% 0px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  if (reduceMotion) {
    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full min-w-0 overflow-hidden bg-black ${className}`}
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
      className={`relative h-full w-full min-w-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <HeroRippleCanvas
        controls={controls}
        color={color}
        rippleRef={rippleRef}
        visibleRef={visibleRef}
        frameloop={inView && pageVisible ? 'always' : 'never'}
      />
    </div>
  );
}

export default HeroRippleShader;
