'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';

const MOBILE_LITE_MQ = '(max-width: 760px)';

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** WebGL1-safe: no dynamic array indexing in fragment shader. */
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 uPointerPos;
uniform vec2 uPointerVelocity;
uniform float uPointerActive;
uniform float uMagnetStrength;
uniform float uTheme;

float s(float a, float b, float c) {
  return smoothstep(a, b, c);
}

highp float rand(vec2 co) {
  return fract(cos(mod(dot(co.xy + 0.12, vec2(12.9898, 78.233)), 3.14)) * 43758.5453);
}

highp vec3 rand3(vec2 co) {
  float t = rand(co);
  float z = rand(co + t);
  return vec3(t, z, rand(co + z));
}

vec3 getpoint(vec2 id) {
  vec3 r = rand3(id);
  vec3 ou = vec3(
    sin(iTime * r.x),
    cos(iTime * r.y),
    sin(iTime * r.z * 10.0)
  );
  return ou * 0.45 + 0.5;
}

float line(vec2 uv, vec2 p, vec2 p2) {
  vec2 n = uv - p;
  vec2 w = p2 - p;
  float r = clamp(dot(n, w) / max(dot(w, w), 0.0001), 0.0, 1.0);
  r = length(n - w * r);
  return clamp(s(0.04, 0.01, r) * (s(0.6, 1.0, 1.0 / max(distance(p, p2), 0.001))), 0.0, 1.0);
}

vec2 magnetPoint(vec2 id, vec2 p, vec2 pointerUv) {
  vec2 globalPoint = id + p;
  vec2 toPointer = pointerUv - globalPoint;
  float dist = length(toPointer);
  float field = smoothstep(1.55, 0.0, dist) * uPointerActive;
  vec2 velocity = uPointerVelocity / max(iResolution.xy, vec2(1.0));
  vec2 stretch = vec2(velocity.x, -velocity.y) * 1.8;
  vec2 target = pointerUv - stretch;
  float pull = field * uMagnetStrength * 0.52;
  return mix(globalPoint, target, pull) - id;
}

