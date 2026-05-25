"use client";

import { useEffect, useRef } from "react";

const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec2 iVelocity;
uniform float iPointerActive;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;

    vec2 pointer = (2.0 * iMouse - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec2 toPointer = centeredUV - pointer;
    float pointerDist = length(toPointer);
    float pointerField = exp(-pointerDist * pointerDist * 5.4) * iPointerActive;
    vec2 velocity = iVelocity / max(iResolution.xy, vec2(1.0));
    vec2 drag = velocity * vec2(1.0, -1.0);
    vec2 tangent = vec2(-toPointer.y, toPointer.x);

    vec2 distortion = centeredUV;
    distortion -= drag * pointerField * 1.85;
    distortion += tangent * pointerField * 0.16 * sin(time * 1.7 + pointerDist * 11.0);

    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.42 / i * cos(i * 2.0 * distortion.y + time + pointer.x * 1.15);
        distortion.y += 0.42 / i * cos(i * 2.0 * distortion.x + time + pointer.y * 1.15);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);
    glow += pointerField * 0.18 * smoothstep(0.65, 0.0, pointerDist);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

export type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface SmokeyBackgroundProps {
  backdropBlurAmount?: string;
  color?: string;
  className?: string;
}

const blurClassMap: Record<BlurSize, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl",
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace(/^#/, "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  if (full.length !== 6) return [1, 1, 1];
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function SmokeyBackground({
  backdropBlurAmount = "sm",
  color = "#fff",
  className = "",
}: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);

  colorRef.current = color;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      return;
    }

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader compilation warning:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program linking warning:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const iMouseLocation = gl.getUniformLocation(program, "iMouse");
    const iVelocityLocation = gl.getUniformLocation(program, "iVelocity");
    const iPointerActiveLocation = gl.getUniformLocation(program, "iPointerActive");
    const uColorLocation = gl.getUniformLocation(program, "u_color");

    const startTime = Date.now();
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: 0 };
    const target = { x: 0, y: 0, time: 0, seeded: false };
    const setters = {
      x: (value: number) => {
        pointer.x = value;
      },
      y: (value: number) => {
        pointer.y = value;
      },
      vx: (value: number) => {
        pointer.vx = value;
      },
      vy: (value: number) => {
        pointer.vy = value;
      },
      active: (value: number) => {
        pointer.active = value;
      },
    };
    let rafId = 0;
    let cancelled = false;
    let running = false;
    let inView = true;
    let killGsapTweens: (() => void) | null = null;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pixelRatio = coarsePointer ? 0.85 : Math.min(window.devicePixelRatio || 1, 1.25);

    const render = () => {
      if (cancelled) return;
      if (!inView || document.hidden) {
        running = false;
        return;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 1 || height < 1) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const bufferWidth = Math.max(1, Math.floor(width * pixelRatio));
      const bufferHeight = Math.max(1, Math.floor(height * pixelRatio));
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
        gl.viewport(0, 0, bufferWidth, bufferHeight);
      }
      gl.useProgram(program);

      const currentTime = (Date.now() - startTime) / 1000;
      const [r, g, b] = hexToRgb(colorRef.current);
      gl.uniform3f(uColorLocation, r, g, b);
      gl.uniform2f(iResolutionLocation, bufferWidth, bufferHeight);
      gl.uniform1f(iTimeLocation, reducedMotionMedia.matches ? 0 : currentTime);
      gl.uniform2f(iMouseLocation, pointer.x * pixelRatio, (height - pointer.y) * pixelRatio);
      gl.uniform2f(iVelocityLocation, pointer.vx * pixelRatio, pointer.vy * pixelRatio);
      gl.uniform1f(iPointerActiveLocation, pointer.active);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (reducedMotionMedia.matches) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(render);
    };

    const start = () => {
      if (running || cancelled || !inView || document.hidden) return;
      running = true;
      rafId = requestAnimationFrame(render);
    };

    const stop = () => {
      if (!running) return;
      cancelAnimationFrame(rafId);
      running = false;
    };

    const handlePointerMove = (event: PointerEvent) => {
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

      setters.x(nextX);
      setters.y(nextY);
      setters.vx(Math.max(-90, Math.min(90, vx)));
      setters.vy(Math.max(-90, Math.min(90, vy)));
      setters.active(1);
      start();
    };

    const handlePointerLeave = () => {
      target.seeded = false;
      setters.vx(0);
      setters.vy(0);
      setters.active(0);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView) start();
        else stop();
      },
      { rootMargin: "35% 0px 35% 0px", threshold: 0 },
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const interactionTarget = canvas.closest<HTMLElement>(".mm-hero") ?? canvas;

    if (!coarsePointer) {
      import("gsap").then(({ gsap }) => {
        if (cancelled) return;
        setters.x = gsap.quickTo(pointer, "x", { duration: 0.72, ease: "power3.out" });
        setters.y = gsap.quickTo(pointer, "y", { duration: 0.72, ease: "power3.out" });
        setters.vx = gsap.quickTo(pointer, "vx", { duration: 0.55, ease: "power3.out" });
        setters.vy = gsap.quickTo(pointer, "vy", { duration: 0.55, ease: "power3.out" });
        setters.active = gsap.quickTo(pointer, "active", { duration: 0.34, ease: "power2.out" });
        killGsapTweens = () => gsap.killTweensOf(pointer);
      });

      interactionTarget.addEventListener("pointermove", handlePointerMove, { passive: true });
      interactionTarget.addEventListener("pointerleave", handlePointerLeave);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    start();

    return () => {
      cancelled = true;
      stop();
      observer.disconnect();
      interactionTarget.removeEventListener("pointermove", handlePointerMove);
      interactionTarget.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      killGsapTweens?.();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  const finalBlurClass =
    blurClassMap[backdropBlurAmount as BlurSize] || blurClassMap.sm;

  return (
    <div className={`relative h-full w-full min-w-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full min-w-0 overflow-hidden"
        style={{ display: "block" }}
      />
      <div className={`pointer-events-none absolute inset-0 ${finalBlurClass}`} aria-hidden />
    </div>
  );
}

export default SmokeyBackground;
