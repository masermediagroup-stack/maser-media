import { google } from "googleapis";

import { parseCallTime } from "./parseCallTime";

export interface BookingInput {
  service: string;
  brief: string;
  budget: string;
  firstName: string;
  email: string;
  phone: string;
  callDate: string;
  callTime: string;
  callTimezone: string;
}

export interface BookingResult {
  eventId: string;
  htmlLink: string | null | undefined;
}

/**
 * Inserts a real event on the owner's primary Google Calendar with the client
 * as a co-attendee and asks Google to send the invite + reminders + updates
 * directly. Returns the event id so the caller can log or surface it.
 *
 * Requires four env vars: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
 * GOOGLE_OAUTH_REFRESH_TOKEN, CONTACT_TO_EMAIL.
 */
export async function createBookingEvent(input: BookingInput): Promise<BookingResult> {
  const {
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REFRESH_TOKEN,
    CONTACT_TO_EMAIL,
  } = process.env;

  if (
    !GOOGLE_OAUTH_CLIENT_ID ||
    !GOOGLE_OAUTH_CLIENT_SECRET ||
    !GOOGLE_OAUTH_REFRESH_TOKEN ||
    !CONTACT_TO_EMAIL
  ) {
    throw new Error(
      "Missing Google Calendar env vars (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, CONTACT_TO_EMAIL).",
    );
  }

  const { startDateTime, endDateTime } = parseCallTime(input.callDate, input.callTime);

  const oauth2 = new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });

  const calendar = google.calendar({ version: "v3", auth: oauth2 });

  const description = [
    `Service:  ${input.service}`,
    `Budget:   ${input.budget}`,
    `Name:     ${input.firstName}`,
    `Email:    ${input.email}`,
    `Phone:    ${input.phone || "(not provided)"}`,
    "",
    "Brief:",
    input.brief.trim() || "(none)",
    "",
    "Booked via maser-media contact form.",
  ].join("\n");

  const response = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: `Intro Call — ${input.firstName} (${input.service})`,
      description,
      start: { dateTime: startDateTime, timeZone: input.callTimezone },
      end: { dateTime: endDateTime, timeZone: input.callTimezone },
      attendees: [
        { email: CONTACT_TO_EMAIL },
        { email: input.email, displayName: input.firstName },
      ],
      reminders: { useDefault: true },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
    },
  });

  const eventId = response.data.id;
  if (!eventId) {
    throw new Error("Google Calendar API returned no event id.");
  }

  return { eventId, htmlLink: response.data.htmlLink };
}
