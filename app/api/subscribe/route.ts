import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { tier, userId } = await req.json();

    const prices: Record<string, string> = {
      bronze: process.env.STRIPE_PRICE_BRONZE!,
      silver: process.env.STRIPE_PRICE_SILVER!,
      gold: process.env.STRIPE_PRICE_GOLD!,
    };

    const priceId = prices[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // 1. Get user from DB
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    let customerId = userData.stripe_customer_id;

    // 2. Create customer if missing
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
      });

      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // 3. Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
