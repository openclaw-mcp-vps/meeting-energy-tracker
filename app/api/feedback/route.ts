import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveFeedbackForMeeting } from "@/lib/database";
import { PAID_COOKIE_NAME } from "@/lib/paywall";

export const runtime = "nodejs";

const feedbackSchema = z.object({
  meetingId: z.string().min(1),
  energyScore: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().default("")
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to submit feedback." }, { status: 401 });
  }

  const paidCookie = request.headers.get("cookie")?.includes(`${PAID_COOKIE_NAME}=1`);
  if (!paidCookie) {
    return NextResponse.json({ error: "Feedback collection requires an active purchase." }, { status: 402 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
  }

  saveFeedbackForMeeting({
    meetingId: parsed.data.meetingId,
    userEmail: session.user.email,
    energyScore: parsed.data.energyScore,
    notes: parsed.data.notes
  });

  return NextResponse.json({ ok: true });
}
