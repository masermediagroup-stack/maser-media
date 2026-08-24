# Maser Media Design System

This file is the working design reference for the Maser Media website and future Maser-style client builds. Keep it practical: tokens first, components second, motion and implementation rules always tied to performance and accessibility.

## Research Takeaways

Recent GitHub design-system references point to a few patterns worth keeping:

- Token-first systems scale better than one-off CSS. GC Design System Tokens, Polaris Tokens, Sage Tokens, and Fluent all treat color, typography, spacing, and motion values as named decisions instead of raw values.
- Accessibility and regression checks belong in the system, not as a final pass. CMS Design System and OpenUI both emphasize accessible, tested components.
- Component tokens should stay scoped. GC Design System calls out that component-specific tokens should not be reused globally because component updates can change them unexpectedly.
- A design file should be portable. The `design.md` spec uses typed groups for colors, typography, spacing, radius, layout, and components, which is a useful shape for agent-readable design direction.
- A strong design system does not need every possible component. OpenUI explicitly focuses on common, well-established patterns and leaves room for product-specific visual language.

## Brand Direction

Maser Media should feel:

- Visual and motion-heavy, but not chaotic.
- Creative-agency polished, not SaaS-template generic.
- Light-surface editorial below the hero, with black/blue high-motion moments used deliberately.
- Clear enough for scanning on mobile.
- Restrained in type scale so similar section headings do not jump in size.

Avoid:

- Component-library dumps.
- Unscoped gradients or decorative blobs.
- Purple/blue-purple dominance.
- Rounded card nests.
- Large mobile headings that fight nearby section rhythm.
- Hard-coded one-off spacing when a local token exists.

## Tokens

Source of truth today is `next-app/src/app/globals.css`.

### Color

```css
--color-bg: #030303;
--color-text: #f8f8f8;
--color-text-muted: #a1a1aa;
--color-accent: #10a4ff;
--color-accent-dark: #0097f5;
--color-accent-darker: #0065a3;

--mm-ink: #f7fbff;
--mm-muted: rgba(232, 242, 255, 0.68);
--mm-faint: rgba(232, 242, 255, 0.42);
--mm-line: rgba(255, 255, 255, 0.14);
--mm-panel: rgba(8, 12, 19, 0.74);
--mm-panel-strong: rgba(10, 16, 25, 0.9);
--mm-blue: #10a4ff;
--mm-logo-blue: #2cafff;
--mm-blue-deep: #0065a3;
--mm-section-surface: #efefef;
```

Use dark surfaces for hero/nav/high-motion moments. Use `--mm-section-surface` for clients, services, process, work fallback, testimonials finish, CTA, footers, and project placeholders.

### Typography

```css
--font-display: 'Aspekta', system-ui, sans-serif;
--font-body: 'Aspekta', system-ui, sans-serif;
--mm-type-display: clamp(2.2rem, 5.3vw, 5rem);
--mm-type-section-title: clamp(2.2rem, 5.3vw, 5rem);
--mm-type-section-title-mobile: clamp(2.05rem, 9vw, 3.05rem);
--mm-type-card-title: clamp(1.25rem, 2vw, 1.65rem);
--mm-type-body: clamp(1rem, 1.35vw, 1.18rem);
--mm-type-body-small: clamp(0.92rem, 1.1vw, 1.04rem);
--mm-leading-display: 1.06;
--mm-leading-title: 1.08;
--mm-leading-body: 1.58;
```

Rules:

- H1 and major H2 headings should use `--mm-type-display` or `--mm-type-section-title`.
- Mobile section headings should cap at `--mm-type-section-title-mobile`.
- Similar sections should not use unrelated headline clamps.
- Global website heading weight should stay at or below `500`.
- Letter spacing should be `0` except small uppercase eyebrows and nav labels.

### Spacing And Layout

```css
--section-padding: clamp(4rem, 10vw, 8rem);
--container-max: 1200px;
--mm-section-pad-x: clamp(1.5rem, 5vw, 6rem);
--mm-radius: 8px;
```

Rules:

