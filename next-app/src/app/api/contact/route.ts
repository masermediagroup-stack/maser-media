import { NextResponse } from "next/server";

import { createBookingEvent } from "@/lib/googleCalendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ContactPayload {
  service: string;
  brief: string;
  budget: string;
  firstName: string;
  email: string;
  phone: string;
  callDate: string;
  callTime: string;
  callTimezone?: string;
}

const SERVICE_IDS = new Set(["brand", "web", "copy", "strategy", "unsure"]);
const BUDGET_IDS = new Set([
  "under-1000",
  "1000-5000",
  "5000-15000",
  "15000-plus",
  "unsure",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{1,2}:\d{2}(am|pm)$/i;

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validationError = validate(payload);
  if (validationError) {
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
  }

  try {
    const result = await createBookingEvent({
      service: payload.service,
      brief: payload.brief,
      budget: payload.budget,
      firstName: payload.firstName,
      email: payload.email,
      phone: payload.phone ?? "",
      callDate: payload.callDate,
      callTime: payload.callTime,
      callTimezone: payload.callTimezone || "America/Chicago",
    });

    return NextResponse.json({ ok: true, eventId: result.eventId });
  } catch (error) {
    // Log to function logs so we can see it in Vercel; never leak provider
    // details to the client.
    console.error("[/api/contact] booking failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not book the call right now. Please try again, or email masermediagroup@gmail.com directly.",
      },
      { status: 502 },
    );
  }
}

function validate(payload: ContactPayload | null | undefined): string | null {
  if (!payload || typeof payload !== "object") return "Missing request body.";

  if (typeof payload.service !== "string" || !SERVICE_IDS.has(payload.service)) {
    return "Invalid service selection.";
  }
  if (typeof payload.brief !== "string" || payload.brief.trim().length === 0) {
    return "Please add a short project brief.";
  }
  if (payload.brief.length > 4000) {
    return "Project brief is too long (4000 character limit).";
  }
  if (typeof payload.budget !== "string" || !BUDGET_IDS.has(payload.budget)) {
    return "Invalid budget selection.";
  }
  if (typeof payload.firstName !== "string" || payload.firstName.trim().length === 0) {
    return "Please enter your first name.";
  }
  if (typeof payload.email !== "string" || !EMAIL_PATTERN.test(payload.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (typeof payload.callDate !== "string" || !DATE_PATTERN.test(payload.callDate)) {
    return "Please choose a date for the call.";
  }
  if (typeof payload.callTime !== "string" || !TIME_PATTERN.test(payload.callTime)) {
    return "Please choose a time for the call.";
  }
  if (payload.phone && typeof payload.phone !== "string") {
    return "Invalid phone value.";
  }

  return null;
}
