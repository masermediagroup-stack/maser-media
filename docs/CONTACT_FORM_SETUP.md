# Contact form -> Google Calendar setup

The site's contact form (`/contact`, wired through `next-app/src/components/ContactFlow.tsx`) submits to `next-app/src/app/api/contact/route.ts`, which uses the Google Calendar API to create a real event on `masermediagroup@gmail.com`'s primary calendar with the prospective client as a co-attendee. Google itself then sends the invite, reminders, and any reschedule update emails.

This document walks through the one-time setup so the form actually books calls.

---

## What you need

- Access to the `masermediagroup@gmail.com` Google account (or the Google account that should own the bookings).
- Access to the Vercel project where the site is deployed.
- Roughly 15 minutes.

The end result is four environment variables that go into Vercel:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `CONTACT_TO_EMAIL` (= `masermediagroup@gmail.com`)

---

## Step 1 - Create a Google Cloud project

1. Sign in to <https://console.cloud.google.com/> as `masermediagroup@gmail.com`.
2. Top bar -> project dropdown -> **New Project**.
3. Name: `Maser Media Contact`. Leave organization as is. Click **Create**.
4. After it provisions, make sure the new project is selected in the top bar.

## Step 2 - Enable the Google Calendar API

1. Left nav -> **APIs & Services** -> **Library**.
2. Search "Google Calendar API" -> open it -> **Enable**.

## Step 3 - Configure the OAuth consent screen

1. Left nav -> **APIs & Services** -> **OAuth consent screen**.
2. Choose **External** -> **Create**.
3. App information:
   - App name: `Maser Media Contact`
   - User support email: `masermediagroup@gmail.com`
   - Developer contact email: `masermediagroup@gmail.com`
   - App logo, app domain, etc. can stay blank for now.
4. **Save and Continue**.
5. **Scopes** screen -> **Add or remove scopes** -> filter for `calendar.events` -> tick `.../auth/calendar.events` -> **Update**. Save and Continue.
6. **Test users** screen -> **Add users** -> add `masermediagroup@gmail.com`. Save and Continue.
7. **Summary** -> **Back to dashboard**.
8. On the consent screen dashboard, click **Publish app** -> confirm.
   - Status flips from "Testing" to "In production".
   - You do **not** need Google to verify the app, because only the owner consents and only the `calendar.events` scope is requested. Users see a one-time "Google hasn't verified this app" warning that you click through with **Advanced -> Go to (app name)** the first time you consent. Once a refresh token is minted, future requests work silently.

## Step 4 - Create an OAuth Client ID

1. Left nav -> **APIs & Services** -> **Credentials**.
2. **+ Create credentials** -> **OAuth client ID**.
3. Application type: **Web application**.
4. Name: `Maser Media Contact Web Client`.
5. Authorized redirect URIs -> **+ Add URI** -> paste:
   ```
   https://developers.google.com/oauthplayground
   ```
6. **Create**.
7. A dialog appears with **Client ID** and **Client secret**. Copy both - this is the only time the secret is shown in plain text.
   - `Client ID` -> `GOOGLE_OAUTH_CLIENT_ID`
   - `Client secret` -> `GOOGLE_OAUTH_CLIENT_SECRET`

## Step 5 - Mint a refresh token via OAuth Playground

1. Open <https://developers.google.com/oauthplayground/> in the same browser session as `masermediagroup@gmail.com`.
2. Click the gear icon (top right) -> tick **Use your own OAuth credentials**.
3. Paste the **Client ID** and **Client secret** from Step 4. Close the panel.
4. In the **Step 1** scope list on the left, paste this into the "Input your own scopes" box:
   ```
   https://www.googleapis.com/auth/calendar.events
   ```
5. Click **Authorize APIs**.
6. Sign in as `masermediagroup@gmail.com`. When the "Google hasn't verified this app" warning appears, click **Advanced -> Go to Maser Media Contact (unsafe)**. Then **Continue** to allow the calendar.events scope.
7. You are redirected back to OAuth Playground with an authorization code prefilled in **Step 2**.
8. Click **Exchange authorization code for tokens**.
9. The right-hand response panel now shows a `refresh_token`. Copy that value.
   - `refresh_token` -> `GOOGLE_OAUTH_REFRESH_TOKEN`

> If `refresh_token` is missing, revoke the app at <https://myaccount.google.com/permissions> and repeat Step 5; Google only returns a fresh refresh token on the very first consent.

## Step 6 - Add the env vars to Vercel

1. Open the project in Vercel.
2. **Settings** -> **Environment Variables**.
3. Add four variables. Tick **Production**, **Preview**, and **Development** for each:
   | Key | Value |
   | --- | --- |
   | `GOOGLE_OAUTH_CLIENT_ID` | (from Step 4) |
   | `GOOGLE_OAUTH_CLIENT_SECRET` | (from Step 4) |
   | `GOOGLE_OAUTH_REFRESH_TOKEN` | (from Step 5) |
   | `CONTACT_TO_EMAIL` | `masermediagroup@gmail.com` |
4. **Save**.

Re-deploy the project (or merge a new commit) so the new env vars are picked up.

## Step 7 - Test it

1. On the Vercel Preview deployment for the contact-form PR, open `/contact`.
2. Walk through the five-step form using a throwaway email address you own.
3. Submit. You should:
   - See the "You're on the calendar" success screen.
   - Receive a Google Calendar invite at the throwaway address within seconds.
   - See a new event on `masermediagroup@gmail.com`'s primary calendar with both attendees.
4. If something fails, check Vercel function logs (Vercel project -> **Logs** tab -> filter by `/api/contact`).

## Local development

For `npm run dev`, copy `next-app/.env.local.example` to `next-app/.env.local` and paste the same four values. Next.js loads `.env.local` automatically. Never commit `.env.local` (it is gitignored).

## Operational notes

- Time zone is hardcoded to `America/Chicago`. If the studio moves regions, lift this into an env var.
- Default booking duration is 20 minutes (see `CALL_DURATION_MINUTES` in `next-app/src/lib/parseCallTime.ts`).
- Reminders are Google's defaults for the owner's calendar (email + popup). Adjust on the calendar event template or per-event in `next-app/src/lib/googleCalendar.ts`.
- If the refresh token ever stops working (rare; happens if the user revokes the app or changes their Google password and Google decides to invalidate tokens), repeat Step 5 and update `GOOGLE_OAUTH_REFRESH_TOKEN` in Vercel.

## Future hardening (not built in v1)

- Free/busy check against the owner's calendar so already-booked times disappear from the picker.
- Bot/spam protection (Cloudflare Turnstile or hCaptcha) before the route handler hits Google.
- Persist leads to a database for follow-up, separate from the calendar event.
- A separate branded confirmation email via Resend with a verified sender domain.
