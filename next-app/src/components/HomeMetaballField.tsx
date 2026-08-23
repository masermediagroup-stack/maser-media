'use client';

/**
 * Homepage-only 2D metaball field for the post-hero light sections.
 * Portals a fixed paper plate to document.body (z-index -1) so ScrollSmoother
 * cannot trap it, then punches transparent holes through clients / services /
 * process / CTA / footer. Hero, work ripple, testimonials, and the contact
 * modal keep their own opaque surfaces.
 */
import { useEffect, useRef } from 'react';

const PAPER = '#efefef';
const PAPER_RGB: [number, number, number] = [0.937, 0.937, 0.937];

const BRAND = {
  bright: '#10A4FF',
  mid: '#0097F5',
  deep: '#0065A3',
} as const;

const MOBILE_MQ = '(max-width: 767px), (pointer: coarse)';
const REDUCED_MQ = '(prefers-reduced-motion: reduce)';
const NEAR_VIEWPORT_MARGIN = '90% 0px 90% 0px';

const EXCLUDE_SELECTOR = [
  '.mm-clients__headline',
  '.mm-clients__grid',
  '.mm-services__title',
  '.mm-services__lede',
  '.mm-services__accordion',
  '.mm-process-bento__heading',
  '.mm-cta__title',
  '.mm-cta__lead',
  '.mm-cta__actions',
  '.mm-footer__copy',
  '.mm-footer__nav',
].join(',');

const EXPOSED_SELECTOR = [
  '.mm-section--clients',
  '.mm-section--services',
  '.mm-section--process',
  '.mm-section--cta',
  '.mm-footer',
].join(',');

const MAX_BLOBS = 5;
const MAX_EXCLUSIONS = 8;

type BlobSeed = {
  restX: number;
  restY: number;
  radius: number;
  color: [number, number, number];
  travelX: number;
  travelY: number;
  wakeX: number;
  wakeY: number;
};

const BLOB_SEEDS: BlobSeed[] = [
  {
    restX: 0.16,
    restY: 0.22,
    radius: 0.4,
    color: hexToRgb(BRAND.bright),
    travelX: 0.2,
    travelY: 0.58,
    wakeX: 0.055,
    wakeY: 0.04,
  },
  {
    restX: 0.82,
    restY: 0.36,
    radius: 0.36,
    color: hexToRgb(BRAND.mid),
    travelX: -0.18,
    travelY: 0.46,
    wakeX: -0.05,
    wakeY: 0.045,
  },
  {
    restX: 0.48,
    restY: 0.68,
    radius: 0.44,
    color: hexToRgb(BRAND.deep),
    travelX: 0.1,
    travelY: -0.32,
    wakeX: 0.035,
    wakeY: -0.055,
  },
  {
    restX: 0.28,
    restY: 0.84,
    radius: 0.3,
    color: hexToRgb(BRAND.bright),
    travelX: 0.28,
    travelY: -0.18,
    wakeX: 0.06,
    wakeY: 0.02,
  },
  {
    restX: 0.9,
    restY: 0.78,
    radius: 0.32,
    color: hexToRgb(BRAND.mid),
    travelX: -0.26,
    travelY: 0.22,
    wakeX: -0.04,
    wakeY: -0.05,
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '').trim();
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return [0.063, 0.643, 1];
  }

  const int = Number.parseInt(value, 16);
  return [((int >> 16) & 0xff) / 255, ((int >> 8) & 0xff) / 255, (int & 0xff) / 255];
}

function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_MQ).matches;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MQ).matches;
}

