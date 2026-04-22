import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Supabase client (browser-safe)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRICES = {
  bronze: "price_1TOjY6AcUN8e3s6cwArJilaR",
  silver: "price_1TOjWfAcUN8e3s6crElb2AtF",
  gold: "price_1TOjUxAcUN8e3s6cOHSP4HTV",
} as const;

export async function POST(req: NextRequest) {
  try {
    const { tier } = await req.json();

    const priceId = PRICES[tier as keyof typeof PRICES];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        userId: user.id, // CRITICAL for webhook
      },
      customer_creation: "always",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
