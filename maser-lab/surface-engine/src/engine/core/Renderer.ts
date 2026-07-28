import { SURFACE_FRAG } from "../pipeline/shaders/surface.frag";
import { SURFACE_VERT } from "../pipeline/shaders/surface.vert";
import { SurfaceMaterial } from "../core/Material";
import type {
  BayerSize,
  SurfaceMaterialPartial,
  SurfaceRendererOptions,
} from "../core/types";
import { Clock } from "../animation/Clock";
import { InteractionField } from "../interaction/InteractionField";
import { uploadBayerTexture } from "../dither/bayer";
import { uploadBlueNoiseTexture } from "../noise/blueNoise";
import { damp2 } from "../animation/damp";
import { DAMP } from "../core/constants";

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Surface Engine: shader allocation failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "unknown";
    gl.deleteShader(shader);
    throw new Error(`Surface Engine: shader compile error\n${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, SURFACE_VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, SURFACE_FRAG);
  const program = gl.createProgram();
  if (!program) throw new Error("Surface Engine: program allocation failed");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "unknown";
    gl.deleteProgram(program);
    throw new Error(`Surface Engine: program link error\n${info}`);
  }
  return program;
}

/**
 * WebGL2 Surface Renderer
 *
 * Owns the GL context, textures, RAF loop, and uniform uploads.
 * React never touches per-frame values — only material targets.
 */
export class SurfaceRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly material: SurfaceMaterial;
  readonly interaction = new InteractionField();

  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private uniforms = new Map<string, WebGLUniformLocation | null>();
  private bayerTexture: WebGLTexture | null = null;
  private blueNoiseTexture: WebGLTexture | null = null;
  private currentBayerSize: BayerSize = 8;
  private currentSeed = -1;

  private clock = new Clock();
  private raf = 0;
  private running = false;
  private visible = true;
  private reducedMotion = false;
  private maxDpr: number;
  private pauseWhenHidden: boolean;
  private displayLight = { x: 0.62, y: 0.28 };

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private motionQuery: MediaQueryList | null = null;
  private onContextLost?: () => void;

  private boundLost: (e: Event) => void;
  private boundRestored: () => void;
  private boundVisibility: () => void;
  private boundMotion: () => void;

  constructor(options: SurfaceRendererOptions) {
    this.canvas = options.canvas;
    this.material = new SurfaceMaterial(options.material);
    this.maxDpr = options.maxDpr ?? 2;
    this.pauseWhenHidden = options.pauseWhenHidden ?? true;
    this.onContextLost = options.onContextLost;

    this.boundLost = (e: Event) => {
      e.preventDefault();
      this.stop();
      this.onContextLost?.();
    };
    this.boundRestored = () => {
      this.initGL();
      this.start();
    };
    this.boundVisibility = () => {
      if (document.hidden) this.stop();
      else if (this.visible) this.start();
    };
    this.boundMotion = () => {
      this.reducedMotion = this.motionQuery?.matches ?? false;
    };

    this.initGL();
    this.attachObservers();
  }

  private initGL(): void {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) {
      throw new Error("Surface Engine: WebGL2 is required");
    }

    this.gl = gl;
    this.program = createProgram(gl);
    gl.useProgram(this.program);

    const uniformNames = [
      "uResolution",
      "uTime",
      "uDpr",
      "uDitherSize",
      "uPosterization",
      "uNoiseScale",
      "uNoiseSpeed",
      "uContrast",
      "uBrightness",
      "uGradientAngle",
      "uGradientA",
      "uGradientB",
      "uBloom",
      "uBloomRadius",
      "uGrainAmount",
      "uShadowStrength",
      "uHighlightStrength",
      "uSoftEdge",
      "uSeed",
      "uAnimSpeed",
      "uCursorInfluence",
      "uScrollInfluence",
      "uDepth",
      "uLight",
      "uPointer",
      "uScroll",
      "uOpacity",
      "uBlueNoiseEnabled",
      "uReducedMotion",
      "uBayer",
      "uBlueNoise",
    ];

    this.uniforms.clear();
    for (const name of uniformNames) {
      this.uniforms.set(name, gl.getUniformLocation(this.program, name));
    }

    this.currentBayerSize = this.material.params.ditherSize;
    this.bayerTexture = uploadBayerTexture(gl, this.currentBayerSize);
    this.currentSeed = this.material.params.randomSeed;
    this.blueNoiseTexture = uploadBlueNoiseTexture(gl, this.currentSeed);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.canvas.addEventListener("webglcontextlost", this.boundLost);
    this.canvas.addEventListener("webglcontextrestored", this.boundRestored);
  }

  private attachObservers(): void {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);

    if (this.pauseWhenHidden) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          this.visible = entry?.isIntersecting ?? true;
          if (this.visible && !document.hidden) this.start();
          else this.stop();
        },
        { threshold: 0.01 },
      );
      this.intersectionObserver.observe(this.canvas);
    }

    document.addEventListener("visibilitychange", this.boundVisibility);

    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener("change", this.boundMotion);

    this.resize();
  }

  setMaterial(partial: SurfaceMaterialPartial): void {
    this.material.set(partial);
  }

  setPointer(nx: number, ny: number, active = true): void {
    this.interaction.setPointer(nx, ny, active);
  }

  clearPointer(): void {
    this.interaction.clearPointer();
  }

  setScroll(progress: number): void {
    this.interaction.setScroll(progress);
  }

  resize(): void {
    const gl = this.gl;
    if (!gl) return;

    const density = this.material.params.pixelDensity;
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr) * density;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    this.clock.stop();
  }

  private loc(name: string): WebGLUniformLocation | null {
    return this.uniforms.get(name) ?? null;
  }

  private syncTextures(gl: WebGL2RenderingContext): void {
    const params = this.material.params;
    if (params.ditherSize !== this.currentBayerSize) {
      this.currentBayerSize = params.ditherSize;
      this.bayerTexture = uploadBayerTexture(
        gl,
        this.currentBayerSize,
        this.bayerTexture,
      );
    }
    // Rebuild blue noise only when seed changes meaningfully.
    if (Math.abs(params.randomSeed - this.currentSeed) > 0.0001) {
      this.currentSeed = params.randomSeed;
      this.blueNoiseTexture = uploadBlueNoiseTexture(
        gl,
        this.currentSeed,
        this.blueNoiseTexture,
      );
    }
  }

  render(): void {
    const gl = this.gl;
    const program = this.program;
    if (!gl || !program) return;

    const { time, delta } = this.clock.tick();
    const params = this.material.update(delta);
    const sample = this.interaction.update(delta);

    // Light eases toward pointer-influenced target.
    const lightTarget = {
      x:
        params.lightPosition[0] * (1 - params.cursorInfluence * 0.5) +
        sample.pointer.x * params.cursorInfluence * 0.5,
      y:
        params.lightPosition[1] * (1 - params.cursorInfluence * 0.5) +
        sample.pointer.y * params.cursorInfluence * 0.5,
    };
    this.displayLight = damp2(
      this.displayLight,
      lightTarget,
      DAMP.light,
      delta,
    );

    this.syncTextures(gl);
    this.resize();

    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(
      this.loc("uResolution"),
      this.canvas.width,
      this.canvas.height,
    );
    gl.uniform1f(this.loc("uTime"), time);
    gl.uniform1f(
      this.loc("uDpr"),
      Math.min(window.devicePixelRatio || 1, this.maxDpr),
    );

    gl.uniform1f(this.loc("uDitherSize"), params.ditherSize);
    gl.uniform1f(this.loc("uPosterization"), params.posterization);
    gl.uniform1f(this.loc("uNoiseScale"), params.noiseScale);
    gl.uniform1f(this.loc("uNoiseSpeed"), params.noiseSpeed);
    gl.uniform1f(this.loc("uContrast"), params.contrast);
    gl.uniform1f(this.loc("uBrightness"), params.brightness);
    gl.uniform1f(this.loc("uGradientAngle"), params.gradientAngle);
    gl.uniform1f(this.loc("uGradientA"), params.gradientColorA);
    gl.uniform1f(this.loc("uGradientB"), params.gradientColorB);
    gl.uniform1f(this.loc("uBloom"), params.bloom);
    gl.uniform1f(this.loc("uBloomRadius"), params.bloomRadius);
    gl.uniform1f(this.loc("uGrainAmount"), params.grainAmount);
    gl.uniform1f(this.loc("uShadowStrength"), params.shadowStrength);
    gl.uniform1f(this.loc("uHighlightStrength"), params.highlightStrength);
    gl.uniform1f(this.loc("uSoftEdge"), params.softEdge);
    gl.uniform1f(this.loc("uSeed"), params.randomSeed);
    gl.uniform1f(this.loc("uAnimSpeed"), params.animationSpeed);
    gl.uniform1f(this.loc("uCursorInfluence"), params.cursorInfluence);
    gl.uniform1f(this.loc("uScrollInfluence"), params.scrollInfluence);
    gl.uniform1f(this.loc("uDepth"), params.depth);
    gl.uniform2f(this.loc("uLight"), this.displayLight.x, this.displayLight.y);
    gl.uniform2f(this.loc("uPointer"), sample.pointer.x, sample.pointer.y);
    gl.uniform1f(this.loc("uScroll"), sample.scroll);
    gl.uniform1f(this.loc("uOpacity"), params.opacity);
    gl.uniform1f(
      this.loc("uBlueNoiseEnabled"),
      params.blueNoiseEnabled ? 1 : 0,
    );
    gl.uniform1f(this.loc("uReducedMotion"), this.reducedMotion ? 1 : 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.bayerTexture);
    gl.uniform1i(this.loc("uBayer"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.blueNoiseTexture);
    gl.uniform1i(this.loc("uBlueNoise"), 1);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.boundVisibility);
    this.motionQuery?.removeEventListener("change", this.boundMotion);
    this.canvas.removeEventListener("webglcontextlost", this.boundLost);
    this.canvas.removeEventListener("webglcontextrestored", this.boundRestored);

    const gl = this.gl;
    if (gl) {
      if (this.bayerTexture) gl.deleteTexture(this.bayerTexture);
      if (this.blueNoiseTexture) gl.deleteTexture(this.blueNoiseTexture);
      if (this.program) gl.deleteProgram(this.program);
    }

    this.gl = null;
    this.program = null;
  }
}
