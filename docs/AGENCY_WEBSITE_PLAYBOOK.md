# Agency Website Playbook

This playbook is for the Maser Media website and future Maser Media client websites. It captures how professional creative-agency sites should be planned, built, verified, and improved over time.

## What Top Creative Teams Optimize For

Professional creative sites are not just animated pages. The best ones combine:

- A strong first impression that makes the brand obvious in the first viewport.
- Clear page architecture: Home, Work, About, Services/Pricing, Contact, and case studies.
- A repeatable content model so the client can add work without rebuilding the site.
- Motion that supports the story instead of fighting the browser.
- Production-grade performance, accessibility, SEO, analytics, and deployment checks.

The recurring stack pattern is Next.js plus React, GSAP or Motion for interaction, a CMS-ready content layer, optimized images, and Vercel or similar hosting.

## Recommended Project Model

Use this model for new Maser Media client sites:

```text
src/app/
  page.tsx
  about/page.tsx
  work/page.tsx
  work/[slug]/page.tsx
  services/page.tsx
  contact/page.tsx
src/components/
  sections/
  ui/
  motion/
  forms/
src/lib/
  content/
  forms/
  seo.ts
  utils.ts
public/assets/
```

Use route groups when a project grows:

```text
src/app/(marketing)/
src/app/(studio)/
src/app/(cms-preview)/
```

Keep `app` responsible for routes and layouts. Keep reusable sections, data transforms, form logic, and animation utilities outside route files.

## Maser Media Site Notes

This repo currently has a compact structure:

- `next-app/src/app` owns the public routes.
- `next-app/src/components/index.tsx` contains many homepage and inner-page sections.
- `next-app/src/lib/content.ts` owns most site copy and structured content.
- `next-app/src/app/globals.css` contains the visual system and route styling.

This is acceptable for the current site, but future work should gradually extract large sections into `src/components/sections/*` when editing them substantially.

## Page Checklist

Every new or heavily changed page should have:

- One clear H1.
- Metadata title and description.
- Open Graph/social preview plan.
- A primary conversion path.
- Mobile, tablet, and desktop layouts.
- Keyboard-accessible navigation and controls.
- No overlapping text or controls at common widths.
- Real content or structured placeholders, not generic filler.
- Build, lint, typecheck, and browser verification.

## Motion Checklist

Before adding a motion effect, define:

- Purpose: what does this communicate?
- Surface: route, section, component, or global layer?
- Renderer: CSS, Motion, GSAP, canvas, WebGL, or static fallback?
- Lifecycle: when does it start, pause, resume, and clean up?
- Device behavior: desktop, mobile, reduced motion, hidden tab.
- Budget: how many layers, particles, timelines, observers, and image/video assets?

Rules:

- Prefer `transform` and `opacity`.
- Avoid layout animation during scroll.
- Batch scroll reveals.
- Use `gsap.context()` and cleanup.
- Use `gsap.matchMedia()` for breakpoint-specific timelines.
- Pause offscreen canvas/WebGL/requestAnimationFrame loops.
- Keep mobile simpler than desktop.

## Forms And Leads

For client-ready contact forms:

- Use server-side validation.
- Include a honeypot and rate limiting or anti-spam provider.
- Include loading, success, and error states.
- Keep error messages specific and close to fields.
- Store submissions in a system the client will actually use: email, CRM, Airtable, Notion, Google Sheets, or CMS.
- Never expose API keys in client components.

For this Maser Media site, the contact flow can evolve into a reusable client lead-intake pattern with:

- Project type
- Budget range
- Timeline
- Contact details
- Optional brief
- Success event tracking

## Content Model For Client Sites

Start simple, but keep the shape reusable:

```ts
type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  summary: string;
  services: string[];
  year: string;
  heroImage: string;
  challenge: string;
  solution: string;
  results: string[];
};
```

For sites that need editing by non-developers, move this into Sanity, Contentful, DatoCMS, Builder, or another CMS after the content model stabilizes.

## Performance And QA

Use these launch checks:

```bash
npm run typecheck
npm run lint
npm run build
npm run dev
```

Then verify:

- Home, About, Work, Pricing/Services, Contact.
- Mobile viewport around 390px wide.
- Desktop viewport around 1440px wide.
- Reduced motion.
- Contact form states.
- No console errors.
- No missing assets.
- No unexpected layout shift.

Performance targets:

- LCP at or below 2.5s.
- INP at or below 200ms.
- CLS at or below 0.1.
- Production build succeeds before deploy.

## How To Improve This Over Time

After each website project:

- Add one reusable pattern to this playbook.
- Remove one obsolete rule or dependency.
- Capture one component that should become a template.
- Capture one mistake to avoid next time.
- Review analytics and Speed Insights before changing animation or media strategy.

Every month for the Maser Media main site:

- Run build/lint/typecheck.
- Audit dependencies.
- Search for unused assets and dead files.
- Review top pages and form conversion.
- Check mobile performance.
- Update case studies and proof.

Every quarter:

- Revisit the information architecture.
- Refresh screenshots and visual proof.
- Review Core Web Vitals field data.
- Decide which client-site patterns deserve extraction into a starter template.

## Sources Worth Rechecking

- Next.js App Router docs: https://nextjs.org/docs/app
- Next.js project structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js production checklist: https://nextjs.org/docs/app/guides/production-checklist
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- React `useEffect` cleanup: https://react.dev/reference/react/useEffect
- Core Web Vitals: https://web.dev/articles/vitals
- MDN lazy loading: https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Creative motion case study: https://tympanus.net/codrops/2025/09/19/lo2s-x-snp-dashdigital-designing-a-website-full-of-movement-and-energy/

