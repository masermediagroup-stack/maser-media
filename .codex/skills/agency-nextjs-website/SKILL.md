---
name: agency-nextjs-website
description: Use when building, reviewing, or refactoring Maser Media agency websites or client sites built with Next.js, React, motion, contact forms, inner pages, case studies, SEO, and performance-sensitive creative effects.
---

# Agency Next.js Website

Use this skill for Maser Media's main website and client websites. The goal is a professional creative-agency site that looks custom, stays maintainable, and remains smooth on real devices.

## Operating Principles

- Treat the site as a client product, not a demo. Every section should have a business purpose: trust, positioning, proof, process, offer, or conversion.
- Default to Next.js App Router conventions: route folders in `src/app`, shared primitives in `src/components`, copy/data in `src/lib/content.ts`, and public assets in `public`.
- Keep route files small. Pages should compose sections; sections should own layout and presentation; reusable helpers should live outside routes.
- Use Server Components by default on new client projects. Add `"use client"` only where browser APIs, animation libraries, event handlers, or local state are required.
- For this existing Maser Media site, respect its current client-heavy structure and improve incrementally instead of rewriting the whole app at once.
- Before adding a dependency, prove the app needs it. Prefer existing local helpers, browser APIs, CSS, GSAP, Motion, and Next.js features already installed.

## Project Shape

Recommended structure for this repo and future client sites:

```text
src/app/
  page.tsx
  about/page.tsx
  work/page.tsx
  contact/page.tsx
src/components/
  ui/
  sections/
  motion/
src/lib/
  content.ts
  utils.ts
  seo.ts
  forms/
public/
  assets/
```

For small sites, colocating all sections in `src/components/index.tsx` is workable but should be treated as transitional. When a section grows or is reused, move it to a named file.

## Page And Section Rules

- Every public page needs a clear H1, metadata, responsive layout, and a conversion path.
- Inner pages should feel like first-class pages, not copied landing sections. Give About, Work, and Contact their own structure.
- Case studies should follow: context, problem, constraints, solution, proof, deliverables, next step.
- Contact pages should be fast, calm, and direct. Validate inputs, show errors near fields, preserve user input, and make success/failure states explicit.
- Navigation should use `next/link`; images should use `next/image` when dimensions and optimization matter.
- Keep copy in `src/lib/content.ts` or another structured content file so client-site variants can swap content without rewriting components.

## Motion Architecture

- Motion must have a rendering strategy, device strategy, lifecycle, and budget.
- Prefer transform and opacity. Avoid scroll-linked layout changes, large animated blur, giant shadows, and full-screen repaint effects.
- Decorative continuous work belongs in CSS, GSAP setters, canvas, or WebGL, not per-frame React state.
- Use GSAP contexts and cleanup. Every timeline, ScrollTrigger, observer, listener, requestAnimationFrame loop, and WebGL resource must be stopped or reverted on unmount.
- Use breakpoint-specific motion with `gsap.matchMedia()` or route-specific gates. Mobile gets simpler motion, fewer layers, lower DPR, and less scroll-scrubbing.
- Respect `prefers-reduced-motion`. A reduced-motion page should still feel designed, just quieter.
- Avoid stacking multiple always-running full-screen effects. One global ambient layer is usually the budget.

## Performance Budget

Targets for Maser Media and client launches:

- LCP at or under 2.5s in field data.
- INP at or under 200ms in field data.
- CLS at or under 0.1.
- Production build passes before handoff.
- Mobile viewport is tested, not guessed.
- Heavy visual assets are lazy-loaded unless they are part of the first viewport.
- Fonts are loaded through Next font or local optimized files; avoid layout shift from late font swaps.
- Above-the-fold images have explicit dimensions, appropriate `sizes`, and `priority` only when truly needed.

## Forms

- Prefer Server Actions or route handlers for real submissions in App Router projects.
- Validate on the server. Client validation improves UX, but server validation protects the workflow.
- Include spam protection before public launch: honeypot, rate limit, turnstile/reCAPTCHA, or provider-native controls.
- A form is not complete until it has loading, success, recoverable error, and fallback states.
- Never commit secrets. Use environment variables and document required keys in `.env.example`.

## SEO And Client Readiness

- Use the Metadata API for title, description, Open Graph, canonical URL, and social preview images.
- Add structured data when it matches the business: LocalBusiness, Organization, Service, Article, or CreativeWork.
- Generate sitemap and robots rules for production sites.
- Check semantic HTML, keyboard navigation, focus styles, color contrast, and alt text.
- Add analytics and Speed Insights only when the client agrees to the measurement plan.

## Implementation Workflow

1. Read `AGENTS.md`, `docs/AGENCY_WEBSITE_PLAYBOOK.md`, `package.json`, route files, and the components you will touch.
2. Trace imports before deleting files. Prefer `rg` and `rg --files`.
3. Plan section/component boundaries before coding.
4. Implement with the smallest component/client boundary that fits.
5. Run `npm run typecheck`, `npm run lint`, and `npm run build`.
6. Start the dev server and verify the actual page in a browser, especially mobile width.
7. For motion changes, test reduced motion and verify no obvious blank canvas, stuck loader, or overlapping text.

## Maintenance Rhythm

- After each client project, capture reusable patterns in this skill and the playbook.
- Keep a short changelog of architectural decisions when the site structure changes.
- Review dependencies monthly. Remove unused component dumps, starter assets, stale logs, and dead experiments.
- Promote proven sections into reusable client templates only after they have shipped and survived real feedback.

## Research Base

- Next.js App Router and project structure: https://nextjs.org/docs/app
- Next.js production checklist: https://nextjs.org/docs/app/guides/production-checklist
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- React effect cleanup: https://react.dev/reference/react/useEffect
- Core Web Vitals: https://web.dev/articles/vitals
- GSAP ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Creative motion case study reference: https://tympanus.net/codrops/2025/09/19/lo2s-x-snp-dashdigital-designing-a-website-full-of-movement-and-energy/

