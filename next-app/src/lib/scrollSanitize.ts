/**
 * Reset GSAP scroll artifacts when leaving the homepage smooth-scroll shell.
 * Inner routes depend on this — leftover pin-spacers / ScrollSmoother inline heights
 * are the main cause of scroll extending past the footer (galaxy bleed).
 */
export async function sanitizeScrollArtifacts() {
  if (typeof window === 'undefined') return;

  const isInnerRoute = Boolean(document.querySelector('main.mm-inner-main'));

  const [{ ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
    import('gsap/ScrollTrigger'),
    import('gsap/ScrollSmoother'),
  ]);

  ScrollSmoother.get()?.kill();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  const removePinSpacers = () => {
    document.querySelectorAll('.pin-spacer').forEach((node) => {
      node.remove();
    });
  };

  removePinSpacers();

  const wrapper = document.getElementById('smooth-wrapper');
  const content = document.getElementById('smooth-content');

  wrapper?.removeAttribute('style');
  content?.removeAttribute('style');

  // Homepage smooth-scroll nodes must not remain on inner routes.
  if (isInnerRoute) {
    wrapper?.remove();
    content?.remove();
  }

  // ScrollSmoother / pin-spacers often leave height on html/body — that creates phantom scroll.
  for (const el of [document.documentElement, document.body]) {
    el.style.removeProperty('height');
    el.style.removeProperty('min-height');
    el.style.removeProperty('overflow');
    el.style.removeProperty('position');
    el.style.removeProperty('top');
    el.style.removeProperty('width');
  }

  ScrollTrigger.clearScrollMemory?.();
  ScrollTrigger.refresh();

  // Pin-spacers can be re-inserted on the next frame after smoother teardown.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      removePinSpacers();
      ScrollTrigger.refresh();
      requestAnimationFrame(() => {
        removePinSpacers();
        ScrollTrigger.refresh();
        resolve();
      });
    });
  });
}