function intersectsViewport(rect: DOMRectReadOnly, slack = 0): boolean {
  return (
    rect.bottom > -slack &&
    rect.top < window.innerHeight + slack &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

uniform vec2 uResolution;
uniform vec3 uPaper;
uniform float uBlobCount;
uniform vec2 uBlobPos[5];
uniform float uBlobRadius[5];
uniform vec3 uBlobColor[5];
uniform float uEnergy;
uniform float uExclCount;
uniform vec4 uExcl[8];

out vec4 fragColor;

float blobField(vec2 p, vec2 center, float radius) {
  vec2 d = p - center;
  return (radius * radius) / (dot(d, d) + 0.0018);
}

float exclusionMask(vec2 frag) {
  float readable = 1.0;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= uExclCount) break;
    vec2 center = uExcl[i].xy;
    vec2 halfSize = uExcl[i].zw;
    vec2 d = abs(frag - center) - halfSize;
    float box = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    float feather = max(36.0, min(halfSize.x, halfSize.y) * 0.22);
    readable *= smoothstep(-feather, feather * 0.2, box);
  }
  return readable;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / max(uResolution, vec2(1.0));
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  float field = 0.0;
  vec3 stain = vec3(0.0);

  for (int i = 0; i < 5; i++) {
    if (float(i) >= uBlobCount) break;
    vec2 center = vec2(uBlobPos[i].x * aspect, 1.0 - uBlobPos[i].y);
    float contrib = blobField(p, center, uBlobRadius[i]);
    field += contrib;
    stain += uBlobColor[i] * contrib;
  }

  stain /= max(field, 0.0001);

  float wash = smoothstep(0.58, 1.28, field);
  float merge = smoothstep(1.05, 1.85, field);
  float amount = wash * 0.2 + merge * 0.1;
  amount *= mix(0.78, 1.0, uEnergy);
  amount *= exclusionMask(frag);

  vec3 color = mix(uPaper, stain, clamp(amount, 0.0, 0.42));
  fragColor = vec4(color, 1.0);
}
`;

function createLayer(): HTMLDivElement {
  const layer = document.createElement('div');
  layer.className = 'mm-metaball-field__layer mm-metaball-field__layer--static';
  layer.setAttribute('aria-hidden', 'true');
  return layer;
}

export function HomeMetaballField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const main = host?.closest<HTMLElement>('.mm-main');
    if (!host || !main) return;

    const startEl = main.querySelector<HTMLElement>('.mm-section--clients');
    if (!startEl) return;

    let disposed = false;
    let layer: HTMLDivElement | null = null;
    let removePageClass = () => {};
    let stopMotion: (() => void) | undefined;
    let bootPromise: Promise<void> | null = null;

    const mountPlate = () => {
      if (layer || disposed) return layer;
      layer = createLayer();
      document.body.appendChild(layer);
      document.documentElement.classList.add('mm-home-metaballs');
      removePageClass = () => {
        document.documentElement.classList.remove('mm-home-metaballs');
      };
      return layer;
    };

    const boot = async () => {
      if (disposed) return;
      const plate = mountPlate();
      if (!plate) return;

      if (prefersReducedMotion()) {
        return;
      }

      let Renderer: typeof import('ogl').Renderer;
      let Program: typeof import('ogl').Program;
      let Mesh: typeof import('ogl').Mesh;
      let Triangle: typeof import('ogl').Triangle;

      try {
        ({ Renderer, Program, Mesh, Triangle } = await import('ogl'));
      } catch {
        return;
      }

      if (disposed || !layer) return;

      const mobile = isMobileViewport();
      const blobCount = mobile ? 3 : 5;
      const dprCap = mobile ? 1.1 : 1.45;
      const travelScale = mobile ? 0.42 : 1;
      const energyScale = mobile ? 0.38 : 1;

      let renderer: InstanceType<typeof Renderer>;
      try {
        renderer = new Renderer({
          alpha: false,
          antialias: false,
          dpr: Math.min(window.devicePixelRatio || 1, dprCap),
        });
      } catch {
        return;
      }

      const gl = renderer.gl;
      if (!gl) return;

      gl.clearColor(PAPER_RGB[0], PAPER_RGB[1], PAPER_RGB[2], 1);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;

      const zeros2 = Array.from({ length: MAX_BLOBS }, () => [0, 0]);
      const zeros1 = Array.from({ length: MAX_BLOBS }, () => 0);
      const zeroColors = Array.from({ length: MAX_BLOBS }, () => [0, 0, 0]);
      const zeroExcl = Array.from({ length: MAX_EXCLUSIONS }, () => [0, 0, 0, 0]);

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uResolution: { value: [1, 1] },
          uPaper: { value: PAPER_RGB },
          uBlobCount: { value: blobCount },
          uBlobPos: { value: zeros2 },
          uBlobRadius: { value: zeros1 },
          uBlobColor: { value: zeroColors },
          uEnergy: { value: 0 },
          uExclCount: { value: 0 },
          uExcl: { value: zeroExcl },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      const canvas = gl.canvas;
      canvas.className = 'mm-metaball-field__canvas';
      layer.appendChild(canvas);
      layer.classList.remove('mm-metaball-field__layer--static');
      layer.style.backgroundColor = PAPER;

      const blobPos = Array.from({ length: MAX_BLOBS }, () => [0, 0]);
      const blobRadius = BLOB_SEEDS.map((seed) => seed.radius * (mobile ? 0.86 : 1));
      const blobColor = BLOB_SEEDS.map((seed) => [...seed.color]);
      const exclusions = Array.from({ length: MAX_EXCLUSIONS }, () => [0, 0, 0, 0]);

      program.uniforms.uBlobPos.value = blobPos;
      program.uniforms.uBlobRadius.value = blobRadius;
      program.uniforms.uBlobColor.value = blobColor;
      program.uniforms.uExcl.value = exclusions;

      let progress = 0.08;
      let energy = 0;
      let targetEnergy = 0;
      let velSign = 1;
      let raf = 0;
      let running = false;
      let visible = true;
      let tabHidden = document.hidden;
      let lastTime = performance.now();

      const updateBlobs = () => {
        const shift = progress - 0.42;
        for (let i = 0; i < blobCount; i += 1) {
          const seed = BLOB_SEEDS[i];
          const pos = blobPos[i];
          if (!seed || !pos) continue;
          pos[0] = seed.restX + shift * seed.travelX * travelScale + energy * seed.wakeX * velSign * energyScale;
          pos[1] = seed.restY + shift * seed.travelY * travelScale + energy * seed.wakeY * velSign * energyScale;
        }
        program.uniforms.uEnergy.value = energy;
      };

      const excludeNodes = Array.from(main.querySelectorAll<HTMLElement>(EXCLUDE_SELECTOR));
      const exposedNodes = Array.from(main.querySelectorAll<HTMLElement>(EXPOSED_SELECTOR));

      const updateExclusions = () => {
        const dpr = renderer.dpr;
        const gutter = (mobile ? 28 : 48) * dpr;
        const ranked = excludeNodes
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return { rect, area: rect.width * rect.height };
          })
          .filter(({ rect }) => rect.width > 8 && rect.height > 8 && intersectsViewport(rect, 24))
          .sort((a, b) => b.area - a.area)
          .slice(0, MAX_EXCLUSIONS);

        ranked.forEach(({ rect }, index) => {
          const slot = exclusions[index];
          if (!slot) return;
          slot[0] = (rect.left + rect.width * 0.5) * dpr;
          slot[1] = (window.innerHeight - (rect.top + rect.height * 0.5)) * dpr;
          slot[2] = rect.width * 0.5 * dpr + gutter;
          slot[3] = rect.height * 0.5 * dpr + gutter;
        });

        program.uniforms.uExclCount.value = ranked.length;
      };

      const anyExposed = () =>
        exposedNodes.some((node) => intersectsViewport(node.getBoundingClientRect(), 80));

      const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width < 1 || height < 1) return;
        renderer.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        renderer.setSize(width, height);
        program.uniforms.uResolution.value = [width * renderer.dpr, height * renderer.dpr];
      };

      const render = () => {
        updateBlobs();
        updateExclusions();
        renderer.render({ scene: mesh });
      };

      const tick = (now: number) => {
        if (!running) return;
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;
        energy += (targetEnergy - energy) * Math.min(1, dt * (targetEnergy > energy ? 9 : 2.2));
        targetEnergy *= Math.exp(-dt * 3.2);

        const exposed = anyExposed();
        const shouldDraw = visible && !tabHidden && exposed;

        if (shouldDraw) {
          render();
        }

        const settled = energy < 0.012 && targetEnergy < 0.012;
        if (!shouldDraw || settled) {
          running = false;
          raf = 0;
          return;
        }

        raf = requestAnimationFrame(tick);
      };

      const startLoop = () => {
        if (disposed || running) return;
        running = true;
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      };

      const wakeFromScroll = (nextProgress: number, velocity: number) => {
        progress = nextProgress;
        if (velocity !== 0) {
          velSign = Math.sign(velocity);
        }
        targetEnergy = Math.min(1, (Math.abs(velocity) / (mobile ? 4600 : 2400)) * energyScale);
        visible = true;
        startLoop();
      };

      resize();
      render();

      let smootherWatcher = () => {};
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (disposed) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const endEl = main.querySelector<HTMLElement>('.mm-footer') ?? main;
        ScrollTrigger.create({
          trigger: startEl,
          endTrigger: endEl,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            visible = self.isActive;
            if (self.isActive) startLoop();
          },
          onUpdate: (self) => {
            wakeFromScroll(self.progress, self.getVelocity());
          },
        });
      }, main);

      const onResize = () => {
        resize();
        if (!running) {
          render();
        } else {
          startLoop();
        }
        ScrollTrigger.refresh();
      };

      const onVisibility = () => {
        tabHidden = document.hidden;
        if (!tabHidden && visible) startLoop();
      };

      const onExposed = (entries: IntersectionObserverEntry[]) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          visible = true;
          startLoop();
        }
      };

      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(document.documentElement);

      const exposedObserver = new IntersectionObserver(onExposed, {
        rootMargin: '64px 0px',
        threshold: 0,
      });
      exposedNodes.forEach((node) => {
        exposedObserver.observe(node);
      });

      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('resize', onResize, { passive: true });

      smootherWatcher = () => {
        ctx.revert();
        resizeObserver.disconnect();
        exposedObserver.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(raf);
        running = false;
        if (canvas.parentNode === layer) {
          layer.removeChild(canvas);
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };

      stopMotion = smootherWatcher;
    };

    const nearObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || bootPromise || disposed) return;
        nearObserver.disconnect();
        bootPromise = boot();
      },
      { rootMargin: NEAR_VIEWPORT_MARGIN, threshold: 0 },
    );
    nearObserver.observe(startEl);

    const reducedMedia = window.matchMedia(REDUCED_MQ);
    const onReduced = () => {
      if (reducedMedia.matches) {
        mountPlate();
        stopMotion?.();
        stopMotion = undefined;
        layer?.classList.add('mm-metaball-field__layer--static');
      }
    };
    reducedMedia.addEventListener('change', onReduced);

    return () => {
      disposed = true;
      nearObserver.disconnect();
      reducedMedia.removeEventListener('change', onReduced);
      stopMotion?.();
      removePageClass();
      layer?.remove();
    };
  }, []);

  return <div ref={hostRef} className="mm-metaball-field" aria-hidden="true" />;
}
