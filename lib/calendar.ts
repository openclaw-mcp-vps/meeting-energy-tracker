import { Client } from "@microsoft/microsoft-graph-client";
import { google } from "googleapis";

export interface CalendarMeeting {
  externalId: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  attendeeCount: number;
  isRecurring: boolean;
}

function calculateDurationMinutes(startTime: string, endTime: string) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 30;
  }

  return Math.max(15, Math.round((end - start) / (1000 * 60)));
}

function normalizeDateTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    const withUtc = new Date(`${value}Z`);
    if (Number.isNaN(withUtc.getTime())) {
      return null;
    }
    return withUtc.toISOString();
  }

  return parsed.toISOString();
}

async function fetchGoogleMeetings(accessToken: string): Promise<CalendarMeeting[]> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const now = new Date();
  const past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();

  const result = await calendar.events.list({
    calendarId: "primary",
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
    timeMin: past,
    timeMax: future
  });

  const items = result.data.items ?? [];

  return items
    .filter((item) => item.status !== "cancelled" && item.id)
    .map((item) => {
      const start = normalizeDateTime(item.start?.dateTime ?? undefined);
      const end = normalizeDateTime(item.end?.dateTime ?? undefined);

      if (!start || !end) {
        return null;
      }

      return {
        externalId: item.id as string,
        title: item.summary?.trim() || "Untitled meeting",
        startTime: start,
        endTime: end,
        durationMinutes: calculateDurationMinutes(start, end),
        attendeeCount: item.attendees?.length ?? 1,
        isRecurring: Boolean(item.recurrence?.length)
      } satisfies CalendarMeeting;
    })
    .filter((item): item is CalendarMeeting => Boolean(item));
}

async function fetchOutlookMeetings(accessToken: string): Promise<CalendarMeeting[]> {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  const now = new Date();
  const past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();

  const result = await client
    .api("/me/calendarView")
    .query({
      startDateTime: past,
      endDateTime: future,
      $top: "250",
      $orderby: "start/dateTime"
    })
    .get();

  const items: Array<Record<string, unknown>> = Array.isArray(result?.value) ? result.value : [];

  return items
    .map((item) => {
      const startRaw = (item.start as { dateTime?: string } | undefined)?.dateTime;
      const endRaw = (item.end as { dateTime?: string } | undefined)?.dateTime;
      const start = normalizeDateTime(startRaw);
      const end = normalizeDateTime(endRaw);

      if (!start || !end || typeof item.id !== "string") {
        return null;
      }

      return {
        externalId: item.id,
        title: typeof item.subject === "string" && item.subject.trim() ? item.subject : "Untitled meeting",
        startTime: start,
        endTime: end,
        durationMinutes: calculateDurationMinutes(start, end),
        attendeeCount: Array.isArray(item.attendees) ? item.attendees.length : 1,
        isRecurring: Boolean(item.recurrence)
      } satisfies CalendarMeeting;
    })
    .filter((item): item is CalendarMeeting => Boolean(item));
}

export async function fetchMeetingsFromCalendar(provider: string, accessToken: string) {
  if (provider === "google") {
    return fetchGoogleMeetings(accessToken);
  }

  if (provider === "azure-ad" || provider === "microsoft") {
    return fetchOutlookMeetings(accessToken);
  }

  throw new Error("Unsupported calendar provider. Connect Google or Outlook from the sign-in page.");
}
