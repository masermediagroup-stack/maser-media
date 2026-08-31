/**
 * Sticky liquid-nav collision line.
 * Matches stacked work-card pins (`start: 'top top+=112'`).
 */
export const STICKY_HEADER_OFFSET_PX = 112;

export const TITLE_DISSOLVE_MQ_NARROW = '(max-width: 767px)';

export type TitleDissolveViewport = {
  once: boolean;
  amount: 0;
  margin?: string;
};

/** Desktop: last pixel tucks under the liquid nav, then the title may reverse. */
export const TITLE_DISSOLVE_VIEWPORT: TitleDissolveViewport = {
  once: false,
  amount: 0,
  margin: `-${STICKY_HEADER_OFFSET_PX}px 0px 0px 0px`,
};

/**
 * Mobile: fade in once and stay solid. Reversing at a header inset still
 * left category copy and wrapped ledes at 14% opacity mid-viewport.
 */
export const TITLE_DISSOLVE_VIEWPORT_MOBILE: TitleDissolveViewport = {
  once: true,
  amount: 0,
};

export function getTitleDissolveViewport(isNarrow: boolean): TitleDissolveViewport {
  return isNarrow ? TITLE_DISSOLVE_VIEWPORT_MOBILE : TITLE_DISSOLVE_VIEWPORT;
}
