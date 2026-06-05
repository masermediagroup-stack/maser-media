# Maser Media Website Agent Guide

This is the main website project for Maser Media, a creative agency. Treat it as a production client-facing site and as the reference system for future Maser Media client websites.

Before changing components, routes, motion, forms, assets, or dependencies, read:

- `.codex/skills/agency-nextjs-website/SKILL.md`
- `.codex/skills/high-motion-web-performance/SKILL.md`
- `docs/AGENCY_WEBSITE_PLAYBOOK.md`
- `README.md`

## Current App

- Active app: `next-app`
- Framework: Next.js App Router
- Routes: `/`, `/about`, `/work` (contact opens via nav/CTA modal; `/contact` redirects to `/`)
- Shared content: `next-app/src/lib/content.ts`
- Main composed sections: `next-app/src/components/index.tsx`
- Global styles: `next-app/src/app/globals.css`
- Commands run from repo root:

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Rules For Future Work

- Keep the homepage and inner pages polished, fast, and conversion-oriented.
- Do not add component-library dumps or copied template folders. Bring in only the files used by the site.
- Keep dependencies lean. Add a package only when native Next/React/CSS, existing utilities, GSAP, or Motion cannot reasonably do the job.
- Use `next/link` for internal navigation and `next/image` for important raster images.
- Every animation must clean up after itself and respect reduced motion.
- Avoid per-frame React state for decorative animation.
- Do not delete assets or components without tracing references with `rg`.
- For new forms, include validation, loading, success, error, and spam-protection planning.
- For new pages, include metadata, semantic headings, responsive states, and a clear next action.
- After meaningful changes, run typecheck, lint, build, and browser verification.

## Preferred Direction

The existing site is intentionally visual and motion-heavy. Improve it by making the structure clearer over time:

- Move large sections out of `src/components/index.tsx` when they become complex.
- Keep reusable client-project patterns in `docs/AGENCY_WEBSITE_PLAYBOOK.md`.
- Keep Codex-specific operating rules in `.codex/skills/agency-nextjs-website/SKILL.md`.
- Keep this file short and strict so future agents see the guardrails immediately.

## Cursor Cloud specific instructions

- **Runtime:** Node.js **≥ 22** (see `next-app/package.json` engines and `.nvmrc`). Install app deps with `npm install --prefix next-app` from the repo root (root `package.json` only proxies scripts).
- **Dev server:** `npm run dev` → http://localhost:3000. For long-running sessions, use a dedicated tmux session (e.g. `next-dev-server`) rather than a one-shot background shell.
- **Quality gates:** `npm run typecheck`, `npm run lint`, `npm run build` (all from repo root). ESLint may report warnings without failing.
- **Optional integrations:** Full contact/booking E2E needs Google Calendar OAuth env vars in `next-app/.env.local` (see `docs/CONTACT_FORM_SETUP.md` and `.env.local.example`). UI and routing work without them; `/api/contact` returns an error when credentials are missing.
- **Not used locally:** No Docker Compose, database, or separate API service—only the Next.js app process.

