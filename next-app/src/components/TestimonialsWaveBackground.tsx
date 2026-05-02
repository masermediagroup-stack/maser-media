"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

/** Fullscreen wave field tuned for blue → cyan → light (WebGL 1.0 GLSL ES) */
const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (2.0 * fragCoord - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  /* < 1.0 = zoom in slightly (tighter field on the canvas) */
  uv *= 0.91;

  for (float i = 1.0; i < 8.0; i += 1.0) {
    float fi = i;
    uv.y += 0.1 * sin(uv.x * fi * fi + u_time * 0.5) * sin(uv.y * fi * fi + u_time * 0.5);
  }

  vec3 col;
  col.r = uv.y * 0.35 + 0.15;
  col.g = uv.y * 0.55 + 0.45;
  col.b = uv.y * 0.9 + 0.72;

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

export type TestimonialsWaveBackgroundProps = {
  /** When false, RAF loop pauses (e.g. section out of view). */
  running: boolean;
  className?: string;
};

/**
 * WebGL wave backdrop for the testimonials band. Pauses when `running` is false.
 * Cleans up GL program, shaders, and buffers on unmount.
 */
export default function TestimonialsWaveBackground({
  running,
  className = "",
}: TestimonialsWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(running);
  runningRef.current = running;
  const kickLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const compile = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("[TestimonialsWaveBackground] shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[TestimonialsWaveBackground] program:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      gl.deleteProgram(program);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");

    const start = performance.now() / 1000;
    let raf = 0;

    const frame = () => {
      if (!runningRef.current) {
        raf = 0;
        return;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 1 || height < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const w = Math.floor(width * dpr);
      const h = Math.floor(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);

      const t = performance.now() / 1000 - start;
      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, w, h);
      gl.uniform1f(uTimeLoc, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (runningRef.current) raf = requestAnimationFrame(frame);
    };

    kickLoopRef.current = kick;
    kick();

    const ro = new ResizeObserver(() => kick());
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      kickLoopRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      gl.useProgram(null);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  useEffect(() => {
    runningRef.current = running;
    if (running) kickLoopRef.current?.();
  }, [running]);

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
