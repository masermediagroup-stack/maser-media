import type { FrameLoopHandle, Gpu } from "vgpu";
import { effect, frameLoop, init, surface } from "vgpu";
import type { WashClock } from "./wash-clock";
import type { CtaLogoGradientLook } from "./types";
import washShader from "./wash.wgsl";

export type StartGradientOptions = {
  canvas: HTMLCanvasElement;
  lookRef: { current: CtaLogoGradientLook };
  clock: WashClock;
  onPainted: () => void;
};

export function startGradient({
  canvas,
  lookRef,
  clock,
  onPainted,
}: StartGradientOptions): () => void {
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Gpu | undefined;
  let painted = false;

  void (async () => {
    try {
      gpu = await init();
    } catch {
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    const canvasSurface = surface(gpu, canvas, {
      dpr: [1, 2],
      alphaMode: "premultiplied",
      clearColor: [0, 0, 0, 0],
      label: "cta-logo-gradient",
    });

    const initial = lookRef.current;
    const wash = effect(gpu, washShader, {
      label: "cta-logo-gradient-wash",
      set: {
        params: {
          phase: clock.phase,
          heading: (initial.angle * Math.PI) / 180,
          highlight: initial.highlight,
          shade: initial.shade,
          glow: initial.glow,
          pad: 0,
        },
      },
    });

    try {
      await wash.compile(canvasSurface);
    } catch {
      gpu.dispose();
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    loop = frameLoop(gpu, (frame) => {
      const look = lookRef.current;
      wash.set({
        params: {
          phase: clock.phase,
          heading: (look.angle * Math.PI) / 180,
          highlight: look.highlight,
          shade: look.shade,
          glow: look.glow,
          pad: 0,
        },
      });
      frame.pass(canvasSurface, wash);
      if (painted || !gpu) return;
      painted = true;
      void gpu.settled().then(() => {
        if (!disposed) onPainted();
      });
    });
  })();

  return () => {
    disposed = true;
    loop?.stop();
    gpu?.dispose();
  };
}
