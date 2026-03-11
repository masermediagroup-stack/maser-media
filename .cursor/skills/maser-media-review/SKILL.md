---
name: maser-media-review
description: Reviews maser-media (next-app) code for UX quality and records a visual demo after changes. Use when code in next-app is modified, when the user asks for a code review, or when preparing a demo of the website.
---

# Maser-Media Code Review & Demo

This skill runs a **UX-focused code review** and a **demo capture** for the maser-media Next.js site. Apply it after changes to `next-app/` or when the user requests a review or demo.

## When to Apply

- After edits to `next-app/src/**` (components, pages, styles)
- When the user says "review this," "check UX," or "record a demo"
- Before considering a change "done" on the maser-media site

---

## Part 1: Code Review (UX-First)

Review the changed files with **user experience** as the top priority.

### Checklist

- [ ] **Accessibility**: Focus order, ARIA where needed, keyboard nav, color contrast
- [ ] **Responsiveness**: Layout and typography at viewport breakpoints; no horizontal scroll on mobile
- [ ] **Performance**: Unnecessary re-renders, heavy assets, layout shift (CLS)
- [ ] **Interactions**: Loading states, errors, empty states; buttons/links have clear affordance
- [ ] **Content**: Copy is clear; headings establish hierarchy; no broken or placeholder text in UI
- [ ] **Consistency**: Matches existing patterns in `next-app` (components, spacing, theme)

### Output Format

Provide a short review:

```markdown
## Code review (UX)

- **Critical**: [Anything that hurts UX and must be fixed]
- **Suggestions**: [Improvements to consider]
- **OK**: [What already looks good]
```

Keep feedback actionable. Reference file and line when suggesting changes.

---

## Part 2: Demo Run & Recording

After the review (and after any critical fixes), run a **demo** so the change is visible and demonstrable.

### Prerequisites

1. **Dev server**: Ensure `next-app` is running. If not, run `npm run dev` from `next-app/` (in background if needed).
2. **Browser**: Use the cursor-ide-browser MCP to drive the site.

### Demo Flow

1. **Lock browser**: If a tab already exists, call `browser_lock` first. Otherwise `browser_navigate` to the app URL (e.g. `http://localhost:3000`), then lock.
2. **Navigate**: Open the app URL with `browser_navigate`; use `take_screenshot_afterwards: true` at key steps.
3. **Exercise changed areas**: Scroll, click, or interact with the sections/components that were modified.
4. **Capture at key steps**: Use `browser_take_screenshot` (and optionally `browser_snapshot`) at:
   - Initial load / hero
   - Any new or changed section
   - Critical interactions (e.g. pricing, CTA, nav)
5. **Unlock**: When done, call `browser_unlock`.

Save screenshots with clear names (e.g. `demo-hero.png`, `demo-pricing.png`) so they serve as a **visual demo log** of the change.

### Delivering a "Demo"

- **Screenshot sequence**: The set of saved screenshots, in order, is the **demo**. Summarize in a short note: "Demo captured: [list steps and screenshot filenames]."
- **Video**: Cursor cannot record video directly. If the user wants a real video:
  - Suggest they record while you drive the same flow (e.g. OBS, QuickTime, or browser DevTools recording).
  - Or add a Playwright test that runs the same flow and use `trace: 'on'` / video capture in CI for automated demo videos.

---

## Workflow Summary

1. Run **Part 1** (code review) on the changed files; fix any critical UX issues.
2. Start or confirm dev server for `next-app`.
3. Run **Part 2** (demo): navigate, interact, capture screenshots at key steps, unlock.
4. Report: review summary + "Demo captured: [steps and screenshot names]." Mention video option if the user wants a recorded video file.

---

## Project Context

- **App**: Next.js 16 in `next-app/`, React 19, TypeScript.
- **Notable areas**: Hero, Nav, Services, Work, Testimonials, Pricing (PricingPlans), CTA, Footer; horizontal scroll sections; theme (e.g. `data-theme`).
- **Rules**: Follow project `.cursorrules` (React/TS patterns) and existing `next-app` structure.
