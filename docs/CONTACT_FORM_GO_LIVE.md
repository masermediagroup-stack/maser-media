# Contact form go-live checklist (post-merge)

**Status:** The contact form + Google Calendar API code is already on `main`. Nothing else needs to be merged. You only need Google OAuth credentials, Vercel environment variables, and a production redeploy.

Use this checklist now. For full Google Cloud screenshots and OAuth Playground detail, see [CONTACT_FORM_SETUP.md](./CONTACT_FORM_SETUP.md).

---

## Quick reference

| What | Where |
| --- | --- |
| Contact page | `/contact` |
| API route | `next-app/src/app/api/contact/route.ts` |
| Calendar helper | `next-app/src/lib/googleCalendar.ts` |
| Env template | `next-app/.env.local.example` |
| Vercel project | Maser Media site (same repo) |

**Four required env vars (Production at minimum):**

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `CONTACT_TO_EMAIL` → `masermediagroup@gmail.com`

---

## Step 1 — Confirm code is live on main

You should already have these on `main` after the merge:

- `next-app/src/app/api/contact/route.ts`
- `next-app/src/lib/googleCalendar.ts`
- `next-app/src/lib/parseCallTime.ts`
- Updated `next-app/src/components/ContactFlow.tsx`
- `docs/CONTACT_FORM_SETUP.md`

If any are missing, the merge did not complete — stop and fix git before continuing.

---

## Step 2 — Google Cloud + OAuth (condensed)

Do this once while signed in as `masermediagroup@gmail.com`.

1. **Project** — [Google Cloud Console](https://console.cloud.google.com/) → New project (e.g. `Maser Media Contact`).
2. **API** — APIs & Services → Library → enable **Google Calendar API**.
3. **Consent screen** — OAuth consent screen → External → fill app name/emails → add scope `.../auth/calendar.events` → add test user `masermediagroup@gmail.com` → **Publish app** (In production).
4. **OAuth client** — Credentials → Create OAuth client ID → Web application → add redirect URI:
   ```
   https://developers.google.com/oauthplayground
   ```
   Save **Client ID** and **Client secret**.
5. **Refresh token** — [OAuth Playground](https://developers.google.com/oauthplayground/) → gear icon → **Use your own OAuth credentials** → paste client ID/secret → scope:
   ```
   https://www.googleapis.com/auth/calendar.events
   ```
   → Authorize as `masermediagroup@gmail.com` → Exchange code for tokens → copy **`refresh_token`**.

If `refresh_token` is missing, revoke the app at [Google Account permissions](https://myaccount.google.com/permissions) and repeat step 5.

Full walkthrough: [CONTACT_FORM_SETUP.md](./CONTACT_FORM_SETUP.md) Steps 1–5.

---

## Step 3 — Add environment variables in Vercel

1. Open the Vercel project → **Settings** → **Environment Variables**.
2. Add all four variables. For go-live, **Production** is required. Preview/Development are optional but useful for testing.

   | Key | Value |
   | --- | --- |
   | `GOOGLE_OAUTH_CLIENT_ID` | From OAuth client |
   | `GOOGLE_OAUTH_CLIENT_SECRET` | From OAuth client |
   | `GOOGLE_OAUTH_REFRESH_TOKEN` | From OAuth Playground |
   | `CONTACT_TO_EMAIL` | `masermediagroup@gmail.com` |

3. **Save** each variable.

**Important:** Changing env vars does not update a running deployment. You must redeploy (Step 4).

---

## Step 4 — Redeploy production

1. Vercel project → **Deployments**.
2. On the latest **Production** deployment from `main`, open **⋯** → **Redeploy** (or push any commit to `main` to trigger a new build).
3. Wait until the deployment status is **Ready**.

Preview deployments are optional now that `main` has the code. Production is what visitors use; only Production needs the four vars for the live site to book calls.

---

## Step 5 — Test on production

1. Open your **production** URL (not localhost): `https://<your-domain>/contact`.
2. Complete the five-step form with an email you control.
3. Submit and confirm:
   - Success UI: “You're on the calendar” (or equivalent success state).
   - Google Calendar invite arrives at your test email within ~30 seconds.
   - Event appears on `masermediagroup@gmail.com` primary calendar with both attendees.
4. If it fails, go to Step 6.

**Optional local test:** Copy `next-app/.env.local.example` → `next-app/.env.local`, paste the same four values, run `npm run dev` from repo root, test `http://localhost:3000/contact`.

---

## Step 6 — Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| 500 on submit / generic error | Env vars missing on **Production** | Re-check Step 3; redeploy Step 4 |
| “Invalid grant” / token errors | Bad or revoked refresh token | Repeat OAuth Playground (Step 2.5); update `GOOGLE_OAUTH_REFRESH_TOKEN`; redeploy |
| Success UI but no calendar event | Wrong Google account consented | Mint token while logged in as `masermediagroup@gmail.com` |
| Works locally, not production | Vars only in Development | Add vars to **Production**; redeploy |
| 400 validation errors | Form payload issue | Check date `YYYY-MM-DD` and time `H:MMam/pm` in browser network tab |

**Logs:** Vercel → project → **Logs** → filter route `/api/contact` → reproduce submit → read stack trace.

**Never commit:** `.env.local` or real secrets (already gitignored).

---

## Done checklist

- [ ] All four env vars set in Vercel **Production**
- [ ] Production redeployed after env changes
- [ ] Test booking on `https://<production-domain>/contact`
- [ ] Invite received; event on owner calendar

---

## Related docs

- [CONTACT_FORM_SETUP.md](./CONTACT_FORM_SETUP.md) — full Google Cloud + OAuth Playground guide
- [AGENCY_WEBSITE_PLAYBOOK.md](./AGENCY_WEBSITE_PLAYBOOK.md) — general agency site patterns
