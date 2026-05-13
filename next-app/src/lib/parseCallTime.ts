/**
 * Maps the ContactFlow date + time picker output to local-naive RFC3339
 * strings suitable for Google Calendar's `start.dateTime` / `end.dateTime`
 * fields when paired with a `start.timeZone` (e.g. "America/Chicago").
 *
 * Inputs come from `ContactFlow.tsx`:
 *   callDate: "YYYY-MM-DD"  (e.g. "2026-05-20")
 *   callTime: "H:MMam|pm"   (e.g. "8:20am", "10:00am")
 *
 * Google interprets the returned string in the timezone we pass alongside it,
 * so there is no need to compute UTC offsets or worry about DST here.
 */

export interface ParsedCallWindow {
  startDateTime: string;
  endDateTime: string;
}

const CALL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CALL_TIME_PATTERN = /^(\d{1,2}):(\d{2})(am|pm)$/i;
const CALL_DURATION_MINUTES = 20;

export function parseCallTime(callDate: string, callTime: string): ParsedCallWindow {
  if (!CALL_DATE_PATTERN.test(callDate)) {
    throw new Error(`Invalid callDate: expected YYYY-MM-DD, got "${callDate}"`);
  }

  const timeMatch = CALL_TIME_PATTERN.exec(callTime.trim());
  if (!timeMatch) {
    throw new Error(`Invalid callTime: expected H:MMam|pm, got "${callTime}"`);
  }

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const meridiem = timeMatch[3].toLowerCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    throw new Error(`Invalid callTime values: "${callTime}"`);
  }

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const [yearStr, monthStr, dayStr] = callDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const startDateTime = formatLocalNaive(year, month, day, hour, minute);
  const end = addMinutes(year, month, day, hour, minute, CALL_DURATION_MINUTES);
  const endDateTime = formatLocalNaive(end.year, end.month, end.day, end.hour, end.minute);

  return { startDateTime, endDateTime };
}

function addMinutes(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  deltaMinutes: number,
): { year: number; month: number; day: number; hour: number; minute: number } {
  const baseUTC = Date.UTC(year, month - 1, day, hour, minute);
  const shifted = new Date(baseUTC + deltaMinutes * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function formatLocalNaive(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  return (
    `${String(year).padStart(4, "0")}-${pad(month)}-${pad(day)}T` +
    `${pad(hour)}:${pad(minute)}:00`
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
