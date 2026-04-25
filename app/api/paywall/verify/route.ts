import { z } from "zod";
import { NextResponse } from "next/server";
import { hasPaidEmail } from "@/lib/database";
import {
  COOKIE_MAX_AGE_SECONDS,
  PAID_COOKIE_NAME,
  PAID_EMAIL_COOKIE_NAME
} from "@/lib/paywall";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid billing email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const paid = hasPaidEmail(email);

  if (!paid) {
    return NextResponse.json(
      {
        error:
          "No completed Stripe checkout was found for this email yet. If payment was recent, wait 30-60 seconds and retry."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: PAID_COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  });

  response.cookies.set({
    name: PAID_EMAIL_COOKIE_NAME,
    value: email,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  });

  return response;
}
