'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/assets/Blue-HD.svg';
const LOGO_VIEWBOX_WIDTH = 3776.87;
const LOGO_VIEWBOX_HEIGHT = 1915.83;
const LOGO_ASPECT = LOGO_VIEWBOX_WIDTH / LOGO_VIEWBOX_HEIGHT;
const LOGO_WIDTH = 640;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_ASPECT);
const LOGO_FRAME_INSET = 0.1;
const LOGO_VIEW_MARGIN = 0.78;
const FRUSTUM_HEIGHT = 1;
const MAX_TILT_X = 0.26;
const MAX_TILT_Y = 0.3;
const MAX_LIFT = 0.12;
const LERP = 0.12;

type TiltState = {
  x: number;
  y: number;
  z: number;
};

function prefersFinePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function canUseWebGL() {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement('img');
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Logo image failed to load'));
    img.src = src;
  });
}

function canvasHasLogoPixels(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 8) return true;
  }

  return false;
}

async function createLogoTexture() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const width = Math.round(LOGO_WIDTH * dpr);
  const height = Math.round(LOGO_HEIGHT * dpr);

  const response = await fetch(LOGO_SRC);
  if (!response.ok) {
    throw new Error('Logo fetch failed');
  }

  const svgMarkup = await response.text();
  const svgDataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
  const image = await loadImageElement(svgDataUri);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D unavailable');
  }

  ctx.clearRect(0, 0, width, height);

  const insetX = width * LOGO_FRAME_INSET;
  const insetY = height * LOGO_FRAME_INSET;
  ctx.drawImage(
    image,
    insetX,
    insetY,
    width - insetX * 2,
    height - insetY * 2,
  );

  if (!canvasHasLogoPixels(canvas)) {
    throw new Error('Logo raster was empty');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

function waitForMountLayout(mount: HTMLElement) {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (mount.clientWidth > 1 && mount.clientHeight > 1) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

function updateLogoViewport(
  camera: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer,
  mount: HTMLElement,
  mesh: THREE.Mesh,
  planeAspect: number,
) {
  const width = Math.max(mount.clientWidth, 1);
  const height = Math.max(mount.clientHeight, 1);
  const viewAspect = width / height;
  const frustumWidth = FRUSTUM_HEIGHT * viewAspect;

  camera.left = -frustumWidth / 2;
  camera.right = frustumWidth / 2;
  camera.top = FRUSTUM_HEIGHT / 2;
  camera.bottom = -FRUSTUM_HEIGHT / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);

  const scale = Math.min(
    (frustumWidth * LOGO_VIEW_MARGIN) / planeAspect,
    FRUSTUM_HEIGHT * LOGO_VIEW_MARGIN,
  );
  mesh.scale.set(scale, scale, 1);
}

export function CtaLogoTilt({ className }: { className?: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [webglReady, setWebglReady] = useState(false);
  const [useStaticTilt, setUseStaticTilt] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    if (reduceMotion || !prefersFinePointer() || !canUseWebGL()) {
      setUseStaticTilt(true);
      return;
    }

    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let isVisible = true;

    const target: TiltState = { x: 0, y: 0, z: 0 };
    const current: TiltState = { x: 0, y: 0, z: 0 };

    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let material: THREE.MeshBasicMaterial | null = null;
    let texture: THREE.CanvasTexture | null = null;
    let mesh: THREE.Mesh | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;

    const setPointerTilt = (clientX: number, clientY: number) => {
      const rect = shell.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;

      target.y = x * MAX_TILT_Y;
      target.x = -y * MAX_TILT_X;
      target.z = MAX_LIFT;
    };

    const resetTilt = () => {
      target.x = 0;
      target.y = 0;
      target.z = 0;
    };

    const renderFrame = () => {
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      current.z += (target.z - current.z) * LERP;

      if (!mesh || !renderer || !scene || !camera) return;

      mesh.rotation.x = current.x;
      mesh.rotation.y = current.y;
      mesh.position.z = current.z;
      renderer.render(scene, camera);
    };

    const animationLoop = () => {
      if (disposed || !isVisible) return;
      renderFrame();
    };

    const startRenderLoop = () => {
      if (disposed || !renderer) return;
      renderer.setAnimationLoop(animationLoop);
    };

    const stopRenderLoop = () => {
      renderer?.setAnimationLoop(null);
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shell.classList.add('mm-cta__logo--active');
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shell.classList.remove('mm-cta__logo--active');
      resetTilt();
    };

    const onWindowResize = () => {
      if (!renderer || !camera || !mount || !mesh) return;
      updateLogoViewport(camera, renderer, mount, mesh, LOGO_ASPECT);
      renderFrame();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          renderFrame();
          startRenderLoop();
        } else {
          stopRenderLoop();
        }
      },
      { threshold: 0.01 },
    );

    const initWebGL = async () => {
      try {
        texture = await createLogoTexture();
        if (disposed) return;

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
        camera.position.set(0, 0, 1);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        mount.replaceChildren();
        mount.appendChild(renderer.domElement);

        geometry = new THREE.PlaneGeometry(LOGO_ASPECT, 1);
        material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          side: THREE.DoubleSide,
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        await waitForMountLayout(mount);
        if (disposed) return;

        updateLogoViewport(camera, renderer, mount, mesh, LOGO_ASPECT);
        renderFrame();

        if (disposed || !mount.contains(renderer.domElement)) return;

        startRenderLoop();
        setWebglReady(true);
      } catch {
        if (!disposed) {
          setUseStaticTilt(true);
        }
      }
    };

    shell.addEventListener('pointerenter', onPointerEnter);
    shell.addEventListener('pointermove', onPointerMove);
    shell.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onWindowResize);
    observer.observe(shell);

    void initWebGL();

    return () => {
      disposed = true;
      setWebglReady(false);
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
      shell.removeEventListener('pointerenter', onPointerEnter);
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerleave', onPointerLeave);
      stopRenderLoop();

      geometry?.dispose();
      texture?.dispose();
      material?.dispose();
      renderer?.dispose();
      mount.replaceChildren();

      shell.classList.remove('mm-cta__logo--active');
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!useStaticTilt) return;

    const shell = shellRef.current;
    if (!shell) return;

    let disposed = false;
    let isVisible = true;
    let rafId = 0;

    const target: TiltState = { x: 0, y: 0, z: 0 };
    const current: TiltState = { x: 0, y: 0, z: 0 };

    const setPointerTilt = (clientX: number, clientY: number) => {
      const rect = shell.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;

      target.y = x * MAX_TILT_Y;
      target.x = -y * MAX_TILT_X;
      target.z = MAX_LIFT;
    };

    const resetTilt = () => {
      target.x = 0;
      target.y = 0;
      target.z = 0;
    };

    const renderFrame = () => {
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      current.z += (target.z - current.z) * LERP;

      shell.style.setProperty('--cta-logo-tilt-x', String(current.x) + 'rad');
      shell.style.setProperty('--cta-logo-tilt-y', String(current.y) + 'rad');
      shell.style.setProperty('--cta-logo-tilt-z', String(current.z * 24) + 'px');
    };

    const loop = () => {
      if (disposed || !isVisible) return;
      renderFrame();
      rafId = window.requestAnimationFrame(loop);
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shell.classList.add('mm-cta__logo--active');
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shell.classList.remove('mm-cta__logo--active');
      resetTilt();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          renderFrame();
          rafId = window.requestAnimationFrame(loop);
        } else {
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.01 },
    );

    shell.addEventListener('pointerenter', onPointerEnter);
    shell.addEventListener('pointermove', onPointerMove);
    shell.addEventListener('pointerleave', onPointerLeave);
    observer.observe(shell);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      shell.removeEventListener('pointerenter', onPointerEnter);
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerleave', onPointerLeave);
      shell.classList.remove('mm-cta__logo--active');
      shell.style.removeProperty('--cta-logo-tilt-x');
      shell.style.removeProperty('--cta-logo-tilt-y');
      shell.style.removeProperty('--cta-logo-tilt-z');
    };
  }, [useStaticTilt]);

  return (
    <div
      ref={shellRef}
      className={cn(
        'mm-cta__logo-shell',
        useStaticTilt && 'mm-cta__logo-shell--static-tilt',
        webglReady && 'mm-cta__logo-shell--webgl-ready',
        className,
      )}
    >
      <div className="mm-cta__logo-viewport">
        <Image
          src={LOGO_SRC}
          alt="Maser Media"
          fill
          sizes="(min-width: 820px) 40vw, 88vw"
          className="mm-cta__logo mm-cta__logo--static"
        />
        {!useStaticTilt ? (
          <div ref={mountRef} className="mm-cta__logo mm-cta__logo--tilt" aria-hidden />
        ) : null}
      </div>
    </div>
  );
}
