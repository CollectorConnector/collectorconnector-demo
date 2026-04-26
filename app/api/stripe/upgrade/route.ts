// Force Node.js runtime so Supabase + Stripe work correctly
export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Use ANON KEY — safe for reading profiles, avoids service-role failures
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRICE_IDS: Record<string, string | undefined> = {
  bronze: process.env.STRIPE_BRONZE_PRICE_ID,
  silver: process.env.STRIPE_SILVER_PRICE_ID,
  gold: process.env.STRIPE_GOLD_PRICE_ID,
};

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan");

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: "Invalid or missing plan" }, { status: 400 });
    }

    // 1. Get user ID from header (sent by frontend)
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // 2. Fetch user profile
    const { data: user, error } = await supabase
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // 3. Create Stripe customer if missing
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });

      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // 4. Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe upgrade error:", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
