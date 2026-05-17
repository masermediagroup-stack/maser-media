# GSAP Stacked Work Posters

## Summary
Build the stacked poster scroll interaction on the homepage work section only. Use GreenSock’s stacking-card pattern as the model: each project poster remains a real `Link`, cards pin/overlap while scrolling, and reverse naturally unstacks when scrolling back up. References: [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and GreenSock’s [Simple Stacking Cards demo](https://codepen.io/GreenSock/pen/poBRQRj).

## Key Changes
- Add a homepage-only stacked mode to the existing `Work` component, leaving `/work` with the current full-page card list.
- Keep each poster as the clickable project link; the visually top card will also be the active clickable layer through normal stacking order and `z-index`.
- Replace the current one-shot card reveal on homepage work cards with a section-scoped GSAP ScrollTrigger setup:
  - one wrapper per card for pinning,
  - `pin: wrapper`,
  - `pinSpacing: false`,
  - scrubbed transform animation for scale, slight rotation/perspective, and y-offset,
  - `transformOrigin: "top center"`.
- Animate the section background smoothly with the same scroll progress using CSS variables or GSAP-set transform-friendly values where possible; avoid paint-heavy per-frame layout changes.
- Preserve reduced-motion behavior: no pinned stack, no scrubbed timeline, normal readable static cards.

## Implementation Details
- Update `InnerPage kind="work"` to render `Work` in non-stacked mode.
- Render homepage `Work` in stacked mode by default.
- Add small wrapper markup around each `.mm-work-card` only when stacked mode is active.
- Move the new ScrollTrigger logic into a focused hook or a local effect with `gsap.context()` cleanup; do not put per-frame state in React.
- Remove or bypass the existing `ScrollTrigger.batch()` reveal for stacked homepage work cards to avoid conflicting transforms.
- Use `gsap.matchMedia()`:
  - desktop/tablet: full pinned stack interaction,
  - mobile/coarse pointer: simplified non-pinned reveal or lighter stack with no aggressive pinning.

## Test Plan
- Run `npm run typecheck`, `npm run lint`, and `npm run build` in `C:\Users\matbo\maser-media\next-app`.
- Verify homepage scroll down stacks posters smoothly and scroll up unstacks them.
- Verify each visible top poster click opens its `CONTENT.work.items[*].link`.
- Verify `/work` still renders the standard project list without the stacked scroll effect.
- Verify reduced-motion mode disables scrubbed/pinned motion.
- Check desktop and mobile viewports for overlap, text fit, and scroll jank.

## Assumptions
- “Work section” means the homepage work section first.
- Existing project links in `CONTENT.work.items` remain the source of truth.
- No new project pages are required; external links and `/contact` continue to behave as they do now.