vec2 neighborPoint(vec2 id, float w, float n) {
  vec3 point = getpoint(id + vec2(w, n));
  return point.xy + vec2(w, n);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  uv *= 5.0;
  vec2 pointerUv = (uPointerPos * 2.0 - iResolution.xy) / iResolution.y;
  pointerUv *= 5.0;

  vec2 id = floor(uv);
  vec2 c = fract(uv);

  vec2 p0 = magnetPoint(id, neighborPoint(id, -1.0, -1.0), pointerUv);
  vec2 p1 = magnetPoint(id, neighborPoint(id,  0.0, -1.0), pointerUv);
  vec2 p2 = magnetPoint(id, neighborPoint(id,  1.0, -1.0), pointerUv);
  vec2 p3 = magnetPoint(id, neighborPoint(id, -1.0,  0.0), pointerUv);
  vec2 p4 = magnetPoint(id, neighborPoint(id,  0.0,  0.0), pointerUv);
  vec2 p5 = magnetPoint(id, neighborPoint(id,  1.0,  0.0), pointerUv);
  vec2 p6 = magnetPoint(id, neighborPoint(id, -1.0,  1.0), pointerUv);
  vec2 p7 = magnetPoint(id, neighborPoint(id,  0.0,  1.0), pointerUv);
  vec2 p8 = magnetPoint(id, neighborPoint(id,  1.0,  1.0), pointerUv);

  float col = 0.0;
  col += pow(getpoint(id + vec2(-1.0, -1.0)).z / max(dot((p0.xy - c) * 10.0, (p0.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(0.0, -1.0)).z / max(dot((p1.xy - c) * 10.0, (p1.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(1.0, -1.0)).z / max(dot((p2.xy - c) * 10.0, (p2.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(-1.0, 0.0)).z / max(dot((p3.xy - c) * 10.0, (p3.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(0.0, 0.0)).z / max(dot((p4.xy - c) * 10.0, (p4.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(1.0, 0.0)).z / max(dot((p5.xy - c) * 10.0, (p5.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(-1.0, 1.0)).z / max(dot((p6.xy - c) * 10.0, (p6.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(0.0, 1.0)).z / max(dot((p7.xy - c) * 10.0, (p7.xy - c) * 10.0), 0.0001), 2.2);
  col += pow(getpoint(id + vec2(1.0, 1.0)).z / max(dot((p8.xy - c) * 10.0, (p8.xy - c) * 10.0), 0.0001), 2.2);

  col += pow(line(c, p0, p4), 2.2);
  col += pow(line(c, p1, p4), 2.2);
  col += pow(line(c, p2, p4), 2.2);
  col += pow(line(c, p3, p4), 2.2);
  col += pow(line(c, p5, p4), 2.2);
  col += pow(line(c, p6, p4), 2.2);
  col += pow(line(c, p7, p4), 2.2);
  col += pow(line(c, p8, p4), 2.2);
  col += pow(line(c, p1, p3), 2.2);
  col += pow(line(c, p1, p5), 2.2);
  col += pow(line(c, p7, p3), 2.2);
  col += pow(line(c, p7, p5), 2.2);

  col = pow(col, 1.0 / 2.2);
  col *= col;
  col *= 0.5;

  vec3 maserBlue = vec3(0.063, 0.643, 1.0);
  vec3 ink = vec3(0.039, 0.176, 0.298);

  vec3 baseColor;
  vec3 lineColor;

  if (uTheme < 0.5) {
    baseColor = vec3(1.0);
    lineColor = mix(vec3(0.92), maserBlue, clamp(col * 1.35, 0.0, 1.0));
  } else {
    baseColor = vec3(0.02, 0.03, 0.05);
    float dither = step(0.5, fract(dot(floor(fragCoord), vec2(1.0, 0.5))));
    baseColor = mix(baseColor, vec3(0.04, 0.06, 0.09), dither * 0.35);
    lineColor = mix(ink, maserBlue, clamp(col * 1.2, 0.0, 1.0));
  }

  vec3 rgb = mix(baseColor, lineColor, clamp(col, 0.0, 1.0));

  float cursorHalo = exp(-length(uv - pointerUv) * 2.4) * uPointerActive * uMagnetStrength;
  rgb = mix(rgb, maserBlue, cursorHalo * 0.12);

  gl_FragColor = vec4(rgb, 1.0);
}
`;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileLite(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_LITE_MQ).matches;
}

export type ProcessNetworkShaderProps = {
  theme: 'light' | 'dark';
  interactive?: boolean;
  className?: string;
};

export function ProcessNetworkShader({
  theme,
  interactive = false,
  className = '',
}: ProcessNetworkShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionGate();
  const [usePosterOnly, setUsePosterOnly] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let mobileLite = isMobileLite();
    if (mobileLite) {
      setUsePosterOnly(true);
      return;
    }

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      setUsePosterOnly(true);
      return;
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[ProcessNetworkShader]', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      setUsePosterOnly(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setUsePosterOnly(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[ProcessNetworkShader]', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setUsePosterOnly(true);
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLoc = gl.getUniformLocation(program, 'iResolution');
    const iTimeLoc = gl.getUniformLocation(program, 'iTime');
    const uPointerPosLoc = gl.getUniformLocation(program, 'uPointerPos');
    const uPointerVelocityLoc = gl.getUniformLocation(program, 'uPointerVelocity');
    const uPointerActiveLoc = gl.getUniformLocation(program, 'uPointerActive');
    const uMagnetStrengthLoc = gl.getUniformLocation(program, 'uMagnetStrength');
    const uThemeLoc = gl.getUniformLocation(program, 'uTheme');

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const start = performance.now();
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: 0 };
    const target = { x: 0, y: 0, time: 0, seeded: false };
    const setPointerX = gsap.quickTo(pointer, 'x', { duration: 0.42, ease: 'power3.out' });
    const setPointerY = gsap.quickTo(pointer, 'y', { duration: 0.42, ease: 'power3.out' });
    const setPointerVx = gsap.quickTo(pointer, 'vx', { duration: 0.52, ease: 'power3.out' });
    const setPointerVy = gsap.quickTo(pointer, 'vy', { duration: 0.52, ease: 'power3.out' });
    const setPointerActive = gsap.quickTo(pointer, 'active', { duration: 0.46, ease: 'power2.out' });
    let rafId = 0;
    let cancelled = false;
    let inView = true;
    let running = false;
    let lastFrame = 0;
    const minFrameMs = interactive ? 0 : 1000 / 30;

    const render = (now: number) => {
      if (cancelled || !inView || document.hidden) {
        running = false;
        return;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 1 || h < 1) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const motionReduced = reducedMotion || prefersReducedMotion();
      if (!interactive && !motionReduced && now - lastFrame < minFrameMs) {
        rafId = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;

      const bw = Math.max(1, Math.floor(w * pixelRatio));
      const bh = Math.max(1, Math.floor(h * pixelRatio));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        gl.viewport(0, 0, bw, bh);
      }

      const t = motionReduced ? 0 : (now - start) / 1000;

      gl.useProgram(program);
      gl.uniform2f(iResolutionLoc, bw, bh);
      gl.uniform1f(iTimeLoc, t);
      gl.uniform2f(uPointerPosLoc, pointer.x * pixelRatio, (h - pointer.y) * pixelRatio);
      gl.uniform2f(uPointerVelocityLoc, pointer.vx * pixelRatio, pointer.vy * pixelRatio);
      gl.uniform1f(uPointerActiveLoc, interactive && !motionReduced ? pointer.active : 0);
      gl.uniform1f(uMagnetStrengthLoc, theme === 'dark' ? 1.0 : 0.62);
      gl.uniform1f(uThemeLoc, theme === 'light' ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (motionReduced) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (running || cancelled || !inView || mobileLite) return;
      running = true;
      rafId = requestAnimationFrame(render);
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafId);
      running = false;
    };

    const interactionTarget = container.closest<HTMLElement>('.mm-process-bento__tile') ?? container;
    const canUsePointer = interactive && !reducedMotion && !prefersReducedMotion();

    const handlePointerMove = (event: PointerEvent) => {
      if (!canUsePointer || mobileLite) return;
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      const now = performance.now();
      const delta = target.seeded ? Math.max(16, now - target.time) : 16;
      const vx = target.seeded ? ((nextX - target.x) / delta) * 16.67 : 0;
      const vy = target.seeded ? ((nextY - target.y) / delta) * 16.67 : 0;

      target.x = nextX;
      target.y = nextY;
      target.time = now;
      target.seeded = true;

      setPointerX(nextX);
      setPointerY(nextY);
      setPointerVx(Math.max(-72, Math.min(72, vx)));
      setPointerVy(Math.max(-72, Math.min(72, vy)));
      setPointerActive(1);
      startLoop();
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (!canUsePointer || mobileLite) return;
      target.seeded = false;
      handlePointerMove(event);
    };

    const handlePointerLeave = () => {
      target.seeded = false;
      setPointerVx(0);
      setPointerVy(0);
      setPointerActive(0);
      startLoop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startLoop();
        else stopLoop();
      },
      { threshold: 0.08, rootMargin: '80px 0px' },
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      if (inView && !mobileLite) {
        render(performance.now());
        startLoop();
      }
    });
    resizeObserver.observe(container);

    const mobileMq = window.matchMedia(MOBILE_LITE_MQ);
    const onMobileChange = () => {
      mobileLite = mobileMq.matches;
      if (mobileLite) {
        stopLoop();
        setUsePosterOnly(true);
      } else {
        setUsePosterOnly(false);
        startLoop();
      }
    };
    mobileMq.addEventListener('change', onMobileChange);

    if (canUsePointer) {
      interactionTarget.addEventListener('pointerenter', handlePointerEnter, { passive: true });
      interactionTarget.addEventListener('pointermove', handlePointerMove, { passive: true });
      interactionTarget.addEventListener('pointerleave', handlePointerLeave);
    }

    render(performance.now());
    startLoop();

    return () => {
      cancelled = true;
      stopLoop();
      observer.disconnect();
      resizeObserver.disconnect();
      mobileMq.removeEventListener('change', onMobileChange);
      interactionTarget.removeEventListener('pointerenter', handlePointerEnter);
      interactionTarget.removeEventListener('pointermove', handlePointerMove);
      interactionTarget.removeEventListener('pointerleave', handlePointerLeave);
      gsap.killTweensOf(pointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [theme, interactive, reducedMotion]);

  const posterClass =
    theme === 'light'
      ? 'mm-process-bento__poster mm-process-bento__poster--network-light'
      : 'mm-process-bento__poster mm-process-bento__poster--network-dark';

  return (
    <div
      ref={containerRef}
      className={`mm-process-bento__media${usePosterOnly ? ' mm-process-bento__media--poster-only' : ''} ${className}`.trim()}
      aria-hidden
    >
      <div className={posterClass} />
      <canvas ref={canvasRef} className="mm-process-bento__shader-canvas" />
    </div>
  );
}
