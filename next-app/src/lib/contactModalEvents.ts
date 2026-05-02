/** Dispatched on `window` so `LiquidNav` can open the contact modal from outside (e.g. CTA). */
export const OPEN_CONTACT_MODAL_EVENT = 'maser-media:open-contact-modal';

export function openContactModalFromApp(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_CONTACT_MODAL_EVENT));
}
