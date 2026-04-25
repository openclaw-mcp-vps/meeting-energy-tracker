import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchMeetingsFromCalendar } from "@/lib/calendar";
import { upsertMeetings } from "@/lib/database";
import { PAID_COOKIE_NAME } from "@/lib/paywall";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in before syncing your calendar." }, { status: 401 });
  }

  const paidCookie = request.headers.get("cookie")?.includes(`${PAID_COOKIE_NAME}=1`);
  if (!paidCookie) {
    return NextResponse.json({ error: "Complete purchase to access calendar sync." }, { status: 402 });
  }

  if (!session.accessToken || !session.provider) {
    return NextResponse.json(
      {
        error:
          "Calendar sync requires a Google or Outlook OAuth session. Sign in with one of those providers instead of email-only login."
      },
      { status: 400 }
    );
  }

  try {
    const meetings = await fetchMeetingsFromCalendar(session.provider, session.accessToken);
    const syncedCount = upsertMeetings(session.user.email, session.provider, meetings);

    return NextResponse.json({
      syncedCount,
      message: `Synced ${syncedCount} meetings from ${session.provider}.`
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Calendar sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
