'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
uniform vec2 uClickPos;
uniform float uClickAge;
uniform float uTheme;
uniform float uEnableBurst;

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
  float r = clamp(dot(n, w) / dot(w, w), 0.0, 1.0);
  r = length(n - w * r);
  return clamp(s(0.04, 0.01, r) * (s(0.6, 1.0, 1.0 / max(distance(p, p2), 0.001))), 0.0, 1.0);
}

vec2 neighborPoint(vec2 id, float w, float n) {
  vec3 point = getpoint(id + vec2(w, n));
  return point.xy + vec2(w, n);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  uv *= 5.0;

  vec2 id = floor(uv);
  vec2 c = fract(uv);

  vec2 p0 = neighborPoint(id, -1.0, -1.0);
  vec2 p1 = neighborPoint(id,  0.0, -1.0);
  vec2 p2 = neighborPoint(id,  1.0, -1.0);
  vec2 p3 = neighborPoint(id, -1.0,  0.0);
  vec2 p4 = neighborPoint(id,  0.0,  0.0);
  vec2 p5 = neighborPoint(id,  1.0,  0.0);
  vec2 p6 = neighborPoint(id, -1.0,  1.0);
  vec2 p7 = neighborPoint(id,  0.0,  1.0);
  vec2 p8 = neighborPoint(id,  1.0,  1.0);

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

  if (uEnableBurst > 0.5 && uClickAge < 0.65) {
    vec2 clickUv = (uClickPos * 2.0 - iResolution.xy) / iResolution.y;
    float dist = length(uv - clickUv * 5.0);
    float burst = exp(-dist * 2.8) * (1.0 - uClickAge / 0.65);
    float sparkle = rand(floor(fragCoord * 0.5 + iTime * 40.0));
    vec3 burstColor = mix(vec3(1.0), maserBlue, step(0.55, sparkle));
    rgb = mix(rgb, burstColor, burst * 0.85);
  }

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
  const clickRef = useRef({ x: 0, y: 0 });
  const clickAtRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotionGate();
  const [usePosterOnly, setUsePosterOnly] = useState(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || reducedMotion || usePosterOnly) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      clickRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      clickAtRef.current = performance.now();
    },
    [interactive, reducedMotion, usePosterOnly],
  );

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
    const uClickPosLoc = gl.getUniformLocation(program, 'uClickPos');
    const uClickAgeLoc = gl.getUniformLocation(program, 'uClickAge');
    const uThemeLoc = gl.getUniformLocation(program, 'uTheme');
    const uEnableBurstLoc = gl.getUniformLocation(program, 'uEnableBurst');

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const start = performance.now();
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
      const clickAge =
        clickAtRef.current === null ? 999.0 : (now - clickAtRef.current) / 1000;

      gl.useProgram(program);
      gl.uniform2f(iResolutionLoc, bw, bh);
      gl.uniform1f(iTimeLoc, t);
      gl.uniform2f(uClickPosLoc, clickRef.current.x * pixelRatio, clickRef.current.y * pixelRatio);
      gl.uniform1f(uClickAgeLoc, clickAge);
      gl.uniform1f(uThemeLoc, theme === 'light' ? 0 : 1);
      gl.uniform1f(uEnableBurstLoc, interactive && !motionReduced ? 1 : 0);
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

    render(performance.now());
    startLoop();

    return () => {
      cancelled = true;
      stopLoop();
      observer.disconnect();
      resizeObserver.disconnect();
      mobileMq.removeEventListener('change', onMobileChange);
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
      onPointerDown={handlePointerDown}
    >
      <div className={posterClass} />
      <canvas ref={canvasRef} className="mm-process-bento__shader-canvas" />
    </div>
  );
}
