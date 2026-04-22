import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Supabase (service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { itemId, priceInPence, sellerId } = await req.json();

    // Fetch seller profile to determine their subscription tier + stripe account
    const { data: seller, error } = await supabase
      .from("profiles")
      .select("subscription_tier, stripe_account_id")
      .eq("id", sellerId)
      .single();

    if (error || !seller) {
      console.error("Seller not found:", error);
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (!seller.stripe_account_id) {
      console.error("Seller has no connected Stripe account");
      return NextResponse.json(
        { error: "Seller has no connected Stripe account" },
        { status: 400 }
      );
    }

    // Default fee = 8% (non-subscriber)
    let feePercentage = 0.08;

    if (seller.subscription_tier === "bronze") feePercentage = 0.07;
    if (seller.subscription_tier === "silver") feePercentage = 0.06;
    if (seller.subscription_tier === "gold") feePercentage = 0.05;

    const applicationFee = Math.round(priceInPence * feePercentage);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Purchase of item ${itemId}`,
            },
            unit_amount: priceInPence,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: seller.stripe_account_id, // seller’s connected account
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
