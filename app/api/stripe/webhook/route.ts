import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // Required for raw body

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Price ID → tier mapping
const PRICE_TO_TIER: Record<string, string> = {
  "price_gold_id_here": "gold",
  "price_silver_id_here": "silver",
  "price_bronze_id_here": "bronze",
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.customer || !session.metadata?.userId) break;

        const subscriptionId = session.subscription as string;

        // Store subscription ID on user
        await supabase
          .from("profiles")
          .update({ stripe_subscription_id: subscriptionId })
          .eq("id", session.metadata.userId);

        break;
      }

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
          await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", user.id);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Reset tier to null
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (user) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: null })
            .eq("id", user.id);
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}

