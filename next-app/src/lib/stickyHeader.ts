/**
 * Sticky liquid-nav collision line.
 * Matches stacked work-card pins (`start: 'top top+=112'`).
 */
export const STICKY_HEADER_OFFSET_PX = 112;

/** Compact hamburger bar + top inset on small viewports. */
export const STICKY_HEADER_OFFSET_MOBILE_PX = 72;

export const TITLE_DISSOLVE_MQ_NARROW = '(max-width: 767px)';

/**
 * Dissolve inset = the sticky nav itself.
 * Leave fires when the last pixel of the heading tucks under that line
 * (`amount: 0`), not when the first line reaches it (`amount: "all"`).
 */
export const TITLE_DISSOLVE_HEADER_OFFSET_PX = STICKY_HEADER_OFFSET_PX;
export const TITLE_DISSOLVE_HEADER_OFFSET_MOBILE_PX = STICKY_HEADER_OFFSET_MOBILE_PX;

export type TitleDissolveViewport = {
  amount: 0;
  margin: string;
};

function dissolveViewport(offsetPx: number): TitleDissolveViewport {
  return {
    amount: 0,
    margin: `-${offsetPx}px 0px 0px 0px`,
  };
}

/** Desktop: heading stays solid until it actually meets the sticky bar. */
export const TITLE_DISSOLVE_VIEWPORT = dissolveViewport(TITLE_DISSOLVE_HEADER_OFFSET_PX);

/** Mobile: shorter nav, same “last pixel under the bar” rule. */
export const TITLE_DISSOLVE_VIEWPORT_MOBILE = dissolveViewport(
  TITLE_DISSOLVE_HEADER_OFFSET_MOBILE_PX,
);

export function getTitleDissolveViewport(isNarrow: boolean): TitleDissolveViewport {
  return isNarrow ? TITLE_DISSOLVE_VIEWPORT_MOBILE : TITLE_DISSOLVE_VIEWPORT;
}
