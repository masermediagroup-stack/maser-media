'use client';

import { useEffect, useRef } from 'react';

import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';

type WorkLightswindShaderProps = {
  /** Wave / glow tint. Defaults to Maser brand blue. */
  color?: string;
  /** Hard cap on devicePixelRatio used by the WebGL backbuffer. */
  maxPixelRatio?: number;
  /** Optional className passthrough on the canvas. */
  className?: string;
};

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/**
 * Turbulent-glow fragment shader adapted from the user-provided Lightswind
 * `ShaderBackground` source. Reworked so the base canvas reads as white and
 * the animated wave glow tints toward `u_color` (Maser blue), instead of
 * sitting on a black plate. A subtle vignette keeps the section feeling like
 * a designed surface rather than a flat panel.
 */
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec2  iResolution;
  uniform float iTime;
  uniform vec2  iMouse;
  uniform vec3  u_color;

  // Hash + value-noise + fbm — light approximation of the source field.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y);

    // Mouse parallax — gentle, never destabilizes the composition.
    vec2 m = (iMouse.xy - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y);
    vec2 sway = m * 0.18;

    float t = iTime * 0.22;

    // Two stacked turbulence fields for layered motion.
    vec2 q = uv * 1.35 + sway;
    float n1 = fbm(q + vec2(t, -t * 0.6));
    float n2 = fbm(q * 1.8 - vec2(t * 0.7, t * 0.4) + n1);

    // Wave bands give the "turbulent glow" rhythm of the source.
    float bands = sin((uv.x + uv.y * 0.35) * 3.2 + n2 * 4.4 + t * 1.6);
    bands = 0.5 + 0.5 * bands;

    // Combine into a glow mask, then soft-shape it.
    float glow = pow(clamp(bands * (0.55 + 0.65 * n2), 0.0, 1.0), 1.6);
    glow *= smoothstep(1.25, 0.15, length(uv));   // gentle radial falloff
    glow = clamp(glow, 0.0, 1.0);

    // White base, blue waves on top. Multiply-style blend keeps mids airy.
    vec3 base = vec3(1.0);
    vec3 color = base - glow * (base - u_color);

    // Faint vignette so the section reads as composed, not flat.
    float vign = smoothstep(1.45, 0.55, length(uv));
    color = mix(base * 0.985, color, vign);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '').trim();
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return [0.063, 0.643, 1.0]; // #10a4ff fallback
  }

  const int = parseInt(value, 16);
  return [
    ((int >> 16) & 0xff) / 255,
    ((int >> 8) & 0xff) / 255,
    (int & 0xff) / 255,
  ];
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function WorkLightswindShader({
  color = '#10a4ff',
  maxPixelRatio = 1.5,
  className,
}: WorkLightswindShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotionGate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    });

    if (!gl) {
      // Graceful fallback: paint white so the section never collapses.
      canvas.style.background = '#ffffff';
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      canvas.style.background = '#ffffff';
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      canvas.style.background = '#ffffff';
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      canvas.style.background = '#ffffff';
      return;
    }
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uMouse = gl.getUniformLocation(program, 'iMouse');
    const uColor = gl.getUniformLocation(program, 'u_color');

    const [r, g, b] = hexToRgb(color);
    gl.uniform3f(uColor, r, g, b);

    const mouse = { x: 0, y: 0 };
    let raf = 0;
    let running = true;
    let visible = true;
    let lastWidth = 0;
    let lastHeight = 0;
    const startedAt = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (w === lastWidth && h === lastHeight) return;
      lastWidth = w;
      lastHeight = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      mouse.x = w * 0.5;
      mouse.y = h * 0.5;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      mouse.x = (event.clientX - rect.left) * dpr;
      // Flip Y so shader space matches CSS space.
      mouse.y = (rect.height - (event.clientY - rect.top)) * dpr;
    };

    const draw = (timestamp: number) => {
      if (!running) return;

      if (visible) {
        const elapsed = (timestamp - startedAt) / 1000;
        gl.uniform2f(uResolution, lastWidth, lastHeight);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uTime, reduceMotion ? 0 : elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (reduceMotion) {
          // Single frame, then idle until visibility/resize wakes us up.
          return;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (!running) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting;
          if (visible) startLoop();
        }
      },
      { rootMargin: '120px 0px' },
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (visible) {
        startLoop();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) {
        // Reduced motion: redraw once at the new size, then stop.
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
    resizeObserver.observe(canvas);

    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });

    resize();
    startLoop();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('pointermove', onPointerMove);

      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      const loseCtx = gl.getExtension('WEBGL_lose_context');
      loseCtx?.loseContext();
    };
  }, [color, maxPixelRatio, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`mm-work__shader-canvas${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#ffffff',
      }}
    />
  );
}
