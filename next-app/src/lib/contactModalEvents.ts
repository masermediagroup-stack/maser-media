/** Dispatched on `window` so `LiquidNav` can open the contact modal from outside (e.g. CTA). */
export const OPEN_CONTACT_MODAL_EVENT = 'maser-media:open-contact-modal';

/** Content/config sentinel for CTAs that open the contact modal instead of routing. */
export const CONTACT_MODAL_HREF = '#open-contact';

export function isContactModalHref(href: string): boolean {
  return href === CONTACT_MODAL_HREF || href === '/contact';
}

export function openContactModalFromApp(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_CONTACT_MODAL_EVENT));
}
