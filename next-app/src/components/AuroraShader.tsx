'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotionGate } from '@/hooks/useReducedMotionGate';

export const MASER_AURORA_COLOR_STOPS = ['#10A4FF', '#ffffff', '#10A4FF'] as const;

export type AuroraShaderProps = {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
};

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}

float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

struct ColorStop { vec3 color; float position; };
#define COLOR_RAMP(colors,factor,finalColor){ \\
  int index=0; \\
  for(int i=0;i<2;i++){ \\
    ColorStop currentColor=colors[i]; \\
    bool inBetween=currentColor.position<=factor; \\
    index=int(mix(float(index),float(i),float(inBetween))); \\
  } \\
  ColorStop currentColor=colors[index]; \\
  ColorStop nextColor=colors[index+1]; \\
  float range=nextColor.position-currentColor.position; \\
  float lerpFactor=(factor-currentColor.position)/range; \\
  finalColor=mix(currentColor.color,nextColor.color,lerpFactor); \\
}

void main(){
  vec2 uv=gl_FragCoord.xy/uResolution;

  ColorStop colors[3];
  colors[0]=ColorStop(uColorStops[0],0.0);
  colors[1]=ColorStop(uColorStops[1],0.5);
  colors[2]=ColorStop(uColorStops[2],1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float noise = snoise(vec2(uv.x * 3.0, uTime * 0.2));
  float waveHeight = uv.y - (noise * 0.15 * uAmplitude);

  float fade = smoothstep(0.0, 0.4, uv.y);
  waveHeight = mix(uv.y, waveHeight, fade);

  float core = 0.5;
  float intensity = smoothstep(core - uBlend, core + uBlend, waveHeight);

  vec3 auroraColor = intensity * rampColor * 1.35;
  float auroraAlpha = clamp(intensity * 1.2, 0.0, 1.0);

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export function AuroraShader({
  colorStops = [...MASER_AURORA_COLOR_STOPS],
  amplitude = 1,
  blend = 0.5,
  speed = 1,
  className = '',
}: AuroraShaderProps) {
  const reduceMotion = useReducedMotionGate();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const hiddenRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    let animationId = 0;
    let disposed = false;
    let teardown: (() => void) | undefined;

    const boot = async () => {
      let Renderer: typeof import('ogl').Renderer;
      let Program: typeof import('ogl').Program;
      let Mesh: typeof import('ogl').Mesh;
      let Color: typeof import('ogl').Color;
      let Triangle: typeof import('ogl').Triangle;

      try {
        ({ Renderer, Program, Mesh, Color, Triangle } = await import('ogl'));
      } catch {
        return;
      }

      if (disposed || !containerRef.current) return;

      let renderer: InstanceType<typeof Renderer>;
      try {
        renderer = new Renderer({
          alpha: true,
          antialias: true,
          dpr: Math.min(window.devicePixelRatio, 1.5),
        });
      } catch {
        return;
      }

      const gl = renderer.gl;
      if (!gl) return;

      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uBlend: { value: blend },
          uResolution: { value: [container.offsetWidth, container.offsetHeight] },
          uColorStops: {
            value: colorStops.map((hex) => {
              const c = new Color(hex);
              return [c.r, c.g, c.b];
            }),
          },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      container.appendChild(gl.canvas);
      gl.canvas.className = 'mm-aurora-shader__canvas';

      const resize = () => {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        if (width < 1 || height < 1) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 1.5);
        renderer.setSize(width, height);
        program.uniforms.uResolution.value = [width, height];
        program.uniforms.uColorStops.value = colorStops.map((hex) => {
          const c = new Color(hex);
          return [c.r, c.g, c.b];
        });
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();
      requestAnimationFrame(() => {
        resize();
        requestAnimationFrame(resize);
      });

      const onVisibility = () => {
        hiddenRef.current = document.hidden;
      };

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = entry?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(container);

      document.addEventListener('visibilitychange', onVisibility);

      const animate = (time: number) => {
        animationId = requestAnimationFrame(animate);
        if (!visibleRef.current || hiddenRef.current) return;

        program.uniforms.uTime.value = time * 0.001 * speed;
        program.uniforms.uAmplitude.value = amplitude;
        program.uniforms.uBlend.value = blend;

        renderer.render({ scene: mesh });
      };

      animate(0);

      teardown = () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    };

    void boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      teardown?.();
    };
  }, [amplitude, blend, colorStops, reduceMotion, speed]);

  const rootClass = [
    'mm-aurora-shader',
    reduceMotion ? 'mm-aurora-shader--static' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div ref={containerRef} className={rootClass} aria-hidden="true" />;
}
