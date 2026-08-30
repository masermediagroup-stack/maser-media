/**
 * Sticky liquid-nav collision line.
 * Matches stacked work-card pins (`start: 'top top+=112'`).
 */
export const STICKY_HEADER_OFFSET_PX = 112;

/**
 * Motion viewport for replay section titles (Our Work pattern):
 * `amount: "all"` + top inset matching the sticky liquid-nav collision line.
 */
export const TITLE_DISSOLVE_VIEWPORT = {
  amount: 'all' as const,
  margin: `-${STICKY_HEADER_OFFSET_PX}px 0px 0px 0px`,
};
