export type PreloadGateOptions = {
  logoSrc: string;
  extraImageSrcs?: string[];
  maxDurationMs?: number;
};

export async function preloadImage(src: string): Promise<void> {
  await new Promise<void>((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = src;
    if (img.complete) queueMicrotask(done);
  });
}

export async function waitForFonts(): Promise<void> {
  const anyDoc = document as unknown as { fonts?: { ready: Promise<unknown> } };
  if (!anyDoc.fonts?.ready) return;
  try {
    await anyDoc.fonts.ready;
  } catch {
    // Do not block the preloader on fonts.
  }
}

export async function runPreloadGates(opts: PreloadGateOptions): Promise<void> {
  const maxDurationMs = typeof opts.maxDurationMs === 'number' ? opts.maxDurationMs : 4500;
  const images = [opts.logoSrc, ...(opts.extraImageSrcs ?? [])].filter(Boolean);

  const gates = Promise.all([waitForFonts(), ...images.map((s) => preloadImage(s))]).then(() => undefined);
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, maxDurationMs));

  await Promise.race([gates, timeout]);
}
