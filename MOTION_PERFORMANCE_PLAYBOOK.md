# Motion Performance Playbook

This project uses a high-motion creative site pattern: static content first, section-scoped motion second, device-specific animation plans third.

## Current Rules

- Keep decorative continuous motion out of React state. Per-frame React updates are reserved for real UI state, not ambient visuals.
- Use CSS transforms, GSAP setters, canvas, or WebGL uniforms for continuous decorative animation.
- Mount heavy effects only where they are visible or near-visible.
- Pause canvas/WebGL loops when offscreen or when the tab is hidden.
- Mobile is its own animation direction. It gets fewer visual layers, fewer animated primitives, lower pixel density, and less scroll-scrubbed motion.
- Avoid route-wide WebGL unless the whole route visibly needs it. Prefer section-specific shader environments.

## What Changed Here

- Services aurora bars no longer update React state every animation frame.
- Services bars now animate with CSS `transform: scaleY(...)`; phones render fewer visible bars.
- The galaxy canvas now stops animating once the user scrolls past the galaxy-visible part of the page and pauses in hidden tabs.
- The hero smokey WebGL shader no longer reallocates the canvas buffer every frame and pauses offscreen.
- The root global shader layer is now static CSS atmosphere instead of route-wide WebGL.
- The work-section ripple mounts only when the work section is near the viewport.

## How To Build Future Sections

1. Start with static semantic markup and CSS. The page should be readable and visually acceptable before any animation runs.
2. Add one section environment at a time: hero shader, services motion, work ripple, testimonial aurora, etc.
3. Give each environment a lifecycle:
   - Mount near viewport.
   - Start when visible.
   - Pause when hidden/offscreen.
   - Destroy on route change/unmount.
4. Use `gsap.matchMedia()` or component-level media queries to separate desktop and mobile timelines.
5. Profile the exact interaction in a production build before shipping.

## Verification Checklist

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Mobile production trace for the laggy section.
- Desktop production trace for the same section.
- Confirm `prefers-reduced-motion` does not run decorative loops.
- Confirm below-the-fold heavy effects are not mounted at initial load.

