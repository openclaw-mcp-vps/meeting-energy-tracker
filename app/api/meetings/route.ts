import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getDashboardStatsForUser,
  getEnergyTrendForUser,
  getMeetingsForUser
} from "@/lib/database";
import { PAID_COOKIE_NAME } from "@/lib/paywall";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to view meetings." }, { status: 401 });
  }

  const paidCookie = request.headers.get("cookie")?.includes(`${PAID_COOKIE_NAME}=1`);
  if (!paidCookie) {
    return NextResponse.json({ error: "Dashboard access requires an active purchase." }, { status: 402 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 120);

  const meetings = getMeetingsForUser(session.user.email, Number.isFinite(limit) ? Math.min(limit, 300) : 120);
  const trend = getEnergyTrendForUser(session.user.email, 45);
  const stats = getDashboardStatsForUser(session.user.email);

  return NextResponse.json({ meetings, trend, stats });
}
