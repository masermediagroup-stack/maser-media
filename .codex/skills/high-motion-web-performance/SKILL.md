---
name: high-motion-web-performance
description: Use this skill whenever building, reviewing, debugging, or planning animation-heavy websites with GSAP, ScrollTrigger, shaders, WebGL/canvas, React/Next.js, Framer/Motion, parallax, smooth scrolling, or high-end creative agency-style motion. This skill should trigger for requests about mobile lag, jank, dropped frames, shader performance, scroll animation quality, creative landing pages, portfolio/agency sites, Core Web Vitals, or making visually rich websites feel smooth on real phones.
---

# High-Motion Web Performance

Use this skill to make animation-heavy websites feel expensive without becoming sluggish. The goal is not fewer animations; it is better animation architecture, tighter budgets, and device-aware execution.

## Core Principle

Treat animation as a rendering system, not decoration.

Every animated effect must have:

- A rendering strategy: compositor, CSS, GSAP, canvas, WebGL, video, or static fallback.
- A device strategy: desktop, mobile, reduced motion, low-power, hidden tab.
- A lifecycle: when it mounts, when it starts, when it pauses, and when it is destroyed.
- A budget: how much main-thread, GPU, memory, and network cost it is allowed to spend.

## How Top Creative Sites Stay Smooth

High-end motion sites usually follow these patterns:

- They use progressive enhancement. The baseline page is clean, readable, and fast before animation starts.
- They reserve heavy shaders and WebGL for hero moments or short focused scenes, not every section.
- They ship different motion systems per breakpoint. Mobile gets simpler movement, fewer layers, shorter timelines, and less scroll-scrubbed work.
- They avoid per-frame React state for decorative motion. Continuous visual updates belong in CSS, GSAP setters, canvas, WebGL, or shaders.
- They animate `transform` and `opacity` whenever possible because those can often stay in the compositor.
- They avoid animating layout and paint-heavy properties such as `height`, `width`, `top`, `left`, `filter`, `box-shadow`, large gradients, and blur unless the affected area is small and measured.
- They treat `will-change` as a scalpel, not a blanket. Use it shortly before a real animation and avoid promoting too many layers.
- They pause offscreen and background work. Canvas, WebGL, RAF loops, shader loops, marquees, and particle systems should not run just because a component is mounted.
- They measure on real mobile hardware and production builds. Dev-mode smoothness is not meaningful.

## Decision Framework

Before implementing an effect, classify it:

| Effect type | Best default | Avoid |
| --- | --- | --- |
| Entrance reveal | CSS/GSAP transform + opacity | Layout changes, blur-heavy reveals on many nodes |
| Scroll reveal | GSAP ScrollTrigger, batched | One ScrollTrigger per tiny element if hundreds exist |
| Continuous decorative field | CSS keyframes, canvas, WebGL, shader | React `setState` every frame |
| Large background shader | WebGL/shader with device gating | Running globally on every route if only one section needs it |
| Text split animation | GSAP SplitText, limited scope | Re-splitting many blocks on resize without cleanup |
| Accordion/open-close | CSS grid/height only if infrequent | Continuous layout animation during scroll |
| Parallax | Transform-only, subtle on mobile | Smooth-scroll hijacking on mobile |
| Cursor effects | Desktop pointer only | Mounting on coarse pointer devices |

## Implementation Rules

### React and Next.js

- Keep static sections as server components when possible.
- Put `"use client"` at the smallest component boundary, not at the whole page by default.
- Avoid large client barrels that import every animated section into every route.
- Lazy-load below-the-fold heavy effects when they are near the viewport.
- Do not store per-frame decorative values in React state. Use refs, CSS variables set outside React, GSAP quickSetter, canvas draw loops, or shader uniforms.
- Clean up every timeline, ScrollTrigger, RAF loop, observer, event listener, and WebGL resource on unmount.

### GSAP and ScrollTrigger

- Use `gsap.matchMedia()` or `ScrollTrigger.matchMedia()` to create separate desktop and mobile animation plans.
- On mobile, favor one-shot reveal motion over scrubbed timelines.
- Batch similar reveals instead of creating many independent triggers.
- Use `gsap.context()` in React and call `ctx.revert()` on cleanup.
- Use `quickSetter` or `quickTo` for high-frequency pointer/scroll updates.
- Disable or reduce smooth-scroll wrappers on mobile unless there is a measured reason to keep them.
- Keep `scrub` effects sparse. Scrubbed animations run during the most performance-sensitive interaction: scrolling.

### Shaders, Canvas, and WebGL

