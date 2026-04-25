import { NextResponse } from "next/server";
import { parseStripeWebhookEvent, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";
import { recordPurchase } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();

  const valid = verifyStripeWebhookSignature(payload, signature, webhookSecret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = parseStripeWebhookEvent(payload);
  if (!event) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const dataObject = event.data.object;
    const sessionId = typeof dataObject.id === "string" ? dataObject.id : undefined;
    const customerDetails = dataObject.customer_details as { email?: unknown } | undefined;
    const customerEmail =
      (typeof customerDetails?.email === "string" ? customerDetails.email : undefined) ??
      (typeof dataObject.customer_email === "string" ? dataObject.customer_email : undefined);

    if (sessionId && customerEmail) {
      recordPurchase({
        email: customerEmail.toLowerCase(),
        checkoutSessionId: sessionId,
        source: "stripe-payment-link"
      });
    }
  }

  return NextResponse.json({ received: true });
}