- Sections are full-width bands with constrained inner content.
- Avoid cards inside cards.
- Cards stay at `8px` radius unless the existing local pattern requires otherwise.
- Mobile width should use the global section padding override, currently `clamp(1rem, 5vw, 1.25rem)`.
- Use stable heights or aspect ratios for fixed-format elements such as work cards, nav buttons, icon tiles, and project panels.

## Core Surfaces

### Hero

The hero is the primary high-motion dark moment. Keep it visually immersive and brand-forward. Do not introduce text cards into the hero. Mobile hero content must stay readable over shader/background media.

### Navigation

Desktop and mobile nav use liquid/glass styling. The mobile fullscreen drawer should preserve:

- Top-right close button.
- Centered logo.
- Large stacked links.
- Contact CTA set lower than the nav links, with enough space to read as a separate action.

### Clients

Light surface. Centered heading and two/four-column client list. Use the shared section title scale. Do not return to marquee-only client proof on mobile unless tested.

### Services

Heading text is `Services`. The accordion is the main content surface. Accordion titles should be prominent but below section-heading scale. Service cards should remain calm and readable on mobile.

### Process

The process bento is a dense visual proof section. Mobile uses simplified motion and fixed tile heights. Icons can be hidden on mobile when they crowd copy.

### Work

Work cards use stable card heights:

```css
.mm-work-projects {
  --mm-work-card-height: clamp(22rem, 34vw, 30rem);
}

@media (max-width: 760px) {
  .mm-work-projects {
    --mm-work-card-height: clamp(17.5rem, 76vw, 22rem);
  }
}
```

At a `390px` mobile viewport, the cards currently compute to about `296px` tall. Keep this lower mobile height unless content becomes unreadable.

Homepage Work sits on the shared post-hero slate (`--mm-section-surface`). Do not reintroduce a Work-only wash, glow, or shader behind the cards.

### Testimonials

Use the shared section title scale. The moving testimonial band should not reintroduce oversized mobile headings or clipping.

### CTA And Contact

CTA sections should be direct, light-surface, and conversion-oriented. Contact interactions need explicit loading, success, error, validation, and spam-protection planning before production changes.

### Project Placeholder Pages

Project placeholders use the light gray surface, nav, eyebrow, large project heading, short summary, and a full viewport placeholder panel. Keep this structure until a real case study content model is introduced.

Routes added:

- `/work/main-street-pub-grub`
- `/work/helm-in-house-saas`

## Motion Rules

- Prefer transform and opacity.
- Avoid layout animation during scroll.
- Use GSAP contexts and cleanup.
- Use breakpoint-specific motion.
- Pause canvas/WebGL loops when offscreen or hidden.
- Respect `prefers-reduced-motion`.
- Do not use React state per frame for decorative animation.
- Mobile gets simpler motion, smaller shader DPR, and fewer scrubbed effects.

## Implementation Rules

- Use `next/link` for internal links.
- Use `next/image` for important raster assets with real dimensions.
- Keep copy in `next-app/src/lib/content.ts` when it is shared or reusable.
- Add page metadata for every new route.
- Do not add dependencies for one-off visual styling.
- Use existing tokens before creating new values.
- If a new one-off value becomes reused twice, promote it to a token.
- After meaningful website changes, run:

```bash
npm run typecheck
npm run lint
npm run build
```

Then verify in browser at:

- Mobile around `390px` wide.
- Desktop around `1440px` wide.
- Reduced motion when motion changes.

## Sources Reviewed

- CMS Design System: https://github.com/CMSgov/design-system
- OpenUI Design System: https://github.com/openui/design-system
- GC Design System Tokens: https://github.com/cds-snc/gcds-tokens
- U.S. Web Design System docs site: https://github.com/uswds/uswds-site
- Front-end Guideline by Juntos Somos Mais: https://github.com/juntossomosmais/frontend-guideline
- `design.md` spec: https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
- Fluent UI Apple design tokens: https://github.com/microsoft/fluentui-apple/wiki/Design-Tokens
- Polaris Tokens: https://github.com/shopify/polaris-tokens