- Mount shader/canvas effects only where they are visible or about to be visible.
- Pause RAF loops when the section leaves the viewport.
- Pause when `document.hidden` is true.
- Use lower DPR/pixel density on mobile. A good default is `Math.min(devicePixelRatio, 1.5)` or lower for large full-screen effects.
- Prefer one full-screen visual layer over many overlapping translucent layers.
- Use static image or CSS fallback for reduced motion, low-end mobile, or unsupported WebGL.
- Avoid stacking multiple full-screen effects: canvas galaxy + shader + blur + particles + CSS gradients should be treated as a combined budget.

### CSS Animation

- Prefer `transform` and `opacity`.
- Use `contain`, `content-visibility`, and scoped layout boundaries for large independent sections when appropriate.
- Use `will-change` only for elements that are about to animate, and remove it after long-running animations if it creates too many layers.
- Avoid animating `filter: blur()`, `box-shadow`, large `background-position`, gradients, and masks across large areas unless profiling proves they are acceptable.
- Keep hover-only effects cheap on mobile because touch devices may still trigger style recalculation.

## Performance Budget

Use these as default targets for creative sites:

- Mobile route should remain usable before all decorative effects are ready.
- Scroll into any section should avoid long tasks over 50ms.
- Animation frame work should stay under roughly 8ms on mid-tier mobile; leave room for browser work.
- Avoid more than one always-running full-screen visual loop per route.
- Keep initial JavaScript for the route focused. Split heavy visual libraries by section.
- Reduce texture size, DPR, particle counts, blur radius, and shader complexity on mobile.

## Diagnostic Workflow

1. Reproduce in a production build.
   - `npm run build`
   - `npm run start`
   - Test the deployed preview or local production server.

2. Profile the actual interaction.
   - Use Chrome Performance with mobile emulation first.
   - Confirm on a real phone when possible.
   - Record the laggy scroll or tap, not just page load.

3. Read the trace by category.
   - High scripting: too much JS, React rerendering, GSAP callbacks, or RAF work.
   - High rendering/layout: animating geometry or forcing style/layout.
   - High paint/raster: large blur, shadows, gradients, masks, image decode, or full-screen repaint.
   - High GPU/composite: too many layers, large textures, shader pressure, or over-promotion.

4. Isolate motion cost.
   - Compare normal mode to `prefers-reduced-motion: reduce`.
   - Temporarily disable each visual layer.
   - Disable one effect at a time: shader, canvas, ScrollTrigger, text split, marquee, accordion, particles.

5. Fix the largest measured cost first.
   - Convert React-per-frame effects to CSS/canvas/WebGL/GSAP setters.
   - Gate heavy effects by breakpoint and viewport.
   - Remove global mounts for route-specific effects.
   - Split client bundles and lazy-load visual libraries.

6. Re-profile.
   - Keep before/after numbers.
   - Check desktop and mobile separately.
   - Verify reduced-motion still works.

## Common Fix Patterns

### Replace React per-frame state

Bad pattern:

```tsx
useAnimationFrame(() => {
  setValues(computeNextFrame());
});
```

Better options:

- CSS keyframes when the movement is decorative and deterministic.
- GSAP `quickSetter` when values depend on pointer or scroll.
- Canvas/WebGL when many visual primitives update continuously.
- CSS custom properties updated outside React when only a few values change.

### Gate by mobile

Use mobile as its own creative direction, not a smaller desktop:

```ts
const isCoarse = window.matchMedia('(pointer: coarse)').matches;
const isNarrow = window.matchMedia('(max-width: 767px)').matches;
```

On mobile:

- Lower particle counts.
- Lower shader DPR.
- Remove cursor effects.
- Use one-shot reveals instead of scrub.
- Reduce overlapping transparent layers.
- Prefer static or slow ambient backgrounds.

### Pause offscreen loops

Use `IntersectionObserver` or Motion/React visibility hooks to start and stop expensive animation loops. A hidden section should not consume frame budget.

## Review Checklist

Use this checklist before calling an animation-heavy page done:

- Production build tested.
- Mobile viewport tested.
- Real device tested when possible.
- `prefers-reduced-motion` tested.
- No decorative effect uses React state every frame.
- No smooth-scroll hijack on mobile unless measured and justified.
- Heavy shader/canvas loops pause offscreen.
- Global visual effects are truly global; otherwise they are route/section scoped.
- ScrollTrigger timelines are breakpoint-specific.
- DevTools trace shows no repeated long tasks during scroll.
- Paint flashing does not show full-screen repaint on small interactions.
- Network panel does not load large below-the-fold assets too early.

## Reporting Format

When reporting findings, use:

1. **Likely cause**: the measured bottleneck and where it lives.
2. **Evidence**: build result, trace category, FPS/long-task/raster numbers, or code reference.
3. **Fix**: the smallest change that removes the bottleneck.
4. **Future pattern**: how to avoid repeating the issue in future projects.

