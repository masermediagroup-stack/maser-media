/**
 * Mirrors IntersectionObserver options used on the home page for `.scroll-animate`:
 * rootMargin: -40px 0, threshold ~0.15 of the element visible within that band.
 * Call after navigation / layout so sections already on screen get `.in-view` immediately.
 */
export function revealScrollAnimateInViewport(): void {
  if (typeof window === 'undefined') return;

  const elements = document.querySelectorAll('.scroll-animate');
  const topInset = 40;
  const bottomInset = 40;
  const vh = window.innerHeight;
  const bandTop = topInset;
  const bandBottom = vh - bottomInset;

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0 || rect.width <= 0) return;

    const overlapTop = Math.max(rect.top, bandTop);
    const overlapBottom = Math.min(rect.bottom, bandBottom);
    const visibleHeight = overlapBottom - overlapTop;
    if (visibleHeight <= 0) return;

    const ratio = visibleHeight / rect.height;
    if (ratio >= 0.15 || (rect.top >= bandTop && rect.bottom <= bandBottom)) {
      el.classList.add('in-view');
    }
  });
}
