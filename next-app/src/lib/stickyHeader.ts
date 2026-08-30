/**
 * Sticky liquid-nav collision line.
 * Matches stacked work-card pins (`start: 'top top+=112'`).
 */
export const STICKY_HEADER_OFFSET_PX = 112;

/**
 * Section-title dissolve inset: 20% past nav collision so headings stay readable longer.
 * (112px × 1.2 → 134px)
 */
export const TITLE_DISSOLVE_HEADER_OFFSET_PX = Math.round(STICKY_HEADER_OFFSET_PX * 1.2);

/**
 * Motion viewport for replay section titles (Our Work pattern):
 * `amount: "all"` + top inset matching the title dissolve line.
 */
export const TITLE_DISSOLVE_VIEWPORT = {
  amount: 'all' as const,
  margin: `-${TITLE_DISSOLVE_HEADER_OFFSET_PX}px 0px 0px 0px`,
};
