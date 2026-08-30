/**
 * Sticky liquid-nav collision line.
 * Matches stacked work-card pins (`start: 'top top+=112'`).
 */
export const STICKY_HEADER_OFFSET_PX = 112;

export function sectionTitleDissolveEnd(): string {
  return `top top+=${STICKY_HEADER_OFFSET_PX}`;
}

/**
 * Motion viewport for replay section titles: stay "in view" until the
 * heading's top reaches the sticky header, then leave (dissolve).
 */
export const TITLE_DISSOLVE_VIEWPORT = {
  amount: 'all' as const,
  margin: `-${STICKY_HEADER_OFFSET_PX}px 0px 0px 0px`,
};
