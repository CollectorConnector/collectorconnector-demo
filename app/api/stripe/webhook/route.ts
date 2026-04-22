import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // Required for raw body parsing

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Supabase client (service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Stripe Price IDs → subscription tiers
const PRICE_TO_TIER: Record<string, string> = {
  "price_1TOjUxAcUN8e3s6cOHSP4HTV": "gold",
  "price_1TOjWfAcUN8e3s6crElb2AtF": "silver",
  "price_1TOjY6AcUN8e3s6cwArJilaR": "bronze",
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // ---------------------------------------------------------
      // 1️⃣ CHECKOUT COMPLETED (subscription checkout)
      // ---------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.customer || !session.metadata?.userId) break;

        const subscriptionId = session.subscription as string;

        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
          })
          .eq("id", session.metadata.userId);

        break;
      }

      // ---------------------------------------------------------
      // 2️⃣ SUBSCRIPTION CREATED / UPDATED
      // ---------------------------------------------------------
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const priceId = subscription.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] ?? null;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (user) {
          const periodEnd = new Date(subscription.current_period_end * 1000);

          await supabase
            .from("profiles")
            .update({
              subscription_tier: tier,
              stripe_subscription_id: subscription.id,
              is_active:
                subscription.status === "active" ||
                subscription.status === "trialing",
              current_period_end: periodEnd.toISOString(),
            })
            .eq("id", user.id);
        }

        break;
      }

      // ---------------------------------------------------------
      // 3️⃣ SUBSCRIPTION CANCELLED
      // ---------------------------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (user) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: null,
              is_active: false,
              current_period_end: null,
            })
            .eq("id", user.id);
        }

        break;
      }

      // ---------------------------------------------------------
      // 4️⃣ PAYMENT SUCCEEDED (renewal)
      // ---------------------------------------------------------
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // Optional: add analytics, emails, etc.
        console.log("💰 Subscription renewal paid:", invoice.id);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook handler error:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
