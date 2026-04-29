'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

type Palette = { a: string; b: string; c: string };

export type FlowShaderCanvasProps = {
  paused?: boolean;
  intensity?: number;
  intensityRef?: MutableRefObject<number>;
  palette?: Palette;
  onFirstFrame?: () => void;
};

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec2 uRes;
uniform float uSeed;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec2 hash21(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash21(dot(i, vec2(127.1, 311.7)) + uSeed), f - vec2(0.0, 0.0));
  float b = dot(hash21(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7)) + uSeed), f - vec2(1.0, 0.0));
  float c = dot(hash21(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7)) + uSeed), f - vec2(0.0, 1.0));
  float d = dot(hash21(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7)) + uSeed), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, -1.2, 1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec3 tonemap(vec3 c) {
  c = max(c, 0.0);
  return c / (1.0 + c);
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv * 2.0 - 1.0);
  p.x *= uRes.x / max(uRes.y, 1.0);

  float t = uTime * 0.08;
  vec2 q = vec2(fbm(p * 1.25 + vec2(0.0, t)), fbm(p * 1.25 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 2.2 + 2.0 * q + vec2(1.7, 9.2) + 0.6 * t),
                fbm(p * 2.2 + 2.0 * q + vec2(8.3, 2.8) - 0.6 * t));

  float m = fbm(p * 1.4 + 1.7 * r);
  float edge = smoothstep(1.3, 0.15, length(p));

  float g1 = smoothstep(0.15, 0.85, m);
  float g2 = smoothstep(0.25, 0.95, fbm(p * 1.9 + r));
  float mixAB = clamp(0.55 * g1 + 0.45 * g2, 0.0, 1.0);
  float mixC = smoothstep(0.45, 0.98, fbm(p * 1.1 + q + vec2(t, -t)));

  vec3 base = mix(uColorA, uColorB, mixAB);
  vec3 col = mix(base, uColorC, mixC * 0.7);

  float n = hash11(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uSeed + uTime) - 0.5;
  col += n * 0.02;

  col *= (0.45 + 0.55 * edge);
  col *= (0.9 + 0.35 * uIntensity);

  col = tonemap(col * 1.35);

  float v = smoothstep(1.25, 0.2, length(p));
  col *= (0.62 + 0.38 * v);

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToLinearRgb(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r * c.r, c.g * c.g, c.b * c.b);
}

export function FlowShaderCanvas({
  paused,
  intensity = 1,
  intensityRef,
  palette,
  onFirstFrame,
}: FlowShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const firstFrameRef = useRef(false);

  const pal = useMemo<Palette>(() => {
    return palette ?? { a: '#0b2280', b: '#0a8fff', c: '#b8dcff' };
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x050608, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uSeed: { value: Math.random() * 1000 },
      uIntensity: { value: intensity },
      uColorA: { value: hexToLinearRgb(pal.a) },
      uColorB: { value: hexToLinearRgb(pal.b) },
      uColorC: { value: hexToLinearRgb(pal.c) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const setSize = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * dpr, h * dpr);
    };

    setSize();
    const ro = new ResizeObserver(() => setSize());
    ro.observe(canvas);

    const onVis = () => {
      if (document.visibilityState !== 'visible' && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (document.visibilityState === 'visible' && !rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    const start = performance.now();
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (paused) return;
      const t = (now - start) / 1000;
      uniforms.uTime.value = t;
      uniforms.uIntensity.value = intensityRef?.current ?? intensity;
      renderer.render(scene, camera);
      if (!firstFrameRef.current) {
        firstFrameRef.current = true;
        onFirstFrame?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [paused, intensity, intensityRef, pal.a, pal.b, pal.c, onFirstFrame]);

  return <canvas ref={canvasRef} className="mm-preloader__shader" aria-hidden="true" />;
}
